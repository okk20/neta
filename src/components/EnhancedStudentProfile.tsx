import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Modal } from "./ui/modal";
import { AttendanceManagement } from "./AttendanceManagement";
import { 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  GraduationCap, 
  BookOpen, 
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  FileText,
  Download,
  Upload,
  Trash2
} from "lucide-react";
import { db, type Student } from "../utils/database";

interface EnhancedStudentProfileProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EnhancedStudentProfile({ student, isOpen, onClose, onUpdate }: EnhancedStudentProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [studentForm, setStudentForm] = useState({
    name: student.name,
    class: student.class,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    address: student.address,
    photo: student.photo || '',
    admissionDate: student.admissionDate,
    status: student.status
  });

  const [attendanceData, setAttendanceData] = useState({
    totalDays: 180,
    presentDays: 162,
    absentDays: 15,
    lateDays: 3,
    excusedDays: 2,
    attendanceRate: 90
  });

  const [academicData, setAcademicData] = useState({
    currentGPA: 3.2,
    subjects: [
      { name: 'Mathematics', grade: 'B+', score: 85 },
      { name: 'English', grade: 'A-', score: 88 },
      { name: 'Science', grade: 'B', score: 82 },
      { name: 'Social Studies', grade: 'A', score: 90 },
      { name: 'ICT', grade: 'B+', score: 86 }
    ],
    termPosition: 5,
    classSize: 42
  });

  useEffect(() => {
    if (student) {
      setStudentForm({
        name: student.name,
        class: student.class,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        address: student.address,
        photo: student.photo || '',
        admissionDate: student.admissionDate,
        status: student.status
      });
      loadStudentData();
    }
  }, [student]);

  const loadStudentData = async () => {
    try {
      // Load attendance data (mock data for now)
      const mockAttendance = {
        totalDays: 180,
        presentDays: Math.floor(Math.random() * 20) + 150,
        absentDays: Math.floor(Math.random() * 15) + 5,
        lateDays: Math.floor(Math.random() * 8) + 2,
        excusedDays: Math.floor(Math.random() * 5) + 1,
        attendanceRate: 0
      };
      mockAttendance.attendanceRate = Math.round((mockAttendance.presentDays / mockAttendance.totalDays) * 100);
      setAttendanceData(mockAttendance);

      // Load academic data (mock data for now)
      const mockAcademic = {
        currentGPA: parseFloat((Math.random() * 2 + 2.0).toFixed(1)),
        subjects: [
          { name: 'Mathematics', grade: ['A', 'B+', 'B', 'C+'][Math.floor(Math.random() * 4)], score: Math.floor(Math.random() * 30) + 70 },
          { name: 'English', grade: ['A', 'B+', 'B', 'C+'][Math.floor(Math.random() * 4)], score: Math.floor(Math.random() * 30) + 70 },
          { name: 'Science', grade: ['A', 'B+', 'B', 'C+'][Math.floor(Math.random() * 4)], score: Math.floor(Math.random() * 30) + 70 },
          { name: 'Social Studies', grade: ['A', 'B+', 'B', 'C+'][Math.floor(Math.random() * 4)], score: Math.floor(Math.random() * 30) + 70 },
          { name: 'ICT', grade: ['A', 'B+', 'B', 'C+'][Math.floor(Math.random() * 4)], score: Math.floor(Math.random() * 30) + 70 }
        ],
        termPosition: Math.floor(Math.random() * 15) + 1,
        classSize: 42
      };
      setAcademicData(mockAcademic);
    } catch (error) {
      console.error('Failed to load student data:', error);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await db.updateStudent(student.id, studentForm);
      setSuccess('Student information updated successfully!');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Failed to update student:', error);
      setError(error.message || 'Failed to update student information.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStudentForm(prev => ({ ...prev, photo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.name} - Student Profile`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Success/Error Messages */}
        {error && (
          <Alert className="py-2 border-red-500 bg-red-900/20">
            <AlertCircle className="h-3 w-3 text-red-400" />
            <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="py-2 border-green-500 bg-green-900/20">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <AlertDescription className="text-green-300 text-xs">{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-secondary border-2 border-border">
              {studentForm.photo ? (
                <img 
                  src={studentForm.photo} 
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20">
                  <Users className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="glass input-compact text-xs"
                />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {isEditing ? (
                  <Input
                    value={studentForm.name}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="glass text-lg font-bold mb-2 h-8"
                  />
                ) : (
                  <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
                )}
                <p className="text-muted-foreground text-sm">Student ID: e.g. SU001 to latest</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="badge-secondary text-xs">
                    {studentForm.class}
                  </Badge>
                  <Badge 
                    variant={student.status === 'active' ? 'default' : 'secondary'}
                    className={student.status === 'active' ? 'badge-success text-xs' : 'badge-secondary text-xs'}
                  >
                    {student.status}
                  </Badge>
                  <Badge variant="secondary" className="badge-primary text-xs">
                    Age: {calculateAge(student.dateOfBirth)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white btn-compact"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white btn-compact"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="glass btn-compact"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
            <TabsTrigger value="academic" className="text-xs">Academic</TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs">Attendance</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardHeader className="card-compact-header">
                  <CardTitle className="text-foreground text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-compact">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <span className="text-foreground">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="text-foreground">{student.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class:</span>
                      <span className="text-foreground">{student.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Admission Date:</span>
                      <span className="text-foreground">{new Date(student.admissionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="card-compact-header">
                  <CardTitle className="text-foreground text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-compact">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground">{student.guardianName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{student.guardianPhone || 'Not provided'}</span>
                    </div>
                    {student.address && (
                      <div>
                        <span className="text-muted-foreground">Address:</span>
                        <p className="text-foreground mt-1 text-xs">{student.address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold text-foreground">{academicData.currentGPA}</p>
                  <p className="text-xs text-muted-foreground">Current GPA</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="text-lg font-bold text-foreground">{academicData.termPosition}</p>
                  <p className="text-xs text-muted-foreground">Class Position</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-lg font-bold text-foreground">{attendanceData.attendanceRate}%</p>
                  <p className="text-xs text-muted-foreground">Attendance Rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader className="card-compact-header">
                <CardTitle className="text-foreground text-sm">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-foreground">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={studentForm.name}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                        className="glass input-compact mt-1"
                      />
                    ) : (
                      <p className="text-sm text-foreground mt-1">{student.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-xs text-foreground">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={studentForm.dateOfBirth}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="glass input-compact mt-1"
                      />
                    ) : (
                      <p className="text-sm text-foreground mt-1">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-foreground">Gender</Label>
                    {isEditing ? (
                      <Select value={studentForm.gender} onValueChange={(value) => setStudentForm(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger className="glass input-compact mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-foreground mt-1">{student.gender}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-foreground">Class</Label>
                    {isEditing ? (
                      <Select value={studentForm.class} onValueChange={(value) => setStudentForm(prev => ({ ...prev, class: value }))}>
                        <SelectTrigger className="glass input-compact mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          {['B.S.7A', 'B.S.7B', 'B.S.7C', 'B.S.8A', 'B.S.8B', 'B.S.8C', 'B.S.9A', 'B.S.9B', 'B.S.9C'].map(cls => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-foreground mt-1">{student.class}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-foreground">Guardian Name</Label>
                    {isEditing ? (
                      <Input
                        value={studentForm.guardianName}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, guardianName: e.target.value }))}
                        className="glass input-compact mt-1"
                      />
                    ) : (
                      <p className="text-sm text-foreground mt-1">{student.guardianName}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-foreground">Guardian Phone</Label>
                    {isEditing ? (
                      <Input
                        value={studentForm.guardianPhone}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                        className="glass input-compact mt-1"
                        placeholder="+233 XX XXX XXXX"
                      />
                    ) : (
                      <p className="text-sm text-foreground mt-1">{student.guardianPhone || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-xs text-foreground">Address</Label>
                  {isEditing ? (
                    <Textarea
                      value={studentForm.address}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                      className="glass textarea-compact mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-foreground mt-1">{student.address || 'Not provided'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold text-foreground">{academicData.subjects.length}</p>
                  <p className="text-xs text-muted-foreground">Subjects Enrolled</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="text-lg font-bold text-foreground">{academicData.termPosition}/{academicData.classSize}</p>
                  <p className="text-xs text-muted-foreground">Class Ranking</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-lg font-bold text-foreground">{academicData.currentGPA}</p>
                  <p className="text-xs text-muted-foreground">Current GPA</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader className="card-compact-header">
                <CardTitle className="text-foreground text-sm">Subject Performance</CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="space-y-3">
                  {academicData.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{subject.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {subject.score}%
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            subject.grade === 'A' ? 'badge-success' :
                            subject.grade.startsWith('B') ? 'badge-primary' :
                            'badge-warning'
                          }`}
                        >
                          {subject.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-400" />
                  <p className="text-base font-bold text-foreground">{attendanceData.presentDays}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <XCircle className="w-6 h-6 mx-auto mb-1 text-red-400" />
                  <p className="text-base font-bold text-foreground">{attendanceData.absentDays}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
                  <p className="text-base font-bold text-foreground">{attendanceData.lateDays}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                  <p className="text-base font-bold text-foreground">{attendanceData.excusedDays}</p>
                  <p className="text-xs text-muted-foreground">Excused</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="card-compact text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="text-base font-bold text-foreground">{attendanceData.attendanceRate}%</p>
                  <p className="text-xs text-muted-foreground">Rate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader className="card-compact-header">
                <CardTitle className="text-foreground text-sm">Detailed Attendance</CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <AttendanceManagement 
                  studentId={student.id}
                  studentName={student.name}
                  onClose={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader className="card-compact-header">
                <CardTitle className="text-foreground text-sm">Student Documents</CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Report Card - Term 1</span>
                    </div>
                    <Button size="sm" variant="outline" className="glass btn-compact">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Transcript</span>
                    </div>
                    <Button size="sm" variant="outline" className="glass btn-compact">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Certificate</span>
                    </div>
                    <Button size="sm" variant="outline" className="glass btn-compact">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="border-t border-border pt-3 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-xs text-foreground">Upload Document</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="glass input-compact flex-1"
                      />
                      <Button size="sm" className="bg-primary text-primary-foreground btn-compact">
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            onClick={onClose}
            variant="outline"
            className="glass flex-1 btn-compact"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}