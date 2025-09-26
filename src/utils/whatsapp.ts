import { MESSAGE_TEMPLATE, PERFORMANCE_MESSAGES, GRADE_THRESHOLDS, WHATSAPP_CONFIG, WHATSAPP_ENDPOINTS } from '../constants/whatsapp';
import { db, type Student, type Score, type Subject } from './database';

export interface ExamSummary {
  studentId: string;
  studentName: string;
  class: string;
  subjects: Array<{
    name: string;
    classScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
  }>;
  totalExamScore: number;
  totalExamScoreDoubled: number; // New field for doubled exam score
  averageScore: number;
  grade: string;
  actualGrade: string; // Grade from actual scores
  position: number;
  classSize: number;
  guardianPhone: string;
  guardianName: string;
  term: string;
  academicYear: string;
}

export const generateGrade = (score: number): string => {
  for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS)) {
    if (score >= threshold) {
      return grade;
    }
  }
  return 'F';
};

export const getPerformanceMessage = (averageScore: number): string => {
  for (const [threshold, message] of Object.entries(PERFORMANCE_MESSAGES)) {
    if (averageScore >= Number(threshold)) {
      return message;
    }
  }
  return PERFORMANCE_MESSAGES[0];
};

// Helper function to get ordinal position (1st, 2nd, 3rd, etc.)
export const getOrdinalPosition = (position: number): string => {
  const j = position % 10;
  const k = position % 100;
  
  if (j === 1 && k !== 11) {
    return position + "st";
  }
  if (j === 2 && k !== 12) {
    return position + "nd";
  }
  if (j === 3 && k !== 13) {
    return position + "rd";
  }
  return position + "th";
};

export const calculateStudentPosition = async (studentId: string, averageScore: number, studentClass: string): Promise<number> => {
  try {
    const allStudents = await db.getAllStudents();
    const classStudents = allStudents.filter(s => s.class === studentClass && s.status === 'active');
    
    // Get scores for all students in the class
    const allScores = await db.getAllScores();
    const studentAverages: Array<{ studentId: string, average: number }> = [];
    
    for (const student of classStudents) {
      const studentScores = allScores.filter(s => s.studentId === student.id);
      if (studentScores.length > 0) {
        const total = studentScores.reduce((sum, score) => sum + (score.classScore + score.examScore), 0);
        const average = total / studentScores.length;
        studentAverages.push({ studentId: student.id, average });
      }
    }
    
    // Sort by average (descending) and find position
    studentAverages.sort((a, b) => b.average - a.average);
    const position = studentAverages.findIndex(s => s.studentId === studentId) + 1;
    
    return position || 1;
  } catch (error) {
    console.error('Error calculating position:', error);
    return 1;
  }
};

export const generateExamSummary = async (student: Student): Promise<ExamSummary | null> => {
  try {
    if (!student.guardianPhone || !student.guardianPhone.trim()) {
      return null;
    }

    // Get student's scores
    const allScores = await db.getAllScores();
    const studentScores = allScores.filter(s => s.studentId === student.id);
    
    if (studentScores.length === 0) {
      return null; // No scores available
    }

    // Get subjects
    const allSubjects = await db.getAllSubjects();
    const subjectMap = new Map(allSubjects.map(s => [s.id, s]));

    // Calculate subject details
    const subjects = studentScores.map(score => {
      const subject = subjectMap.get(score.subjectId);
      const totalScore = score.classScore + score.examScore;
      return {
        name: subject?.name || 'Unknown Subject',
        classScore: score.classScore,
        examScore: score.examScore,
        totalScore,
        grade: generateGrade(totalScore)
      };
    });

    // Calculate totals
    const totalExamScore = subjects.reduce((sum, s) => sum + s.examScore, 0);
    const totalExamScoreDoubled = totalExamScore * 2; // Double the exam score as requested
    const totalPossibleScore = subjects.reduce((sum, s) => sum + s.totalScore, 0);
    const averageScore = Math.round(totalPossibleScore / subjects.length);
    
    // Get the actual grade from the calculated average
    const actualGrade = generateGrade(averageScore);

    // Get class size and position
    const allStudents = await db.getAllStudents();
    const classSize = allStudents.filter(s => s.class === student.class && s.status === 'active').length;
    const position = await calculateStudentPosition(student.id, averageScore, student.class);

    // Get current term and year from settings
    const schoolSettings = await db.getSetting('schoolSettings');
    const currentTerm = schoolSettings?.currentTerm || 'Term 1';
    const currentYear = schoolSettings?.currentYear || new Date().getFullYear().toString();

    return {
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      subjects,
      totalExamScore,
      totalExamScoreDoubled,
      averageScore,
      grade: generateGrade(averageScore),
      actualGrade, // Use this for performance analysis
      position,
      classSize,
      guardianPhone: student.guardianPhone,
      guardianName: student.guardianName,
      term: currentTerm,
      academicYear: currentYear
    };
  } catch (error) {
    console.error('Error generating exam summary:', error);
    return null;
  }
};

