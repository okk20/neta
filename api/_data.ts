// In-memory data store for Vercel Serverless Functions (demo-ready)
// NOTE: This resets on each deployment/scale. Persist with a DB when ready.

export type User = {
  id: string;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  studentId?: string;
  teacherId?: string;
};

export type Student = {
  id: string; // e.g., SU-1
  name: string;
  class?: string;
  gender?: string;
  photo?: string;
};

export type Teacher = {
  id: string; // e.g., TU-1
  name: string;
  phone?: string;
  email?: string;
};

export type Subject = {
  id: string;
  name: string;
  code?: string;
};

export type Score = {
  id: string;
  studentId: string;
  subjectId: string;
  term: string;
  year: string;
  classScore: number;
  examScore: number;
};

export type Settings = {
  [key: string]: any;
};

// Seed data
const now = new Date().toISOString();

export const settings: Settings = {
  schoolSettings: {
    schoolName: 'School Examination Management System (SEMS)',
    address: 'Offinso, Ashanti Region, Ghana',
    phone: '+233 24 000 0000',
    email: 'info@oce.edu.gh',
    website: 'www.oce.edu.gh',
    logo: '',
    principalName: 'Dr. Samuel Adjei',
    principalSignature: '',
    headmasterName: '',
    currentTerm: 'Term 1',
    currentYear: '2024',
    motto: 'Knowledge is Power',
    establishedYear: '1995',
    updatedAt: now,
  },
  systemSettings: {
    theme: 'black',
  },
};

export const users: User[] = [
  {
    id: 'ADMIN_001',
    username: 'admin',
    role: 'admin',
    email: 'admin@example.com',
    status: 'active',
    lastLogin: now,
  },
];

export const students: Student[] = [
  { id: 'SU-1', name: 'John Mensah', class: 'JHS 1', gender: 'Male' },
  { id: 'SU-2', name: 'Ama Serwaa', class: 'JHS 2', gender: 'Female' },
];

export const teachers: Teacher[] = [
  { id: 'TU-1', name: 'Mr. Kwame Asare', phone: '+233200000001', email: 'kwame@example.com' },
  { id: 'TU-2', name: 'Mrs. Adwoa Kumah', phone: '+233200000002', email: 'adwoa@example.com' },
];

export const subjects: Subject[] = [
  { id: 'SUB-ENG', name: 'English', code: 'ENG' },
  { id: 'SUB-MATH', name: 'Mathematics', code: 'MATH' },
  { id: 'SUB-SCI', name: 'Science', code: 'SCI' },
];

export const scores: Score[] = [
  { id: 'SC-1', studentId: 'SU-1', subjectId: 'SUB-ENG', term: 'Term 1', year: '2024', classScore: 25, examScore: 60 },
  { id: 'SC-2', studentId: 'SU-1', subjectId: 'SUB-MATH', term: 'Term 1', year: '2024', classScore: 28, examScore: 58 },
];

export function ok<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function created<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function error(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
