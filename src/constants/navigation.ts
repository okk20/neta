import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Settings,
  UserPlus
} from "lucide-react";

export const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "students", label: "Students", icon: Users },
  { id: "teachers", label: "Teachers", icon: GraduationCap },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "scores", label: "Scores", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "promotion", label: "Promotion", icon: UserPlus },
  { id: "settings", label: "Settings", icon: Settings },
];