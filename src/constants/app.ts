import type { User } from "../utils/database";

export const APP_SECTIONS = {
  DASHBOARD: 'dashboard',
  STUDENTS: 'students', 
  TEACHERS: 'teachers',
  SUBJECTS: 'subjects',
  SCORES: 'scores',
  REPORTS: 'reports',
  PROMOTION: 'promotion',
  WHATSAPP: 'whatsapp',
  SETTINGS: 'settings'
} as const;

export type AppSection = typeof APP_SECTIONS[keyof typeof APP_SECTIONS];

export const getSectionTitle = (activeSection: string, userRole?: string): string => {
  const titles: Record<string, string> = {
    [APP_SECTIONS.DASHBOARD]: userRole === 'student' ? "Student Portal" : 
                             userRole === 'teacher' ? "Teacher Portal" : "Welcome to SEMS Dashboard",
    [APP_SECTIONS.STUDENTS]: "Student Management",
    [APP_SECTIONS.TEACHERS]: "Teacher Management", 
    [APP_SECTIONS.SUBJECTS]: "Subject Management",
    [APP_SECTIONS.SCORES]: "Score Management",
    [APP_SECTIONS.REPORTS]: "Reports Management",
    [APP_SECTIONS.PROMOTION]: "Promotion Management",
    [APP_SECTIONS.WHATSAPP]: "WhatsApp Messaging",
    [APP_SECTIONS.SETTINGS]: "Settings Management"
  };
  return titles[activeSection] || "School Examination Management";
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export const getDefaultSection = (user: User): AppSection => {
  if (user.role === 'student') {
    return APP_SECTIONS.REPORTS;
  }
  if (user.role === 'teacher') {
    return APP_SECTIONS.DASHBOARD;
  }
  return APP_SECTIONS.DASHBOARD;
};

export const canAccessSection = (section: AppSection, userRole: string): boolean => {
  const adminOnlyAccess = [
    APP_SECTIONS.STUDENTS,
    APP_SECTIONS.TEACHERS, 
    APP_SECTIONS.SUBJECTS,
    APP_SECTIONS.PROMOTION,
    APP_SECTIONS.WHATSAPP,
    APP_SECTIONS.SETTINGS
  ];
  
  const teacherAccess = [
    APP_SECTIONS.SCORES
  ];
  
  if (userRole === 'admin') {
    return true; // Admin has access to all sections
  }
  
  if (userRole === 'teacher') {
  // Teachers can access most non-admin sections, but not the reports page for printing report cards
  if (section === APP_SECTIONS.REPORTS) return false;
  return !adminOnlyAccess.includes(section);
  }
  
  if (userRole === 'student') {
    return [APP_SECTIONS.DASHBOARD, APP_SECTIONS.REPORTS].includes(section);
  }
  
  return false;
};