import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportPdfResult {
  success: boolean;
  blobUrl?: string;
  filename?: string;
  error?: string;
}

export async function exportMatchPlanToPdf(
  elementId: string,
  filename: string = 'GamePlan_HGUFC_Match_Plan.pdf',
  onProgress?: (status: string) => void
): Promise<ExportPdfResult> {
  try {
    onProgress?.('Locating tactical match plan document...');
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`Export element with ID "${elementId}" not found in DOM`);
    }

    // Wait a brief moment to ensure fonts, DOM nodes and vector paths are fully laid out
    await new Promise((resolve) => setTimeout(resolve, 200));

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
      // PAGE-BY-PAGE RENDERING: Guarantees zero text/box slicing across sheets and keeps all headers pristine!
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        onProgress?.(`Rendering page ${i + 1} of ${pageElements.length}...`);

        let pageDataUrl: string | null = null;

        // Primary renderer: html-to-image (Native SVG foreignObject rendering with Tailwind v4 & vector support)
        try {
          pageDataUrl = await htmlToImage.toPng(pageEl, {
            quality: 0.98,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            cacheBust: true,
          });
        } catch (primaryErr) {
          console.warn(`html-to-image failed on page ${i + 1}, trying html2canvas fallback:`, primaryErr);
        }

        // Fallback renderer: html2canvas
        if (!pageDataUrl) {
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794,
          });
          pageDataUrl = canvas.toDataURL('image/png');
        }

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
      // Fallback: If no .pdf-page elements found, render entire container
      onProgress?.('Rendering tactical report with vector engine...');
      let dataUrl: string | null = null;
      try {
        dataUrl = await htmlToImage.toPng(originalElement, {
          quality: 0.95,
          backgroundColor: '#ffffff',
          pixelRatio: 1.5,
          cacheBust: true,
        });
      } catch (err) {
        console.warn('html-to-image failed, trying html2canvas fallback:', err);
      }

      if (!dataUrl) {
        const canvas = await html2canvas(originalElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794,
        });
        dataUrl = canvas.toDataURL('image/png');
      }

      if (!dataUrl) {
        throw new Error('Could not generate image data for tactical report');
      }

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

    // 1. Attempt programmatic <a> download
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

    // 2. Also call pdf.save()
    try {
      pdf.save(filename);
    } catch (saveErr) {
      console.warn('pdf.save error:', saveErr);
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
