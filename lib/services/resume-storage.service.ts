import { mkdir, writeFile, unlink, readFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'resumes')
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export class ResumeUploadError extends Error {}

/**
 * The only module in the app that persists user files.
 *
 * Two drivers, selected by environment:
 *   - `blob`  — Vercel Blob, used when BLOB_READ_WRITE_TOKEN is present.
 *               Required on serverless hosts, where the filesystem is
 *               ephemeral and per-invocation: a file written during upload
 *               is gone by the next request.
 *   - `local` — local disk, the default for development and any host with
 *               a persistent volume.
 *
 * Adding another backend (S3, R2, Supabase) means implementing the three
 * functions below for it; nothing outside this file touches storage.
 */
export type StorageDriver = 'blob' | 'local'

/**
 * Vercel injects a Blob store's token as BLOB_READ_WRITE_TOKEN, but prefixes
 * it (e.g. RESUMES_BLOB_READ_WRITE_TOKEN) when the store is connected under a
 * custom prefix. Accept either, so connecting a store just works instead of
 * silently leaving uploads disabled.
 */
export function blobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN
  const key = Object.keys(process.env).find((k) => k.endsWith('BLOB_READ_WRITE_TOKEN'))
  return key ? process.env[key] : undefined
}

export function activeStorageDriver(): StorageDriver {
  return blobToken() ? 'blob' : 'local'
}

/**
 * Serverless platforms ship a read-only filesystem outside /tmp, so the local
 * driver cannot work there. Detecting it lets uploads fail with an
 * explanation instead of an EROFS crash the user cannot act on.
 */
function isServerlessRuntime(): boolean {
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.NETLIFY
}

/** Whether this deployment can actually persist an uploaded file. */
export function resumeUploadsAvailable(): boolean {
  return activeStorageDriver() === 'blob' || !isServerlessRuntime()
}

function validate(file: File): void {
  if (file.type !== 'application/pdf') {
    throw new ResumeUploadError('Only PDF files are supported.')
  }
  if (file.size === 0) {
    throw new ResumeUploadError('The uploaded file is empty.')
  }
  if (file.size > MAX_BYTES) {
    throw new ResumeUploadError('Résumé must be smaller than 5MB.')
  }
}

function storedNameFor(userId: string, originalName: string): string {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100)
  return `${userId}-${randomUUID()}-${safeName}`
}

export interface StoredResume {
  /** Local driver: a `/uploads/resumes/...` path. Blob driver: an absolute URL. */
  fileUrl: string
  fileName: string
  /** The file's bytes, so callers can parse without a second round trip. */
  buffer: Buffer
}

export async function saveResumeFile(userId: string, file: File): Promise<StoredResume> {
  validate(file)

  const buffer = Buffer.from(await file.arrayBuffer())
  const storedName = storedNameFor(userId, file.name)

  if (activeStorageDriver() === 'blob') {
    try {
      const { put } = await import('@vercel/blob')
      const { url } = await put(`resumes/${storedName}`, buffer, {
        access: 'public',
        contentType: 'application/pdf',
        token: blobToken(),
      })
      return { fileUrl: url, fileName: file.name, buffer }
    } catch (e) {
      throw new ResumeUploadError(
        `Object storage rejected the upload: ${e instanceof Error ? e.message : 'unknown error'}`
      )
    }
  }

  if (isServerlessRuntime()) {
    throw new ResumeUploadError(
      'Résumé uploads are not configured on this deployment. Its filesystem is temporary, so files must go to object storage — set BLOB_READ_WRITE_TOKEN. Everything else in LaunchProof works without it.'
    )
  }

  try {
    await mkdir(UPLOAD_ROOT, { recursive: true })
    await writeFile(path.join(UPLOAD_ROOT, storedName), buffer)
  } catch (e) {
    // A filesystem failure is a deployment problem, not something the student
    // did wrong — surface it as a recoverable upload error rather than an
    // unhandled crash.
    const code = (e as NodeJS.ErrnoException)?.code
    throw new ResumeUploadError(
      code === 'EROFS' || code === 'EACCES' || code === 'EPERM'
        ? 'This deployment cannot write uploaded files to disk. Configure object storage (BLOB_READ_WRITE_TOKEN) to enable résumé uploads.'
        : 'The résumé could not be saved. Please try again.'
    )
  }

  return { fileUrl: `/uploads/resumes/${storedName}`, fileName: file.name, buffer }
}

export async function deleteResumeFile(fileUrl: string): Promise<void> {
  if (fileUrl.startsWith('http')) {
    const { del } = await import('@vercel/blob')
    await del(fileUrl, { token: blobToken() }).catch(() => undefined)
    return
  }

  const destPath = path.join(UPLOAD_ROOT, path.basename(fileUrl))
  await unlink(destPath).catch(() => undefined)
}

/**
 * Read a previously stored résumé back.
 *
 * Only needed when re-analyzing a résumé whose extracted text is missing —
 * uploads parse from the in-memory buffer and never hit this path.
 */
export async function readResumeFile(fileUrl: string): Promise<Buffer> {
  if (fileUrl.startsWith('http')) {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new ResumeUploadError('The stored résumé could not be retrieved.')
    }
    return Buffer.from(await response.arrayBuffer())
  }

  return readFile(path.join(UPLOAD_ROOT, path.basename(fileUrl)))
}