export const generateMessage = (summary: ExamSummary, template: string = MESSAGE_TEMPLATE): string => {
  // Create subjects breakdown text
  const subjectsText = summary.subjects.map(s => 
    `📚 ${s.name}: ${s.totalScore}% (Class: ${s.classScore}, Exam: ${s.examScore}) - Grade ${s.grade}`
  ).join('\n');

  // Format position with ordinal and class size
  const positionText = `${getOrdinalPosition(summary.position)} out of ${summary.classSize}`;

  return template
    .replace(/{GUARDIAN_NAME}/g, summary.guardianName)
    .replace(/{STUDENT_NAME}/g, summary.studentName)
    .replace(/{CLASS}/g, summary.class)
    .replace(/{TOTAL_SUBJECTS}/g, summary.subjects.length.toString())
    .replace(/{TOTAL_EXAM_SCORE}/g, summary.totalExamScoreDoubled.toString()) // Use doubled score
    .replace(/{AVERAGE_SCORE}/g, summary.averageScore.toString())
    .replace(/{GRADE}/g, summary.actualGrade) // Use actual grade from scores
    .replace(/{POSITION}/g, positionText) // Use ordinal format
    .replace(/{TERM}/g, summary.term)
    .replace(/{ACADEMIC_YEAR}/g, summary.academicYear)
    .replace(/{SUBJECTS_BREAKDOWN}/g, subjectsText)
    .replace(/{PERFORMANCE_MESSAGE}/g, getPerformanceMessage(summary.averageScore));
};

export const formatPhoneForWhatsApp = (phoneNumber: string): string => {
  return phoneNumber.replace(/\s/g, '').replace(/^\+/, '');
};

// WhatsApp Business API integration
export const sendWhatsAppMessage = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    
    // Check if API credentials are configured
    if (WHATSAPP_CONFIG.accessToken === 'YOUR_ACCESS_TOKEN_HERE' || 
        WHATSAPP_CONFIG.phoneNumberId === 'YOUR_PHONE_NUMBER_ID_HERE') {
      
      console.log('📱 WhatsApp Business API not configured. Opening WhatsApp Web as fallback...');
      
      // Fallback to WhatsApp Web
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      return true;
    }
    
    // Actual WhatsApp Business API call
    const response = await fetch(WHATSAPP_ENDPOINTS.sendMessage(WHATSAPP_CONFIG.phoneNumberId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ WhatsApp message sent successfully:', result);
    
    return true;
  } catch (error) {
    console.error('❌ WhatsApp API error:', error);
    
    // Fallback to WhatsApp Web on error
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    return true; // Return true since we provided a fallback
  }
};

export const createWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

export const generateAllSummaries = async (students: Student[]): Promise<ExamSummary[]> => {
  const summaries: ExamSummary[] = [];
  
  for (const student of students) {
    const summary = await generateExamSummary(student);
    if (summary) {
      summaries.push(summary);
    }
  }
  
  return summaries;
};

// Bulk send using WhatsApp Business API
export const sendBulkWhatsAppMessages = async (
  summaries: ExamSummary[],
  messageTemplate: string,
  onProgress?: (sent: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> => {
  const results = { success: 0, failed: 0, errors: [] as string[] };
  
  console.log(`📱 Starting bulk WhatsApp messaging for ${summaries.length} guardians...`);
  
  for (let i = 0; i < summaries.length; i++) {
    const summary = summaries[i];
    const message = generateMessage(summary, messageTemplate);
    
    try {
      const success = await sendWhatsAppMessage(summary.guardianPhone, message);
      if (success) {
        results.success++;
        console.log(`✅ Message ${i + 1}/${summaries.length} sent to ${summary.guardianName}`);
      } else {
        results.failed++;
        results.errors.push(`Failed to send message to ${summary.guardianName}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error sending to ${summary.guardianName}: ${error}`);
      console.error(`❌ Failed to send message ${i + 1}/${summaries.length}:`, error);
    }
    
    // Update progress
    if (onProgress) {
      onProgress(i + 1, summaries.length);
    }
    
    // Add delay to avoid rate limiting (important for WhatsApp Business API)
    if (i < summaries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`📊 Bulk messaging completed: ${results.success} sent, ${results.failed} failed`);
  
  return results;
};

// Validate WhatsApp phone number format
export const validateWhatsAppPhone = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\s/g, '').replace(/^\+/, '');
  // Basic validation for international phone numbers
  return /^\d{10,15}$/.test(cleaned);
};

// Get WhatsApp configuration status
export const getWhatsAppConfigStatus = (): {
  configured: boolean;
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  message: string;
} => {
  const hasAccessToken = WHATSAPP_CONFIG.accessToken !== 'YOUR_ACCESS_TOKEN_HERE';
  const hasPhoneNumberId = WHATSAPP_CONFIG.phoneNumberId !== 'YOUR_PHONE_NUMBER_ID_HERE';
  const configured = hasAccessToken && hasPhoneNumberId;
  
  let message = '';
  if (!configured) {
    message = 'WhatsApp Business API not configured. Messages will open in WhatsApp Web.';
  } else {
    message = 'WhatsApp Business API configured and ready for bulk messaging.';
  }
  
  return {
    configured,
    hasAccessToken,
    hasPhoneNumberId,
    message
  };
};