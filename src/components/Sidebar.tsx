import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  TrendingUp, 
  Settings,
  MessageCircle,
  X,
  ChevronDown,
  Home,
  Award
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  userRole: 'admin' | 'teacher' | 'student';
}

export function Sidebar({ activeSection, onNavigate, sidebarOpen, onCloseSidebar, userRole }: SidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { 
        id: 'dashboard', 
        label: userRole === 'student' ? 'My Reports' : 'Dashboard', 
        icon: userRole === 'student' ? FileText : LayoutDashboard,
        description: userRole === 'student' ? 'View your academic reports' : 'Overview and analytics'
      }
    ];

    if (userRole === 'admin') {
      return [
        ...commonItems,
        { 
          id: 'students', 
          label: 'Students', 
          icon: Users,
          description: 'Manage student records'
        },
        { 
          id: 'teachers', 
          label: 'Teachers', 
          icon: GraduationCap,
          description: 'Manage teaching staff'
        },
        { 
          id: 'subjects', 
          label: 'Subjects', 
          icon: BookOpen,
          description: 'Course management'
        },
        { 
          id: 'scores', 
          label: 'Scores', 
          icon: ClipboardList,
          description: 'Grade management'
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: FileText,
          description: 'Academic reports'
        },
        { 
          id: 'promotion', 
          label: 'Promotion', 
          icon: TrendingUp,
          description: 'Student advancement'
        },
        { 
          id: 'whatsapp', 
          label: 'WhatsApp', 
          icon: MessageCircle,
          description: 'Bulk messaging'
        },
        { 
          id: 'settings', 
          label: 'Settings', 
          icon: Settings,
          description: 'System configuration'
        }
      ];
    } else if (userRole === 'teacher') {
      return [
        ...commonItems,
        { 
          id: 'scores', 
          label: 'Scores', 
          icon: ClipboardList,
          description: 'Manage grades'
        },
  // Teachers no longer have direct access to Report Cards in their portal
      ];
    } else { // student
      return [
        { 
          id: 'reports', 
          label: 'My Reports', 
          icon: FileText,
          description: 'View your academic performance'
        }
      ];
    }
  };

  const menuItems = getMenuItems();

  const handleNavigate = (section: string) => {
    onNavigate(section);
    onCloseSidebar();
    setExpandedMenu(null);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-40 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:z-auto`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sidebar-foreground text-sm">SEMS</h2>
                  <p className="text-xs text-muted-foreground">{userRole === 'admin' ? 'Admin Panel' : userRole === 'teacher' ? 'Teacher Portal' : 'Student Portal'}</p>
                </div>
              </div>
              <Button
                onClick={onCloseSidebar}
                className="md:hidden w-6 h-6 p-0 hover:bg-sidebar-accent"
                variant="ghost"
              >
                <X className="w-4 h-4 text-sidebar-foreground" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  variant="ghost"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-xs opacity-70 truncate">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-sidebar-primary-foreground rounded-full flex-shrink-0" />
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} SEMS
              </p>
              <p className="text-xs text-muted-foreground">
                "Knowledge is Power"
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}