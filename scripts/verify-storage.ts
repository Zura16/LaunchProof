import { readFile } from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import {
  saveResumeFile,
  deleteResumeFile,
  readResumeFile,
  persistResumeBytes,
  activeStorageDriver,
  ResumeUploadError,
} from '@/lib/services/resume-storage.service'

const prisma = new PrismaClient()
import { extractPdfTextFromBuffer, extractPdfText, PdfExtractionError } from '@/lib/services/pdf-text.service'

function assert(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

function fileFrom(buffer: Buffer, name: string, type: string): File {
  return new File([new Uint8Array(buffer)], name, { type })
}

async function main() {
  console.log(`active storage driver: ${activeStorageDriver()}\n`)

  const source = process.argv[2]
  if (!source) {
    console.error('usage: verify-storage <path-to-a-pdf>')
    process.exit(1)
  }
  const pdfBytes = await readFile(source)

  // --- Validation rejects what it should, before anything is stored ---
  await saveResumeFile('u1', fileFrom(pdfBytes, 'x.txt', 'text/plain'))
    .then(() => assert('non-PDF rejected', false))
    .catch((e) => assert('non-PDF rejected', e instanceof ResumeUploadError))

  await saveResumeFile('u1', fileFrom(Buffer.alloc(0), 'empty.pdf', 'application/pdf'))
    .then(() => assert('empty file rejected', false))
    .catch((e) => assert('empty file rejected', e instanceof ResumeUploadError))

  await saveResumeFile('u1', fileFrom(Buffer.alloc(6 * 1024 * 1024), 'big.pdf', 'application/pdf'))
    .then(() => assert('oversized file rejected', false))
    .catch((e) => assert('oversized file rejected', e instanceof ResumeUploadError))

  // --- Round trip through a real Resume row ---
  const user = await prisma.user.create({ data: { email: `storage-${Date.now()}@example.test` } })
  const stored = await saveResumeFile(user.id, fileFrom(pdfBytes, 'My Résumé (final).pdf', 'application/pdf'))
  const resume = await prisma.resume.create({
    data: { userId: user.id, fileName: stored.fileName, fileUrl: stored.fileUrl, rawText: 'x' },
  })
  await persistResumeBytes(resume.id, stored.fileUrl, stored.buffer)
  assert('save returns a url', !!stored.fileUrl)
  assert('save preserves the original display name', stored.fileName === 'My Résumé (final).pdf')
  assert('save returns the bytes for in-memory parsing', stored.buffer.length === pdfBytes.length)
  assert('driver reported', ['blob', 'database'].includes(activeStorageDriver()), activeStorageDriver())

  // Upload path: parse straight from the buffer, no storage read.
  const fromBuffer = await extractPdfTextFromBuffer(stored.buffer)
  assert('text extracts from the in-memory buffer', fromBuffer.length > 50, `${fromBuffer.length} chars`)

  // Re-analysis path: read it back out of storage.
  const roundTripped = await readResumeFile(stored.fileUrl, resume.id)
  assert('file reads back byte-identical', roundTripped.equals(pdfBytes))

  const fromStorage = await extractPdfText(stored.fileUrl, resume.id)
  assert('text extracted from storage matches the buffer parse', fromStorage === fromBuffer)

  // --- Delete: bytes must not outlive the résumé ---
  await deleteResumeFile(stored.fileUrl)
  await prisma.resume.delete({ where: { id: resume.id } })
  const orphanBytes = await prisma.resumeFile.count({ where: { resumeId: resume.id } })
  assert('stored bytes are removed with the résumé', orphanBytes === 0)

  await extractPdfText(stored.fileUrl, resume.id)
    .then(() => assert('missing file yields a recoverable error', false))
    .catch((e) => assert('missing file yields a recoverable error', e instanceof PdfExtractionError))

  await deleteResumeFile(stored.fileUrl)
  assert('deleting an already-deleted file is a no-op', true)

  await prisma.user.delete({ where: { id: user.id } })
  await prisma.$disconnect()

  console.log('\ncleanup ok')
}

main().catch((e) => {
  console.error('FAILED:', e)
  process.exit(1)
})
