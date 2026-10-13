import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportMatchPlanToPdf(
  elementId: string,
  filename: string = 'GamePlan_HGUFC_Match_Plan.pdf',
  onProgress?: (status: string) => void
): Promise<boolean> {
  let cloneContainer: HTMLElement | null = null;
  try {
    onProgress?.('Preparing tactical document...');
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`Export element with ID "${elementId}" not found`);
    }

    onProgress?.('Setting up document canvas layout...');

    // Create a pristine, non-hidden clone in DOM with standard dimensions
    // to prevent blank rendering or issues with position/scroll/overflow
    cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.left = '0px';
    cloneContainer.style.top = '0px';
    cloneContainer.style.width = '840px';
    cloneContainer.style.backgroundColor = '#ffffff';
    cloneContainer.style.zIndex = '-99999';
    cloneContainer.style.overflow = 'visible';
    cloneContainer.style.opacity = '1';
    cloneContainer.style.pointerEvents = 'none';

    // Clone target node deeply
    const clonedNode = originalElement.cloneNode(true) as HTMLElement;
    clonedNode.style.margin = '0 auto';
    clonedNode.style.width = '840px';
    clonedNode.style.backgroundColor = '#ffffff';
    cloneContainer.appendChild(clonedNode);
    document.body.appendChild(cloneContainer);

    // Wait a brief tick for fonts/layout to settle
    await new Promise((resolve) => setTimeout(resolve, 300));

    onProgress?.('Rendering high-resolution tactical pitch & analysis...');
    
    // Create canvas snapshot with robust html2canvas parameters
    const canvas = await html2canvas(clonedNode, {
      scale: 2, // High resolution (retina crispness)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 840,
      windowWidth: 840,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000,
    });

    onProgress?.('Compiling multi-page PDF match dossier...');
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Scale image to fit A4 width
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
  } finally {
    if (cloneContainer && cloneContainer.parentNode) {
      cloneContainer.parentNode.removeChild(cloneContainer);
    }
  }
}
