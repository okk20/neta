export const CLASSES = ['B.S.7A', 'B.S.7B', 'B.S.7C', 'B.S.8A', 'B.S.8B', 'B.S.8C', 'B.S.9A', 'B.S.9B', 'B.S.9C'];

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

// Generate years from 2022 to current year + 10 years into the future
const currentYear = new Date().getFullYear();
export const YEARS = Array.from(
  { length: currentYear + 10 - 2022 + 1 },
  (_, i) => (2022 + i).toString()
);

export const SCORE_LIMITS = {
  CLASS_SCORE_MIN: 0,
  CLASS_SCORE_MAX: 50,
  EXAM_SCORE_MIN: 0,
  EXAM_SCORE_MAX: 50,
  TOTAL_SCORE_MAX: 100
} as const;

// Updated to use only A, B, C, D grades
export const GRADE_THRESHOLDS = {
  A: 80,
  B: 70,
  C: 60,
  D: 0  // Everything below 60 is D
} as const;

export const GRADE_COLORS = {
  A: 'text-green-500',   // Excellent - Green
  B: 'text-blue-500',    // Very Good - Blue  
  C: 'text-yellow-500',  // Good - Yellow
  D: 'text-red-500'      // Needs Improvement - Red
} as const;

export const SCORE_VALIDATION_MESSAGES = {
  STUDENT_REQUIRED: 'Please select a student',
  SUBJECT_REQUIRED: 'Please select a subject',
  CLASS_SCORE_INVALID: 'Class score must be between 0 and 50',
  EXAM_SCORE_INVALID: 'Exam score must be between 0 and 50',
  ADMIN_DELETE_ONLY: 'Only administrators can delete scores.',
  STUDENT_NO_ENTRY: 'Students cannot enter scores',
  STUDENT_NO_UPDATE: 'Students cannot update scores'
} as const;

export const DEFAULT_SCORE_FORM = {
  studentId: '',
  subjectId: '',
  term: 'Term 1',
  year: new Date().getFullYear().toString(),
  classScore: 0,
  examScore: 0,
  remarks: ''
} as const;