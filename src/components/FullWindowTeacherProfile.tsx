import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  X, 
  Edit, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users,
  GraduationCap,
  Award,
  Clock,
  UserCheck,
  Mail,
  Home,
  School,
  Briefcase,
  Star
} from "lucide-react";
import { db, type Teacher } from "../utils/database";

interface FullWindowTeacherProfileProps {
  teacherId: string;
  onClose: () => void;
  onEdit: () => void;
}

export function FullWindowTeacherProfile({ teacherId, onClose, onEdit }: FullWindowTeacherProfileProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        
        // Load teacher data
        const teachers = await db.getAllTeachers();
        const teacherData = teachers.find(t => t.id === teacherId);
        setTeacher(teacherData || null);
        
        // Load related data
        const [allSubjects, allStudents] = await Promise.all([
          db.getAllSubjects(),
          db.getAllStudents()
        ]);
        
        setSubjects(allSubjects);
        setStudents(allStudents);
        
      } catch (error) {
        console.error('Failed to load teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      loadTeacherData();
    }
  }, [teacherId]);

  if (loading) {
    return (
      <div className="full-window-overlay">
        <div className="full-window-content">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading teacher profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="full-window-overlay">
        <div className="full-window-content">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Teacher Not Found</h3>
              <p className="text-muted-foreground mb-4">The requested teacher profile could not be loaded.</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get teacher's subjects
  const teacherSubjects = subjects.filter(subject => 
    teacher.subjects?.includes(subject.id)
  );

  // Get students in teacher's assigned class
  const classStudents = teacher.isClassTeacher ? 
    students.filter(student => student.class === teacher.classAssigned) : [];

  const totalStudents = teacher.isClassTeacher ? classStudents.length : students.length;

  return (
    <div className="full-window-overlay" onClick={onClose}>
      <div className="full-window-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teacher Profile</h1>
              <p className="text-muted-foreground">Professional and academic information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onEdit} className="btn-primary">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button onClick={onClose} variant="outline" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Teacher Photo and Basic Info - AT TOP */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Teacher Photo */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary flex-shrink-0 border-4 border-primary/20">
                  {teacher.photo ? (
                    <img 
                      src={teacher.photo} 
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                      <GraduationCap className="w-16 h-16 text-primary" />
                    </div>
                  )}
                </div>

                {/* Teacher Name and ID */}
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {teacher.title || 'Mr.'} {teacher.name}
                  </h2>
                  <p className="text-lg text-muted-foreground font-mono">ID: e.g. TE001 to latest</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-sm">
                      {teacher.subjects?.length || 0} Subject{(teacher.subjects?.length || 0) !== 1 ? 's' : ''}
                    </Badge>
                    {teacher.isClassTeacher && (
                      <Badge variant="default" className="text-sm bg-blue-600">
                        Class Teacher
                      </Badge>
                    )}
                    <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                      {teacher.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complete Professional Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <p className="text-foreground font-semibold">
                    {teacher.title || 'Mr.'} {teacher.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <School className="w-4 h-4" />
                    Teacher ID
                  </label>
                  <p className="text-foreground font-mono font-semibold">{teacher.id}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Qualification
                  </label>
                  <p className="text-foreground">{teacher.qualification || 'Not specified'}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Employment Date
                  </label>
                  <p className="text-foreground">
                    {teacher.employmentDate ? 
                      new Date(teacher.employmentDate).toLocaleDateString('en-GB') : 
                      'Not specified'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Employment Type
                  </label>
                  <p className="text-foreground">{teacher.employmentType || 'Full-time'}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Gender
                  </label>
                  <p className="text-foreground">{teacher.gender || 'Not specified'}</p>
                </div>
              </div>
              
              {teacher.address && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Home Address
                  </label>
                  <p className="text-foreground bg-secondary/20 p-3 rounded-lg">{teacher.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <p className="text-foreground font-mono">{teacher.phone || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="text-foreground">{teacher.email || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Assignments */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Teaching Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subjects Taught */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Subjects Teaching</h4>
                {teacherSubjects.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {teacherSubjects.map((subject, index) => (
                      <div 
                        key={index}
                        className="bg-secondary/20 p-3 rounded-lg text-center"
                      >
                        <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-semibold text-foreground">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">({subject.code})</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No subjects assigned</p>
                )}
              </div>

              {/* Class Teacher Assignment */}
              {teacher.isClassTeacher && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Class Teacher Assignment
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">Class: {teacher.classAssigned}</p>
                        <p className="text-sm text-muted-foreground">
                          {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} in class
                        </p>
                      </div>
                      <Badge variant="default" className="bg-blue-600">
                        Class Teacher
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Award className="w-5 h-5" />
                Teaching Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{teacherSubjects.length}</p>
                    <p className="text-sm text-muted-foreground">Subjects Teaching</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Students Impacted</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {teacher.isClassTeacher ? 1 : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Class Responsibility</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">Active</p>
                    <p className="text-sm text-muted-foreground">Employment Status</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Students (if class teacher) */}
          {teacher.isClassTeacher && classStudents.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Class Students ({teacher.classAssigned})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classStudents.slice(0, 6).map((student) => (
                    <div key={student.id} className="bg-secondary/20 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20">
                          {student.photo ? (
                            <img 
                              src={student.photo} 
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {classStudents.length > 6 && (
                    <div className="bg-secondary/20 p-3 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        +{classStudents.length - 6} more students
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}