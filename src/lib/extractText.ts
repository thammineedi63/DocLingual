import Tesseract from 'tesseract.js';
import * as mammoth from 'mammoth';

export interface ExtractionResult {
  text: string;
  method: 'ocr' | 'digital';
  detectedLanguage?: string;
  confidence?: number;
}

export type ProgressCallback = (stage: string, progress: number) => void;

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isDOCX(file: File): boolean {
  return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx');
}

function isTXT(file: File): boolean {
  return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
}

async function extractFromImage(file: File, ocrLangs: string[], onProgress?: ProgressCallback): Promise<ExtractionResult> {
  onProgress?.('Initializing OCR engine...', 0.1);
  const langString = ocrLangs.join('+');
  
  const result = await Tesseract.recognize(file, langString, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress?.('Performing OCR...', 0.2 + (m.progress * 0.7));
      }
    },
  });

  onProgress?.('OCR complete', 1);
  return {
    text: result.data.text.trim(),
    method: 'ocr',
    confidence: result.data.confidence,
  };
}

async function extractFromPDF(file: File, ocrLangs: string[], onProgress?: ProgressCallback): Promise<ExtractionResult> {
  onProgress?.('Loading PDF...', 0.1);
  
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const totalPages = pdf.numPages;

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(`Extracting page ${i}/${totalPages}...`, 0.1 + (i / totalPages) * 0.6);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }

  const cleanText = fullText.trim();

  // If very little text extracted, it's likely scanned — use OCR
  if (cleanText.length < 50) {
    onProgress?.('Scanned PDF detected, running OCR...', 0.7);
    
    // Render first few pages to canvas for OCR
    let ocrText = '';
    const pagesToOCR = Math.min(totalPages, 10);
    
    for (let i = 1; i <= pagesToOCR; i++) {
      onProgress?.(`OCR on page ${i}/${pagesToOCR}...`, 0.7 + (i / pagesToOCR) * 0.25);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      
      const result = await Tesseract.recognize(blob, ocrLangs.join('+'));
      ocrText += result.data.text + '\n\n';
    }

    onProgress?.('OCR complete', 1);
    return { text: ocrText.trim(), method: 'ocr' };
  }

  onProgress?.('Extraction complete', 1);
  return { text: cleanText, method: 'digital' };
}

async function extractFromDOCX(file: File, onProgress?: ProgressCallback): Promise<ExtractionResult> {
  onProgress?.('Extracting DOCX content...', 0.3);
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  onProgress?.('Extraction complete', 1);
  return { text: result.value.trim(), method: 'digital' };
}

async function extractFromTXT(file: File, onProgress?: ProgressCallback): Promise<ExtractionResult> {
  onProgress?.('Reading text file...', 0.5);
  const text = await file.text();
  onProgress?.('Done', 1);
  return { text: text.trim(), method: 'digital' };
}

export async function extractText(
  file: File,
  ocrLangs: string[] = ['eng'],
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  if (isImageFile(file)) {
    return extractFromImage(file, ocrLangs, onProgress);
  }
  if (isPDF(file)) {
    return extractFromPDF(file, ocrLangs, onProgress);
  }
  if (isDOCX(file)) {
    return extractFromDOCX(file, onProgress);
  }
  if (isTXT(file)) {
    return extractFromTXT(file, onProgress);
  }
  throw new Error(`Unsupported file type: ${file.type || file.name}`);
}
