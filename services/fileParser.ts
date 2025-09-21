import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

/**
 * Parses a PDF file and extracts its text content.
 * @param file The PDF file to parse.
 * @returns A promise that resolves with the extracted text.
 */
export const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Use 'str' property from item, which is TextItem.
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

/**
 * Parses a DOCX file and extracts its text content.
 * @param file The DOCX file to parse.
 * @returns A promise that resolves with the extracted text.
 */
export const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};
