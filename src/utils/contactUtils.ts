import { Student } from './database';

export interface ContactInfo {
  phone?: string;
  email?: string;
  name?: string;
}

export class ContactUtils {
  /**
   * Make a phone call to a student's guardian
   */
  static callGuardian(student: Student): void {
    const phone = student.guardianPhone;
    if (!phone) {
      alert(`No phone number available for ${student.name}'s guardian.`);
      return;
    }
    
    // Clean phone number (remove non-numeric characters except +)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone) {
      window.location.href = `tel:${cleanPhone}`;
    } else {
      alert('Invalid phone number format.');
    }
  }

  /**
   * Send WhatsApp message to a student's guardian
   */
  static sendWhatsAppMessage(student: Student, customMessage?: string): void {
    const phone = student.guardianPhone;
    if (!phone) {
      alert(`No WhatsApp number available for ${student.name}'s guardian.`);
      return;
    }

    const defaultMessage = `Hello! This is regarding ${student.name}'s academic progress at Offinso College of Education J.H.S. Please contact the school for more information.`;
    const message = customMessage || defaultMessage;
    
    // Clean phone number and ensure it's in international format
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const internationalPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
    
    if (internationalPhone) {
      const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      alert('Invalid phone number format.');
    }
  }

  /**
   * Send SMS to a student's guardian
   */
  static sendSMS(student: Student, customMessage?: string): void {
    const phone = student.guardianPhone;
    if (!phone) {
      alert(`No phone number available for ${student.name}'s guardian.`);
      return;
    }

    const defaultMessage = `Hello! This is regarding ${student.name} from Offinso College of Education J.H.S. Please contact us for more information.`;
    const message = customMessage || defaultMessage;
    
    // Clean phone number
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone) {
      window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    } else {
      alert('Invalid phone number format.');
    }
  }

  /**
   * Send email to a student's guardian (if email is available)
   */
  static sendEmail(student: Student, subject?: string, customMessage?: string): void {
    const email = student.guardianEmail;
    if (!email) {
      alert(`No email address available for ${student.name}'s guardian.`);
      return;
    }

    const defaultSubject = `Academic Information - ${student.name}`;
    const defaultMessage = `Dear Guardian,\n\nThis is regarding ${student.name}'s academic progress at Offinso College of Education J.H.S.\n\nBest regards,\nSchool Administration`;
    
    const emailSubject = subject || defaultSubject;
    const message = customMessage || defaultMessage;
    
    const mailto = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+233')) {
      // Ghana number formatting: +233 XX XXX XXXX
      return cleaned.replace(/(\+233)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    } else if (cleaned.startsWith('233')) {
      // Ghana number without + formatting: 233 XX XXX XXXX
      return cleaned.replace(/(233)(\d{2})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
    } else if (cleaned.startsWith('0')) {
      // Local Ghana number formatting: 0XX XXX XXXX
      return cleaned.replace(/(0)(\d{2})(\d{3})(\d{4})/, '$1$2 $3 $4');
    }
    
    return phone;
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    if (!phone) return false;
    
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ghana phone number patterns
    const patterns = [
      /^\+233\d{9}$/, // +233XXXXXXXXX
      /^233\d{9}$/, // 233XXXXXXXXX
      /^0\d{9}$/, // 0XXXXXXXXX
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Get all available contact methods for a student
   */
  static getAvailableContactMethods(student: Student): string[] {
    const methods: string[] = [];
    
    if (student.guardianPhone && this.validatePhoneNumber(student.guardianPhone)) {
      methods.push('phone', 'whatsapp', 'sms');
    }
    
    if (student.guardianEmail && this.validateEmail(student.guardianEmail)) {
      methods.push('email');
    }
    
    return methods;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate contact summary for a student
   */
  static getContactSummary(student: Student): {
    guardianName: string;
    phone: string;
    email: string;
    availableMethods: string[];
    formattedPhone: string;
  } {
    return {
      guardianName: student.guardianName || 'Guardian',
      phone: student.guardianPhone || '',
      email: student.guardianEmail || '',
      availableMethods: this.getAvailableContactMethods(student),
      formattedPhone: this.formatPhoneNumber(student.guardianPhone || '')
    };
  }

  /**
   * Send attendance notification to guardian
   */
  static sendAttendanceNotification(student: Student, attendanceData: {
    present: number;
    total: number;
    percentage: number;
    term: string;
    year: string;
  }): void {
    const message = `Dear Guardian,\n\n${student.name}'s attendance for ${attendanceData.term} ${attendanceData.year}:\n\nDays Present: ${attendanceData.present}/${attendanceData.total}\nAttendance Rate: ${attendanceData.percentage}%\n\nFor any concerns, please contact the school.\n\nBest regards,\nOffinso College of Education J.H.S`;
    
    this.sendWhatsAppMessage(student, message);
  }

  /**
   * Send report card notification to guardian
   */
  static sendReportCardNotification(student: Student, reportData: {
    term: string;
    year: string;
    overallGrade: string;
    position: number;
    totalStudents: number;
  }): void {
    const message = `Dear Guardian,\n\n${student.name}'s report card for ${reportData.term} ${reportData.year} is ready:\n\nOverall Grade: ${reportData.overallGrade}\nClass Position: ${reportData.position} out of ${reportData.totalStudents}\n\nPlease visit the school to collect the report card.\n\nBest regards,\nOffinso College of Education J.H.S`;
    
    this.sendWhatsAppMessage(student, message);
  }

  /**
   * Send emergency contact message
   */
  static sendEmergencyContact(student: Student, message: string, preferredMethod: 'call' | 'whatsapp' | 'sms' = 'call'): void {
    const urgentMessage = `URGENT: ${message}\n\nRegarding: ${student.name}\nPlease contact the school immediately.\n\nOffinso College of Education J.H.S\nPhone: +233-XXX-XXXXXXX`;

    switch (preferredMethod) {
      case 'call':
        this.callGuardian(student);
        break;
      case 'whatsapp':
        this.sendWhatsAppMessage(student, urgentMessage);
        break;
      case 'sms':
        this.sendSMS(student, urgentMessage);
        break;
      default:
        this.callGuardian(student);
    }
  }
}

export default ContactUtils;