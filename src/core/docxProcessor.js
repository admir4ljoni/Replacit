/**
 * @module docxProcessor
 * Handles .docx file loading, XML-level text replacement, preview generation, and export.
 * Uses JSZip for ZIP manipulation and Mammoth for HTML preview rendering.
 */

import JSZip from 'jszip';
import mammoth from 'mammoth';
import { buildRegex } from './replacer.js';

const DOCUMENT_XML_PATH = 'word/document.xml';

/**
 * Loads a .docx File into a JSZip instance.
 *
 * @param {File} file - The .docx file to load.
 * @returns {Promise<JSZip>} The parsed ZIP archive.
 */
export async function loadDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    return JSZip.loadAsync(arrayBuffer);
}

/**
 * Extracts the raw XML string of the main document.
 *
 * @param {JSZip} zip - The loaded .docx ZIP archive.
 * @returns {Promise<string>} The XML content of word/document.xml.
 */
export async function getDocumentXml(zip) {
    const xmlFile = zip.file(DOCUMENT_XML_PATH);
    if (!xmlFile) {
        throw new Error('Invalid .docx: word/document.xml not found.');
    }
    return xmlFile.async('string');
}

/**
 * Extracts all text content from the document XML for preview/matching.
 * Concatenates text within <w:t> tags.
 *
 * @param {string} xml - The document XML string.
 * @returns {string} Plain text content of the document.
 */
export function extractTextFromXml(xml) {
    const textMatches = xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (!textMatches) {
        return '';
    }

    return textMatches
        .map((tag) => {
            const content = tag.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
            return content;
        })
        .join('');
}

/**
 * Replaces text within the document XML while preserving formatting.
 * Operates on <w:t> text nodes, handling cases where a match may span
 * multiple <w:t> elements within the same <w:r> (run) or across runs.
 *
 * Strategy: collect all <w:t> contents, perform replacement on the
 * concatenated text, then redistribute back into the XML tags.
 *
 * @param {string} xml - The document XML.
 * @param {string} pattern - The search pattern.
 * @param {string} replacement - The replacement text.
 * @param {object} options - Replace options (isCaseSensitive, isWholeWord, isRegex).
 * @returns {string} Modified XML with replacements applied.
 */
export function replaceInXml(xml, pattern, replacement, options = {}) {
    const regex = buildRegex(pattern, options);
    if (!regex) {
        return xml;
    }

    // Strategy: find all <w:p> paragraph blocks, process each independently
    return xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (paragraph) => {
        return replaceInParagraph(paragraph, regex, replacement);
    });
}

/**
 * Replaces matches within a single OOXML paragraph (<w:p>).
 * Collects text from all <w:t> nodes, applies regex, redistributes text.
 *
 * @param {string} paragraphXml - The paragraph XML string.
 * @param {RegExp} regex - Compiled search regex.
 * @param {string} replacement - Replacement text.
 * @returns {string} Modified paragraph XML.
 */
function replaceInParagraph(paragraphXml, regex, replacement) {
    const textTagRegex = /<w:t([^>]*)>([^<]*)<\/w:t>/g;
    const segments = [];
    let match;

    // Collect all text segments with their positions
    while ((match = textTagRegex.exec(paragraphXml)) !== null) {
        segments.push({
            fullMatch: match[0],
            attrs: match[1],
            text: match[2],
            start: match.index,
            end: match.index + match[0].length,
        });
    }

    if (segments.length === 0) {
        return paragraphXml;
    }

    // Concatenate all text
    const fullText = segments.map((s) => s.text).join('');
    const replacedText = fullText.replace(regex, replacement);

    // If nothing changed, return as-is
    if (fullText === replacedText) {
        return paragraphXml;
    }

    // Put all replaced text into the first <w:t> and empty the rest
    // Ensure xml:space="preserve" to keep whitespace
    let result = paragraphXml;

    for (let i = segments.length - 1; i >= 0; i--) {
        const segment = segments[i];
        const newText = i === 0 ? replacedText : '';
        const attrs = newText.length > 0 ? ' xml:space="preserve"' : segment.attrs;
        const newTag = `<w:t${attrs}>${newText}</w:t>`;
        result = result.slice(0, segment.start) + newTag + result.slice(segment.end);
    }

    return result;
}

/**
 * Applies text replacement to the .docx ZIP and returns a modified copy.
 *
 * @param {JSZip} zip - The loaded .docx ZIP archive.
 * @param {string} pattern - The search pattern.
 * @param {string} replacement - The replacement text.
 * @param {object} options - Replace options.
 * @returns {Promise<JSZip>} Modified ZIP with replacements applied.
 */
export async function replaceInDocx(zip, pattern, replacement, options = {}) {
    const xml = await getDocumentXml(zip);
    const modifiedXml = replaceInXml(xml, pattern, replacement, options);
    zip.file(DOCUMENT_XML_PATH, modifiedXml);
    return zip;
}

/**
 * Generates an HTML preview string from a .docx file's ArrayBuffer.
 *
 * @param {ArrayBuffer} arrayBuffer - The .docx file as an ArrayBuffer.
 * @returns {Promise<string>} HTML string of the document content.
 */
export async function generateHtmlPreview(arrayBuffer) {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
}

/**
 * Exports the modified ZIP archive as a downloadable Blob.
 *
 * @param {JSZip} zip - The ZIP archive to export.
 * @returns {Promise<Blob>} The .docx Blob.
 */
export async function exportDocx(zip) {
    return zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
}
