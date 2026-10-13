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
  let tempHost: HTMLElement | null = null;
  try {
    onProgress?.('Locating tactical match plan document...');
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`Export element with ID "${elementId}" not found in DOM`);
    }

    onProgress?.('Preparing high-fidelity render container...');

    // Create a temporary container on screen so styles and geometry are calculated properly
    tempHost = document.createElement('div');
    tempHost.id = 'pdf-export-temp-host';
    tempHost.style.position = 'fixed';
    tempHost.style.top = '0';
    tempHost.style.left = '0';
    tempHost.style.width = '840px';
    tempHost.style.zIndex = '99999';
    tempHost.style.backgroundColor = '#ffffff';
    tempHost.style.opacity = '1';
    tempHost.style.pointerEvents = 'none';
    tempHost.style.overflow = 'visible';

    // Clone element deeply
    const cloned = originalElement.cloneNode(true) as HTMLElement;
    cloned.style.margin = '0 auto';
    cloned.style.width = '840px';
    cloned.style.backgroundColor = '#ffffff';
    cloned.style.display = 'block';
    cloned.style.visibility = 'visible';

    tempHost.appendChild(cloned);
    document.body.appendChild(tempHost);

    // Give browser brief tick to settle layout & fonts
    await new Promise((resolve) => setTimeout(resolve, 350));

    onProgress?.('Rendering tactical report with vector engine...');

    let dataUrl: string | null = null;

    // Primary renderer: html-to-image (Uses native browser SVG foreignObject, 100% compatible with Tailwind v4 & oklch)
    try {
      dataUrl = await htmlToImage.toPng(cloned, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 1.5,
        cacheBust: true,
      });
    } catch (primaryErr) {
      console.warn('html-to-image failed, trying html2canvas fallback:', primaryErr);
    }

    // Fallback renderer: html2canvas
    if (!dataUrl) {
      onProgress?.('Rendering with canvas fallback...');
      const canvas = await html2canvas(cloned, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 840,
        windowWidth: 840,
      });
      dataUrl = canvas.toDataURL('image/png');
    }

    if (!dataUrl) {
      throw new Error('Could not generate image data for tactical report');
    }

    onProgress?.('Compiling multi-page A4 PDF dossier...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgProps = pdf.getImageProperties(dataUrl);
    const totalPdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = totalPdfHeight;
    let position = 0;

    // Page 1
    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    onProgress?.('Finalizing and initiating download...');

    // Generate binary Blob and Object URL
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // 1. Attempt standard programmatic <a> download
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
  } finally {
    if (tempHost && tempHost.parentNode) {
      tempHost.parentNode.removeChild(tempHost);
    }
  }
}
