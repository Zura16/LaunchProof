import { readFile } from 'fs/promises'
import path from 'path'

export class PdfExtractionError extends Error {}

type PdfParseFn = (data: Buffer) => Promise<{ text: string; numpages: number }>

// pdf-parse's package entry point runs debug code that reads a bundled
// sample PDF when `module.parent` is unset, which throws under bundlers.
// The library file itself has no such side effect.
async function loadPdfParse(): Promise<PdfParseFn> {
  // @ts-expect-error - no type declarations published for the internal path
  const mod = await import('pdf-parse/lib/pdf-parse.js')
  return (mod.default ?? mod) as PdfParseFn
}

export async function extractPdfText(fileUrl: string): Promise<string> {
  const storedName = path.basename(fileUrl)
  const filePath = path.join(process.cwd(), 'uploads', 'resumes', storedName)

  let buffer: Buffer
  try {
    buffer = await readFile(filePath)
  } catch {
    throw new PdfExtractionError('The stored résumé file could not be read. Try re-uploading it.')
  }

  try {
    const pdfParse = await loadPdfParse()
    const { text } = await pdfParse(buffer)
    const cleaned = text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim()

    if (cleaned.length < 50) {
      throw new PdfExtractionError(
        'Almost no text could be extracted from this PDF. If it is a scanned image, export a text-based PDF instead.'
      )
    }
    return cleaned
  } catch (e) {
    if (e instanceof PdfExtractionError) throw e
    throw new PdfExtractionError('This PDF could not be read. It may be corrupted or password-protected.')
  }
}
