// src/types/index.ts

// User interface
export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'teacher' | 'student';
  email: string;
  phone: string;
  status: string;
  lastLogin: string;
  studentId?: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
}

// Student interface
export interface Student {
  id: string;
  name: string;
  class: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  photo: string;
  admissionDate: string;
  status: string;
  studentId?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Teacher interface
export interface Teacher {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  specialization: string;
  subjects: string[];
  classAssigned?: string;
  isClassTeacher: boolean;
  employmentDate: string;
  status: string;
  photo: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
}

// Subject interface
export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  creditHours: number;
  isCore: boolean;
  teacherId: string;
  subjectId?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

// Score interface
export interface Score {
  id: string;
  studentId: string;
  subjectId: string;
  term: string;
  year: string;
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  teacherId: string;
  academicYear?: any;
  createdAt: string;
  updatedAt: string;
}

// Share data interface for reports
export interface ShareData {
  studentName: string;
  guardianPhone: string;
  reportType: string;
  term: string;
  year: string;
  title: string;
  content: string;
  filename: string;
  type: string;
}

// Statistics cards props for WhatsApp messaging
export interface StatisticsCardsProps {
  totalStudents: number;
  studentsWithGuardians: number;
  studentsWithoutGuardians: number;
  selectedForMessaging: number;
}

// Sending progress props for WhatsApp messaging
export interface SendingProgressProps {
  sent: number;
  total: number;
  configurationMode: string;
}

// App section type
export type AppSection = 
  | 'dashboard' 
  | 'students' 
  | 'teachers' 
  | 'subjects' 
  | 'scores' 
  | 'reports'
  | 'promotion' 
  | 'whatsapp' 
  | 'settings';