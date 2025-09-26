import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  User, 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  Award,
  Users,
  BookOpen,
  X
} from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Student } from "../utils/database";

interface StudentProfileTabsProps {
  student: Student;
  onClose: () => void;
  currentUserRole?: 'admin' | 'teacher' | 'student';
}

export function StudentProfileTabs({ student, onClose, currentUserRole }: StudentProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("personal");

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "badge-success",
      inactive: "badge-destructive", 
      graduated: "badge-primary"
    };
    return statusStyles[status as keyof typeof statusStyles] || "badge-secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <div className="full-window-overlay" onClick={onClose}>
      <div className="full-window-content bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 bg-white">
          {/* Header with large photo */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Large student photo */}
              <div className="relative">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={`${student.name} photo`}
                    className="w-32 h-32 object-cover rounded-xl border-4 border-primary shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-primary to-purple-600 rounded-xl border-4 border-primary shadow-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`${getStatusBadge(student.status)} text-xs`}>
                    {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Basic info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">{student.name}</h1>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Student ID: <span className="font-semibold text-foreground">e.g. SU001 to latest</span>
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Class: <span className="font-semibold text-foreground">{student.class}</span>
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age: <span className="font-semibold text-foreground">
                      {Math.floor((Date.now() - new Date(student.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={onClose}
              variant="outline" 
              size="icon"
              className="glass"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabbed content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* If the current user is a student, show only the Records/Report tab */}
              <TabsList className={`grid ${'grid-cols-4'} glass mb-6 bg-white`}>
                {/** student users should only see records */}
                <TabsTrigger 
                  value={currentUserRole === 'student' ? 'records' : 'personal'} 
                  className="text-foreground text-xs flex items-center gap-2"
                >
                  {currentUserRole === 'student' ? <FileText className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {currentUserRole === 'student' ? 'Records' : 'Personal'}
                </TabsTrigger>
                {currentUserRole !== 'student' && (
                  <>
                    <TabsTrigger 
                      value="guardian" 
                      className="text-foreground text-xs flex items-center gap-2"
                    >
                      <Users className="w-3 h-3" />
                      Guardian
                    </TabsTrigger>
                    <TabsTrigger 
                      value="academic" 
                      className="text-foreground text-xs flex items-center gap-2"
                    >
                      <Award className="w-3 h-3" />
                      Academic
                    </TabsTrigger>
                    <TabsTrigger 
                      value="records" 
                      className="text-foreground text-xs flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      Records
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card className="glass-card bg-white">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</label>
                        <p className="text-sm font-semibold text-foreground">{student.name}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student ID</label>
                        <p className="text-sm font-semibold text-foreground">{student.id}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gender</label>
                        <p className="text-sm font-semibold text-foreground">{student.gender}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date of Birth</label>
                        <p className="text-sm font-semibold text-foreground">{formatDate(student.dateOfBirth)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Class</label>
                        <p className="text-sm font-semibold text-foreground">{student.class}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
                        <Badge className={`${getStatusBadge(student.status)} mt-1`}>
                          {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admission Date</label>
                        <p className="text-sm font-semibold text-foreground">{formatDate(student.admissionDate)}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</label>
                        <p className="text-sm text-foreground flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          {student.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guardian Information Tab */}
            <TabsContent value="guardian" className="space-y-4">
              <Card className="glass-card bg-white">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Guardian Name</label>
                        <p className="text-sm font-semibold text-foreground">{student.guardianName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
                        <p className="text-sm text-foreground flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {student.guardianPhone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Relationship</label>
                        <p className="text-sm font-semibold text-foreground">Parent/Guardian</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Emergency Contact</label>
                        <p className="text-sm text-foreground">{student.guardianPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Communication Preferences</h4>
                    <div className="flex items-center gap-4 text-sm text-blue-700">
                      <span className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        Phone Calls
                      </span>
                      <span className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        WhatsApp Messages
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Information Tab */}
            <TabsContent value="academic" className="space-y-4">
              <Card className="glass-card bg-white">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-900">Current Class</h4>
                        <p className="text-2xl font-bold text-green-700">{student.class}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900">Academic Year</h4>
                        <p className="text-2xl font-bold text-blue-700">2024</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="text-sm font-semibold text-purple-900">Status</h4>
                        <Badge className={`${getStatusBadge(student.status)} text-sm mt-2`}>
                          {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Academic Progress</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Overall Performance</p>
                        <p className="text-sm font-semibold text-foreground">Good</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                        <p className="text-sm font-semibold text-foreground">95%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Records Tab */}
            <TabsContent value="records" className="space-y-4">
              <Card className="glass-card bg-white">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Student Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Registration Date</label>
                      <p className="text-sm font-semibold text-foreground">{formatDate(student.createdAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Updated</label>
                      <p className="text-sm font-semibold text-foreground">{formatDate(student.updatedAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admission Date</label>
                      <p className="text-sm font-semibold text-foreground">{formatDate(student.admissionDate)}</p>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="text-sm font-semibold text-yellow-900 mb-2">Available Records</h4>
                      <div className="space-y-2 text-sm text-yellow-700">
                        <div className="flex items-center justify-between">
                          <span>Report Cards</span>
                          <Badge variant="outline" className="text-xs">Available</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}