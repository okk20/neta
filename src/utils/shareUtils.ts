export interface ShareData {
  studentName: string;
  guardianPhone: string;
  reportType: string;
  term: string;
  year: string;
  pdfBlob?: Blob;
  title?: string;
  content?: string;
  filename?: string;
  type?: string;
}

export class ShareUtils {
  static formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it starts with 0, replace with +233
    if (cleaned.startsWith('0')) {
      cleaned = '+233' + cleaned.substring(1);
    }
    
    // If it doesn't start with +, assume it's a Ghanaian number
    if (!cleaned.startsWith('+')) {
      cleaned = '+233' + cleaned;
    }
    
    return cleaned;
  }

  static async shareViaWhatsApp(data: ShareData): Promise<void> {
    try {
      const phone = this.formatPhoneNumber(data.guardianPhone);
      
      const message = encodeURIComponent(
        `🎓 *Offinso College of Education J.H.S.*\n\n` +
        `Dear Parent/Guardian,\n\n` +
        `We are pleased to share ${data.studentName}'s ${data.reportType} ` +
        `for ${data.term}, ${data.year}.\n\n` +
        `📊 The report shows your child's academic progress and performance.\n\n` +
        `Please review the document and feel free to contact us if you have any questions.\n\n` +
        `Best regards,\n` +
        `Offinso College of Education J.H.S.\n` +
        `"Knowledge is Power"\n\n` +
        `📱 Contact: +233 24 000 0000\n` +
        `📧 Email: info@oce.edu.gh`
      );

      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let whatsappURL: string;
      
      if (isMobile) {
        // Use mobile WhatsApp app
        whatsappURL = `whatsapp://send?phone=${phone}&text=${message}`;
      } else {
        // Use WhatsApp Web
        whatsappURL = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
      }

      // Try to open WhatsApp
      const whatsappWindow = window.open(whatsappURL, '_blank');
      
      // If the window didn't open, show instructions
      if (!whatsappWindow) {
        alert(
          `Please copy this message and send it manually via WhatsApp to ${phone}:\n\n` +
          decodeURIComponent(message)
        );
      }

      // If we have a PDF, show additional instructions
      if (data.pdfBlob) {
        setTimeout(() => {
          alert(
            `📎 Don't forget to attach the PDF report!\n\n` +
            `The PDF file has been downloaded. Please attach it to your WhatsApp message.`
          );
        }, 2000);
      }

    } catch (error) {
      console.error('WhatsApp sharing failed:', error);
      throw new Error('Failed to share via WhatsApp. Please try again.');
    }
  }

  static async shareViaSMS(data: ShareData): Promise<void> {
    try {
      const phone = this.formatPhoneNumber(data.guardianPhone);
      
      const message = encodeURIComponent(
        `Offinso College of Education J.H.S.\n\n` +
        `Dear Parent, ${data.studentName}'s ${data.reportType} for ${data.term}, ${data.year} ` +
        `is ready. Please contact the school to collect it or check your WhatsApp for the digital copy.\n\n` +
        `Contact: +233 24 000 0000\n` +
        `Email: info@oce.edu.gh\n\n` +
        `"Knowledge is Power"`
      );

      // Create SMS URL
      const smsURL = `sms:${phone}?body=${message}`;
      
      // Try to open SMS app
      const smsWindow = window.open(smsURL, '_blank');
      
      // If the window didn't open, show fallback
      if (!smsWindow) {
        // Try alternative SMS format for different devices
        const altSmsURL = `sms:${phone}&body=${message}`;
        const altWindow = window.open(altSmsURL, '_blank');
        
        if (!altWindow) {
          alert(
            `Please copy this message and send it manually via SMS to ${phone}:\n\n` +
            decodeURIComponent(message)
          );
        }
      }

    } catch (error) {
      console.error('SMS sharing failed:', error);
      throw new Error('Failed to share via SMS. Please try again.');
    }
  }

  static async downloadPDF(pdfBlob: Blob, filename: string): Promise<void> {
    try {
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      throw new Error('Failed to download PDF. Please try again.');
    }
  }

  static async downloadDocument(data: ShareData): Promise<void> {
    try {
      if (data.type === 'html' && data.content && data.filename) {
        // Create a Blob from the HTML content
        const blob = new Blob([data.content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (data.pdfBlob && data.filename) {
        // Use existing downloadPDF method for PDFs
        await this.downloadPDF(data.pdfBlob, data.filename);
      } else {
        throw new Error('Invalid document data for download');
      }
    } catch (error) {
      console.error('Document download failed:', error);
      throw new Error('Failed to download document. Please try again.');
    }
  }

  static async shareReport(data: ShareData, method: 'whatsapp' | 'sms' | 'download'): Promise<void> {
    try {
      switch (method) {
        case 'whatsapp':
          await this.shareViaWhatsApp(data);
          break;
        case 'sms':
          await this.shareViaSMS(data);
          break;
        case 'download':
          if (data.pdfBlob) {
            const filename = `${data.studentName}_${data.reportType}_${data.term}_${data.year}.pdf`;
            await this.downloadPDF(data.pdfBlob, filename);
          }
          break;
        default:
          throw new Error('Invalid sharing method');
      }
    } catch (error) {
      console.error(`Failed to share via ${method}:`, error);
      throw error;
    }
  }

  static validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Check if it's a valid Ghanaian number format
    const validFormats = [
      /^\+233\d{9}$/,  // +233xxxxxxxxx
      /^0\d{9}$/,      // 0xxxxxxxxx
      /^\d{9}$/        // xxxxxxxxx
    ];
    
    return validFormats.some(format => format.test(cleaned));
  }

  static formatPhoneForDisplay(phone: string): string {
    const cleaned = this.formatPhoneNumber(phone);
    
    // Format as +233 XX XXX XXXX
    if (cleaned.startsWith('+233')) {
      const number = cleaned.substring(4);
      return `+233 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
    
    return cleaned;
  }
}

// Export utility functions for convenience
export const {
  shareViaWhatsApp,
  shareViaSMS,
  downloadPDF,
  downloadDocument,
  shareReport,
  validatePhoneNumber,
  formatPhoneForDisplay,
  formatPhoneNumber
} = ShareUtils;