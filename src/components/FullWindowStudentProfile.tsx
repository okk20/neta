import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
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
  Save,
  School
} from "lucide-react";
import { db, type Student } from "../utils/database";

interface FullWindowStudentProfileProps {
  studentId: string;
  onClose: () => void;
  onEdit: () => void;
  currentUserRole?: 'admin' | 'teacher' | 'student';
}

interface AttendanceData {
  present: number;
  total: number;
}

export function FullWindowStudentProfile({ studentId, onClose, onEdit }: FullWindowStudentProfileProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState<AttendanceData>({ present: 0, total: 0 });
  const [editingAttendance, setEditingAttendance] = useState(false);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        
        // Load student data
        const students = await db.getAllStudents();
        const studentData = students.find(s => s.id === studentId);
        setStudent(studentData || null);
        
        // Load scores and subjects
        const [allScores, allSubjects] = await Promise.all([
          db.getAllScores(),
          db.getAllSubjects()
        ]);
        
        const studentScores = allScores.filter(score => score.studentId === studentId);
        setScores(studentScores);
        setSubjects(allSubjects);

        // Load or initialize attendance
        const savedAttendance = localStorage.getItem(`attendance_${studentId}`);
        if (savedAttendance) {
          setAttendance(JSON.parse(savedAttendance));
        } else {
          // Set default attendance
          setAttendance({ present: 85, total: 90 });
        }
        
      } catch (error) {
        console.error('Failed to load student data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const saveAttendance = async () => {
    try {
      localStorage.setItem(`attendance_${studentId}`, JSON.stringify(attendance));
      setEditingAttendance(false);
      // You could also save to database here if needed
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  };

  if (loading) {
    return (
      <div className="full-window-overlay">
        <div className="full-window-content">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading student profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="full-window-overlay">
        <div className="full-window-content">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Student Not Found</h3>
              <p className="text-muted-foreground mb-4">The requested student profile could not be loaded.</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate student statistics
  const totalScores = scores.length;
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + (score.classScore + score.examScore), 0) / scores.length)
    : 0;
  const attendanceRate = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 0;

  // Get latest term scores
  const latestScores = scores.filter(score => score.term === 'Term 1' && score.year === '2024');
  const subjectScores = latestScores.map(score => {
    const subject = subjects.find(s => s.id === score.subjectId);
    return {
      subject: subject?.name || 'Unknown Subject',
      classScore: score.classScore,
      examScore: score.examScore,
      totalScore: score.classScore + score.examScore,
      grade: (score.classScore + score.examScore) >= 80 ? 'A' : 
             (score.classScore + score.examScore) >= 70 ? 'B' : 
             (score.classScore + score.examScore) >= 60 ? 'C' : 'D'
    };
  });

  return (
    <div className="full-window-overlay" onClick={onClose}>
      <div className="full-window-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <School className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
              <p className="text-muted-foreground">Complete academic and personal information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUserRole !== 'student' && (
              <Button onClick={onEdit} className="btn-primary">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            <Button onClick={onClose} variant="outline" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Photo and Basic Info - AT TOP */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Large Student Photo */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary flex-shrink-0 border-4 border-primary/20">
                  {student.photo ? (
                    <img 
                      src={student.photo} 
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                      <User className="w-16 h-16 text-primary" />
                    </div>
                  )}
                </div>

                {/* Student Name and ID */}
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{student.name}</h2>
                  <p className="text-lg text-muted-foreground font-mono">ID: e.g. SU001 to latest</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-sm">{student.class}</Badge>
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complete Personal Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <p className="text-foreground font-semibold">{student.name}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <School className="w-4 h-4" />
                    Student ID
                  </label>
                  <p className="text-foreground font-mono font-semibold">{student.id}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Class
                  </label>
                  <p className="text-foreground font-semibold">{student.class}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Gender
                  </label>
                  <p className="text-foreground">{student.gender}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <p className="text-foreground">
                    {new Date(student.dateOfBirth).toLocaleDateString('en-GB')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Admission Date
                  </label>
                  <p className="text-foreground">
                    {new Date(student.admissionDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              
              {student.address && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Home Address
                  </label>
                  <p className="text-foreground bg-secondary/20 p-3 rounded-lg">{student.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guardian Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Guardian Name
                  </label>
                  <p className="text-foreground font-semibold">{student.guardianName}</p>
                </div>
                
                {student.guardianPhone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Guardian Phone
                    </label>
                    <p className="text-foreground font-mono">{student.guardianPhone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Management - NUMERICAL ENTRY */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Attendance Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingAttendance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Days Present
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={attendance.present}
                        onChange={(e) => setAttendance(prev => ({ 
                          ...prev, 
                          present: parseInt(e.target.value) || 0 
                        }))}
                        className="glass"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Total Days
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={attendance.total}
                        onChange={(e) => setAttendance(prev => ({ 
                          ...prev, 
                          total: parseInt(e.target.value) || 1 
                        }))}
                        className="glass"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveAttendance} className="btn-success">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={() => setEditingAttendance(false)} 
                      variant="outline"
                      className="glass"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{attendance.present}</div>
                      <div className="text-sm text-muted-foreground">Days Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{attendance.total}</div>
                      <div className="text-sm text-muted-foreground">Total Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{attendanceRate}%</div>
                      <div className="text-sm text-muted-foreground">Attendance Rate</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setEditingAttendance(true)}
                    variant="outline"
                    className="glass"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Attendance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Statistics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Award className="w-5 h-5" />
                Academic Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{totalScores}</p>
                    <p className="text-sm text-muted-foreground">Total Assessments</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{averageScore}%</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{attendanceRate}%</p>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{attendance.present}/{attendance.total}</p>
                    <p className="text-sm text-muted-foreground">Days Present</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Academic Performance */}
          {subjectScores.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recent Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-foreground">Subject</th>
                        <th className="text-center p-4 font-medium text-foreground">Class Score</th>
                        <th className="text-center p-4 font-medium text-foreground">Exam Score</th>
                        <th className="text-center p-4 font-medium text-foreground">Total</th>
                        <th className="text-center p-4 font-medium text-foreground">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectScores.map((score, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="p-4 text-foreground font-medium">{score.subject}</td>
                          <td className="p-4 text-center text-foreground">{score.classScore}</td>
                          <td className="p-4 text-center text-foreground">{score.examScore}</td>
                          <td className="p-4 text-center font-bold text-foreground">{score.totalScore}</td>
                          <td className="p-4 text-center">
                            <Badge 
                              variant={score.grade === 'A' ? 'default' : 'secondary'}
                              className={
                                score.grade === 'A' ? 'bg-green-600 text-white' :
                                score.grade === 'B' ? 'bg-blue-600 text-white' :
                                score.grade === 'C' ? 'bg-yellow-600 text-white' :
                                'bg-red-600 text-white'
                              }
                            >
                              {score.grade}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}