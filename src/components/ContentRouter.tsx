import { Suspense, lazy } from "react";
import { APP_SECTIONS, canAccessSection } from "../constants/app";
import { LoadingFallback } from "./LoadingFallback";
import type { User } from "../utils/database";

// Lazy load components for code splitting
const Dashboard = lazy(() => import("./Dashboard"));
const StudentManagement = lazy(() => import("./StudentManagement"));
const TeacherManagement = lazy(() => import("./TeacherManagement"));
const SubjectManagement = lazy(() => import("./SubjectManagement"));
const ScoreManagement = lazy(() => import("./ScoreManagement"));
const EnhancedReportsManagement = lazy(() => import("./EnhancedReportsManagement"));
const PromotionManagement = lazy(() => import("./PromotionManagement"));
const SettingsManagement = lazy(() => import("./SettingsManagement"));
const WhatsAppBulkMessaging = lazy(() => import("./WhatsAppBulkMessaging"));

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
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Dashboard onNavigate={onNavigate} username={currentUser.username} />
      </Suspense>
    );
  }

  switch (effectiveSection) {
    case APP_SECTIONS.DASHBOARD:
      return currentUser.role === 'student' ? (
        <Suspense fallback={<LoadingFallback />}>
          <EnhancedReportsManagement currentUser={currentUser} studentId={currentUser.studentId || studentId} />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard onNavigate={onNavigate} username={currentUser.username} />
        </Suspense>
      );
        
    case APP_SECTIONS.STUDENTS:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <StudentManagement currentUser={currentUser} />
        </Suspense>
      );
      
    case APP_SECTIONS.TEACHERS:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <TeacherManagement />
        </Suspense>
      );
      
    case APP_SECTIONS.SUBJECTS:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SubjectManagement />
        </Suspense>
      );
      
    case APP_SECTIONS.SCORES:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ScoreManagement currentUser={currentUser} />
        </Suspense>
      );
      
    case APP_SECTIONS.REPORTS:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <EnhancedReportsManagement currentUser={currentUser} studentId={currentUser.studentId || studentId} />
        </Suspense>
      );
      
    case APP_SECTIONS.PROMOTION:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <PromotionManagement />
        </Suspense>
      );
      
    case APP_SECTIONS.WHATSAPP:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <WhatsAppBulkMessaging />
        </Suspense>
      );
      
    case APP_SECTIONS.SETTINGS:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SettingsManagement onUsernameChange={() => {}} currentUser={currentUser} />
        </Suspense>
      );
      
    default:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard onNavigate={onNavigate} username={currentUser.username} />
        </Suspense>
      );
  }
}