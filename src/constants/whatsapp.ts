export const MESSAGE_TEMPLATE = `Dear {GUARDIAN_NAME},

Here is the {TERM} examination summary for {STUDENT_NAME} ({CLASS}) - Academic Year {ACADEMIC_YEAR}:

📋 PERFORMANCE SUMMARY:
📚 Total Subjects: {TOTAL_SUBJECTS}
🎯 Total Exam Score: {TOTAL_EXAM_SCORE}
📊 Average Score: {AVERAGE_SCORE}%
🏆 Overall Grade: {GRADE}
📍 Class Position: {POSITION}

📖 SUBJECT BREAKDOWN:
{SUBJECTS_BREAKDOWN}

📈 PERFORMANCE ANALYSIS:
{STUDENT_NAME} {PERFORMANCE_MESSAGE}.

Thank you for your continued support in your child's education.

Best regards,
School Examination Management System (SEMS)
Offinso College of Education J.H.S.
"Knowledge is Power"

For any questions, please contact the school administration.`;

export const MESSAGE_PLACEHOLDERS = [
  '{GUARDIAN_NAME}',
  '{STUDENT_NAME}',
  '{CLASS}',
  '{TERM}',
  '{ACADEMIC_YEAR}',
  '{TOTAL_SUBJECTS}',
  '{TOTAL_EXAM_SCORE}',
  '{AVERAGE_SCORE}',
  '{GRADE}',
  '{POSITION}',
  '{SUBJECTS_BREAKDOWN}',
  '{PERFORMANCE_MESSAGE}'
] as const;

export const PERFORMANCE_MESSAGES = {
  90: 'performed excellently and should be congratulated for outstanding achievement',
  80: 'performed very well and is making excellent progress in academic studies',
  70: 'performed well and is showing good improvement across subjects',
  60: 'performed satisfactorily but can improve with more effort and focus',
  50: 'needs additional support and encouragement to improve academic performance',
  0: 'requires urgent attention and extra support to meet academic standards'
} as const;

export const GRADE_THRESHOLDS = {
  'A+': 90,
  'A': 80,
  'B+': 70,
  'B': 60,
  'C': 50,
  'F': 0
} as const;

// WhatsApp Business API Configuration
// Note: In a production environment, these would be set via environment variables
// or a secure configuration management system
export const WHATSAPP_CONFIG = {
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com',
  // Replace these placeholder values with your actual WhatsApp Business API credentials
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID_HERE',
  accessToken: 'YOUR_ACCESS_TOKEN_HERE',
  webhookToken: 'YOUR_WEBHOOK_TOKEN_HERE'
} as const;

// WhatsApp Business API endpoints
export const WHATSAPP_ENDPOINTS = {
  sendMessage: (phoneNumberId: string) => 
    `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${phoneNumberId}/messages`,
  getMedia: (mediaId: string) => 
    `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${mediaId}`,
  uploadMedia: (phoneNumberId: string) => 
    `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${phoneNumberId}/media`
} as const;

// Message template examples for different scenarios
export const MESSAGE_TEMPLATES = {
  EXAM_SUMMARY: MESSAGE_TEMPLATE,
  
  REMINDER: `Dear {GUARDIAN_NAME},

This is a friendly reminder that {STUDENT_NAME} ({CLASS}) has upcoming examinations.

Please ensure your child is prepared and arrives on time.

Thank you,
SEMS - Offinso College of Education J.H.S.`,

  ATTENDANCE_ALERT: `Dear {GUARDIAN_NAME},

We noticed that {STUDENT_NAME} ({CLASS}) was absent from school today ({DATE}).

Please contact the school if there are any concerns.

Best regards,
SEMS - Offinso College of Education J.H.S.`,

  GENERAL_NOTICE: `Dear {GUARDIAN_NAME},

{MESSAGE_CONTENT}

Thank you for your attention.

SEMS - Offinso College of Education J.H.S.
"Knowledge is Power"`
} as const;

// Default message settings
export const DEFAULT_MESSAGE_SETTINGS = {
  enableDeliveryReceipts: true,
  enableReadReceipts: false,
  messageTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 2000 // 2 seconds
} as const;