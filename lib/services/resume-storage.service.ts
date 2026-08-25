import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'resumes')
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export class ResumeUploadError extends Error {}

export async function saveResumeFile(userId: string, file: File): Promise<{ fileUrl: string; fileName: string }> {
  if (file.type !== 'application/pdf') {
    throw new ResumeUploadError('Only PDF files are supported.')
  }
  if (file.size === 0) {
    throw new ResumeUploadError('The uploaded file is empty.')
  }
  if (file.size > MAX_BYTES) {
    throw new ResumeUploadError('Résumé must be smaller than 5MB.')
  }

  await mkdir(UPLOAD_ROOT, { recursive: true })

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100)
  const storedName = `${userId}-${randomUUID()}-${safeName}`
  const destPath = path.join(UPLOAD_ROOT, storedName)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(destPath, buffer)

  return { fileUrl: `/uploads/resumes/${storedName}`, fileName: file.name }
}

export async function deleteResumeFile(fileUrl: string): Promise<void> {
  const storedName = path.basename(fileUrl)
  const destPath = path.join(UPLOAD_ROOT, storedName)
  await unlink(destPath).catch(() => undefined)
}
