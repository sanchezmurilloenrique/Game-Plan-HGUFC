import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportPdfResult {
  success: boolean;
  blobUrl?: string;
  filename?: string;
  error?: string;
}

/**
 * Exports the tactical match plan document to a high-fidelity PDF file.
 * Applies exact print styling (border: none, box-shadow: none, border-radius: 0)
 * and renders with high pixel density to match the native browser print output.
 */
export async function exportMatchPlanToPdf(
  elementId: string,
  filename: string = 'GamePlan_HGUFC_Match_Plan.pdf',
  onProgress?: (status: string) => void
): Promise<ExportPdfResult> {
  try {
    onProgress?.('Preparing tactical match plan document...');
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`Export element with ID "${elementId}" not found in DOM`);
    }

    // Ensure fonts and vector graphics are ready
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Look for dedicated A4 pages (.pdf-page) inside the document
    const pageElements = Array.from(originalElement.querySelectorAll<HTMLElement>('.pdf-page'));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    if (pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        onProgress?.(`Compiling page ${i + 1} of ${pageElements.length} (Print-accurate)...`);

        // Save original styles
        const origBorder = pageEl.style.border;
        const origShadow = pageEl.style.boxShadow;
        const origRadius = pageEl.style.borderRadius;
        const origMargin = pageEl.style.margin;

        // Apply exact print styles matching @media print
        pageEl.style.border = 'none';
        pageEl.style.boxShadow = 'none';
        pageEl.style.borderRadius = '0';
        pageEl.style.margin = '0';

        let pageDataUrl: string | null = null;

        // Primary: High-fidelity html-to-image with vector foreignObject
        try {
          pageDataUrl = await htmlToImage.toPng(pageEl, {
            quality: 0.98,
            backgroundColor: '#ffffff',
            pixelRatio: 2.5,
            cacheBust: true,
            width: 794,
            height: 1122,
          });
        } catch (primaryErr) {
          console.warn(`html-to-image failed on page ${i + 1}, using html2canvas fallback:`, primaryErr);
        }

        // Fallback: html2canvas with high-scale vector rendering
        if (!pageDataUrl) {
          const canvas = await html2canvas(pageEl, {
            scale: 2.5,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794,
            height: 1122,
          });
          pageDataUrl = canvas.toDataURL('image/png', 0.98);
        }

        // Restore original styles
        pageEl.style.border = origBorder;
        pageEl.style.boxShadow = origShadow;
        pageEl.style.borderRadius = origRadius;
        pageEl.style.margin = origMargin;

        if (!pageDataUrl) {
          throw new Error(`Failed to render page ${i + 1} of tactical dossier`);
        }

        if (i > 0) {
          pdf.addPage();
        }

        // Add page image fitting exact A4 dimensions
        pdf.addImage(pageDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    } else {
      // Fallback if no .pdf-page elements found
      onProgress?.('Rendering tactical report...');
      const canvas = await html2canvas(originalElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
      });
      const dataUrl = canvas.toDataURL('image/png');

      const imgProps = pdf.getImageProperties(dataUrl);
      const totalPdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = totalPdfHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    onProgress?.('Finalizing and initiating download...');

    // Generate binary Blob and Object URL
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // Trigger programmatic download
    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 1000);
    } catch (err) {
      console.warn('Programmatic click download error:', err);
    }

    return {
      success: true,
      blobUrl,
      filename,
    };
  } catch (error: any) {
    console.error('PDF export process error:', error);
    return {
      success: false,
      error: error?.message || 'Unknown error occurred during PDF export',
    };
  }
}

/**
 * Exports the tactical match plan as a standalone, self-contained HTML file.
 * This guarantees 100% exact visual parity with the print view on any device or browser,
 * and includes a built-in "Print / Save to PDF" button.
 */
export function exportMatchPlanToHtml(
  elementId: string,
  filename: string = 'GamePlan_HGUFC_Match_Plan.html'
): { success: boolean; error?: string } {
  try {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`Element #${elementId} not found`);
    }

    // Extract complete rendered HTML
    const contentHtml = originalElement.innerHTML;

    // Collect document stylesheets
    const styles: string[] = [];
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      if (node.tagName.toLowerCase() === 'style') {
        styles.push(node.textContent || '');
      } else if (node.tagName.toLowerCase() === 'link') {
        const href = (node as HTMLLinkElement).href;
        styles.push(`@import url("${href}");`);
      }
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename.replace('.html', '')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    ${styles.join('\n')}
    
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 0;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .toolbar button {
      background: #ea580c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;
    }

    .toolbar button:hover {
      background: #f97316;
    }

    .dossier-container {
      max-width: 860px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .pdf-page {
      width: 794px;
      min-height: 1122px;
      background: #ffffff;
      margin: 0 auto 32px auto;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      box-sizing: border-box;
      overflow: hidden;
    }

    @media print {
      .toolbar {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .dossier-container {
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .pdf-page {
        width: 210mm !important;
        height: 297mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;
        margin: 0 !important;
        padding: 10mm 14mm !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .pdf-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 900; letter-spacing: 0.05em; color: #f97316;">HGUFC MATCH DOSSIER</span>
      <span style="font-size: 12px; color: #94a3b8;">Confidential Coaching Plan</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()">
        🖨️ Print / Save as PDF (Vector Quality)
      </button>
    </div>
  </div>

  <div class="dossier-container">
    ${contentHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    return { success: true };
  } catch (error: any) {
    console.error('HTML export error:', error);
    return { success: false, error: error?.message || 'Failed to export HTML' };
  }
}

/**
 * Exports high-resolution PNG images of all dossier pages.
 * Rendered without card borders or box-shadows, matching the clean print aesthetic.
 */
export async function exportMatchPlanImages(
  elementId: string,
  baseFilename: string = 'GamePlan_HGUFC_Page',
  onProgress?: (status: string) => void
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`Element #${elementId} not found`);
    }

    const pageElements = Array.from(originalElement.querySelectorAll<HTMLElement>('.pdf-page'));
    if (pageElements.length === 0) {
      throw new Error('No pages found in dossier');
    }

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`Generating high-res PNG for page ${i + 1} of ${pageElements.length}...`);

      const origBorder = pageEl.style.border;
      const origShadow = pageEl.style.boxShadow;
      const origRadius = pageEl.style.borderRadius;

      pageEl.style.border = 'none';
      pageEl.style.boxShadow = 'none';
      pageEl.style.borderRadius = '0';

      const dataUrl = await htmlToImage.toPng(pageEl, {
        quality: 0.98,
        backgroundColor: '#ffffff',
        pixelRatio: 2.5,
        cacheBust: true,
        width: 794,
        height: 1122,
      });

      pageEl.style.border = origBorder;
      pageEl.style.boxShadow = origShadow;
      pageEl.style.borderRadius = origRadius;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${baseFilename}_${i + 1}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      await new Promise((r) => setTimeout(r, 400));
      if (link.parentNode) link.parentNode.removeChild(link);
    }

    return { success: true, count: pageElements.length };
  } catch (err: any) {
    console.error('PNG export error:', err);
    return { success: false, error: err?.message || 'Failed to export PNG images' };
  }
}
