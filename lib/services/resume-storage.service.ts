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

export function activeStorageDriver(): StorageDriver {
  return process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'local'
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
    const { put } = await import('@vercel/blob')
    const { url } = await put(`resumes/${storedName}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { fileUrl: url, fileName: file.name, buffer }
  }

  await mkdir(UPLOAD_ROOT, { recursive: true })
  await writeFile(path.join(UPLOAD_ROOT, storedName), buffer)
  return { fileUrl: `/uploads/resumes/${storedName}`, fileName: file.name, buffer }
}

export async function deleteResumeFile(fileUrl: string): Promise<void> {
  if (fileUrl.startsWith('http')) {
    const { del } = await import('@vercel/blob')
    await del(fileUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => undefined)
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
