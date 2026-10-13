import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportMatchPlanToPdf(
  elementId: string,
  filename: string = 'GamePlan_HGUFC_Match_Plan.pdf',
  onProgress?: (status: string) => void
): Promise<boolean> {
  try {
    onProgress?.('Preparing tactical document...');
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Export element with ID "${elementId}" not found`);
    }

    // Scroll to top to ensure clean rendering
    window.scrollTo(0, 0);

    onProgress?.('Rendering high-resolution tactical pitch & analysis...');
    
    // Create canvas snapshot
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina crispness)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    onProgress?.('Compiling PDF match dossier...');
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Additional pages if report exceeds A4 height
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    onProgress?.('Downloading PDF...');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  }
}
