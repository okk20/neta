import { useState, useEffect } from "react";
import { Dashboard } from "./Dashboard";
import { StudentManagement } from "./StudentManagement";
import { TeacherManagement } from "./TeacherManagement";
import { SubjectManagement } from "./SubjectManagement";
import { ScoreManagement } from "./ScoreManagement";
import { EnhancedReportsManagement } from "./EnhancedReportsManagement";
import { PromotionManagement } from "./PromotionManagement";
import { SettingsManagement } from "./SettingsManagement";
import { WhatsAppBulkMessaging } from "./WhatsAppBulkMessaging";
import { APP_SECTIONS, canAccessSection } from "../constants/app";
import type { User } from "../utils/database";

interface ContentRouterProps {
  activeSection: string;
  currentUser: User;
  onNavigate: (section: string) => void;
  studentId?: string;
}

export function ContentRouter({ activeSection, currentUser, onNavigate, studentId }: ContentRouterProps) {
  // If the user is a student, force the active section to REPORTS
  const effectiveSection = currentUser.role === 'student' ? APP_SECTIONS.REPORTS : activeSection;

  // Check if user can access the current section
  if (!canAccessSection(effectiveSection as any, currentUser.role)) {
    return <Dashboard onNavigate={onNavigate} username={currentUser.username} />;
  }

  switch (effectiveSection) {
    case APP_SECTIONS.DASHBOARD:
      return currentUser.role === 'student' ? 
        <EnhancedReportsManagement currentUser={currentUser} studentId={currentUser.studentId || studentId} /> :
        <Dashboard onNavigate={onNavigate} username={currentUser.username} />;
        
    case APP_SECTIONS.STUDENTS:
      return <StudentManagement currentUser={currentUser} />;
      
    case APP_SECTIONS.TEACHERS:
      return <TeacherManagement />;
      
    case APP_SECTIONS.SUBJECTS:
      return <SubjectManagement />;
      
    case APP_SECTIONS.SCORES:
      return <ScoreManagement currentUser={currentUser} />;
      
    case APP_SECTIONS.REPORTS:
      return <EnhancedReportsManagement currentUser={currentUser} studentId={currentUser.studentId || studentId} />;
      
    case APP_SECTIONS.PROMOTION:
      return <PromotionManagement />;
      
    case APP_SECTIONS.WHATSAPP:
      return <WhatsAppBulkMessaging />;
      
    case APP_SECTIONS.SETTINGS:
      return <SettingsManagement onUsernameChange={() => {}} currentUser={currentUser} />;
      
    default:
      return <Dashboard onNavigate={onNavigate} username={currentUser.username} />;
  }
}