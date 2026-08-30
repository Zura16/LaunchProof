import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db/prisma'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export class ResumeUploadError extends Error {}

/**
 * The only module in the app that persists user files.
 *
 * Two drivers:
 *   - `blob`     — object storage, used when a Blob token is configured.
 *                  The right choice at scale: files never touch the database.
 *   - `database` — the PDF's bytes in Postgres. The default, because it works
 *                  on every deployment with no additional configuration.
 *
 * There is deliberately no local-filesystem driver any more. Serverless
 * filesystems are read-only outside /tmp and wiped between requests, so
 * writing uploads to disk worked in development and crashed in production
 * with EROFS — the worst kind of difference between environments.
 *
 * The stored PDF is a fallback: text is extracted at upload time and kept on
 * the Resume row, so nothing depends on retrieving the binary in normal use.
 */
export type StorageDriver = 'blob' | 'database'

/**
 * Vercel injects a Blob store's token as BLOB_READ_WRITE_TOKEN, but prefixes
 * it (e.g. RESUMES_BLOB_READ_WRITE_TOKEN) when connected under a custom
 * prefix. Accept either, and treat an empty value as absent — a connected
 * store can inject the name with no value, which is exactly what happened on
 * this deployment.
 */
export function blobToken(): string | undefined {
  const direct = process.env.BLOB_READ_WRITE_TOKEN
  if (direct && direct.trim()) return direct
  const key = Object.keys(process.env).find(
    (k) => k.endsWith('BLOB_READ_WRITE_TOKEN') && (process.env[k] ?? '').trim().length > 0
  )
  return key ? process.env[key] : undefined
}

export function activeStorageDriver(): StorageDriver {
  return blobToken() ? 'blob' : 'database'
}

/** Uploads work on every deployment now; kept so callers can stay explicit. */
export function resumeUploadsAvailable(): boolean {
  return true
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

export interface StoredResume {
  /** A blob URL, or `db:<uuid>` when the bytes live in Postgres. */
  fileUrl: string
  fileName: string
  /** The file's bytes, so callers can parse without a second round trip. */
  buffer: Buffer
}

export async function saveResumeFile(userId: string, file: File): Promise<StoredResume> {
  validate(file)

  const buffer = Buffer.from(await file.arrayBuffer())
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100)
  const storedName = `${userId}-${randomUUID()}-${safeName}`

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

  // Database driver: the bytes are attached by persistResumeBytes once the
  // Resume row exists, since ResumeFile is keyed on it.
  return { fileUrl: `db:${randomUUID()}`, fileName: file.name, buffer }
}

/** Attach the uploaded bytes to a Resume when using the database driver. */
export async function persistResumeBytes(resumeId: string, fileUrl: string, buffer: Buffer): Promise<void> {
  if (!fileUrl.startsWith('db:')) return
  await prisma.resumeFile.upsert({
    where: { resumeId },
    update: { data: buffer, byteSize: buffer.length },
    create: { resumeId, data: buffer, byteSize: buffer.length },
  })
}

export async function deleteResumeFile(fileUrl: string): Promise<void> {
  if (fileUrl.startsWith('http')) {
    const { del } = await import('@vercel/blob')
    await del(fileUrl, { token: blobToken() }).catch(() => undefined)
  }
  // Database-stored bytes cascade with the Resume row.
}

/**
 * Read a previously stored résumé back.
 *
 * Only needed when re-analyzing a résumé whose extracted text is missing —
 * uploads parse from the in-memory buffer and never hit this path.
 */
export async function readResumeFile(fileUrl: string, resumeId?: string): Promise<Buffer> {
  if (fileUrl.startsWith('http')) {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new ResumeUploadError('The stored résumé could not be retrieved.')
    }
    return Buffer.from(await response.arrayBuffer())
  }

  if (!resumeId) {
    throw new ResumeUploadError('The stored résumé could not be located.')
  }
  const row = await prisma.resumeFile.findUnique({ where: { resumeId }, select: { data: true } })
  if (!row) {
    throw new ResumeUploadError('The stored résumé could not be found.')
  }
  return Buffer.from(row.data)
}
