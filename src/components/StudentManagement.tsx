import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Modal } from "./ui/modal";
import { StudentProfileTabs } from "./StudentProfileTabs";
import { AttendanceManagement } from "./AttendanceManagement";
import { 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserCheck,
  Download,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import { db, type Student, type User } from "../utils/database";

interface StudentManagementProps {
  currentUser?: User;
}

export function StudentManagement({ currentUser }: StudentManagementProps = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL_CLASSES');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const [studentForm, setStudentForm] = useState({
    name: '',
    class: '',
    dateOfBirth: '',
    gender: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    photo: '',
    admissionDate: new Date().toISOString().split('T')[0]
  });

  const classes = ['B.S.7A', 'B.S.7B', 'B.S.7C', 'B.S.8A', 'B.S.8B', 'B.S.8C', 'B.S.9A', 'B.S.9B', 'B.S.9C'];

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsList = await db.getAllStudents();
      setStudents(studentsList);
      setError('');
    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setStudentForm({
      name: '',
      class: '',
      dateOfBirth: '',
      gender: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
      photo: '',
      admissionDate: new Date().toISOString().split('T')[0]
    });
    setEditingStudent(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      // Validation
      if (!studentForm.name.trim()) {
        throw new Error('Student name is required');
      }
      if (!studentForm.class) {
        throw new Error('Class is required');
      }
      if (!studentForm.dateOfBirth) {
        throw new Error('Date of birth is required');
      }
      if (!studentForm.gender) {
        throw new Error('Gender is required');
      }
      if (!studentForm.guardianName.trim()) {
        throw new Error('Guardian name is required');
      }

      const studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
        name: studentForm.name.trim(),
        class: studentForm.class,
        dateOfBirth: studentForm.dateOfBirth,
        gender: studentForm.gender,
        guardianName: studentForm.guardianName.trim(),
        guardianPhone: studentForm.guardianPhone.trim(),
        address: studentForm.address.trim(),
        photo: studentForm.photo.trim(),
        admissionDate: studentForm.admissionDate,
        status: 'active'
      };

      if (editingStudent) {
        await db.updateStudent(editingStudent.id, studentData);
        setSuccess('Student updated successfully!');
      } else {
        await db.addStudent(studentData as Student);
        setSuccess('Student added successfully!');
      }

      await loadStudents();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save student:', error);
      setError(error.message || 'Failed to save student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setStudentForm({
      name: student.name,
      class: student.class,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      photo: student.photo || '',
      admissionDate: student.admissionDate
    });
    setEditingStudent(student);
    setShowModal(true);
    clearMessages();
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleAttendance = (student: Student) => {
    setSelectedStudent(student);
    setShowAttendanceModal(true);
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await db.deleteStudent(student.id);
      setSuccess('Student deleted successfully!');
      await loadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
      setError('Failed to delete student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export students data
  const handleExportData = async () => {
    try {
      const data = {
        students: students,
        exportDate: new Date().toISOString(),
        totalCount: students.length
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Student data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Failed to export student data.');
    }
  };

  // Import students data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setLoading(true);
          const jsonData = event.target?.result as string;
          const importedData = JSON.parse(jsonData);
          
          if (importedData.students && Array.isArray(importedData.students)) {
            for (const studentData of importedData.students) {
              await db.addStudent(studentData);
            }
            setSuccess(`Successfully imported ${importedData.students.length} students!`);
            await loadStudents();
          } else {
            throw new Error('Invalid file format. Expected students array.');
          }
        } catch (error) {
          console.error('Failed to import data:', error);
          setError('Failed to import student data. Please check the file format.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'ALL_CLASSES' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

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

  return (
    <div className="space-y-3">
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            Student Management
          </CardTitle>
        </CardHeader>
        <CardContent className="card-compact space-y-3">
          {/* Success/Error Messages */}
          {error && (
            <Alert className="py-1 border-red-500 bg-red-900/20">
              <AlertCircle className="h-2.5 w-2.5 text-red-400" />
              <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="py-1 border-green-500 bg-green-900/20">
              <CheckCircle className="h-2.5 w-2.5 text-green-400" />
              <AlertDescription className="text-green-300 text-xs">{success}</AlertDescription>
            </Alert>
          )}

          {/* Ultra Compact Controls with Import/Export */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-1.5 top-1.5 h-2.5 w-2.5 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass pl-6 input-compact"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="glass w-full sm:w-32 input-compact">
                <SelectValue placeholder="Filter class" />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="ALL_CLASSES">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Data Management Buttons */}
            <Button
              onClick={handleExportData}
              variant="outline"
              className="glass btn-compact"
              title="Export Student Data"
            >
              <Download className="w-2.5 h-2.5 mr-1" />
              Export
            </Button>
            
            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                className="glass btn-compact"
                title="Import Student Data"
              >
                <Upload className="w-2.5 h-2.5 mr-1" />
                Import
              </Button>
            </div>

            <Button
              onClick={() => {
                setShowModal(true);
                clearMessages();
              }}
              className="bg-green-600 hover:bg-green-700 text-white btn-compact"
            >
              <UserPlus className="w-2.5 h-2.5 mr-1" />
              Add
            </Button>
          </div>

          {/* Ultra Compact Statistics */}
          <div className="grid grid-cols-4 grid-compact-sm">
            {[
              { label: 'Total', value: students.length, icon: Users, color: 'text-primary' },
              { label: 'Active', value: students.filter(s => s.status === 'active').length, icon: CheckCircle, color: 'text-green-400' },
              { label: 'Classes', value: new Set(students.map(s => s.class)).size, icon: Calendar, color: 'text-blue-400' },
              { label: 'Results', value: filteredStudents.length, icon: Filter, color: 'text-foreground' }
            ].map((stat, index) => (
              <div key={index} className="glass-card card-compact text-center">
                <stat.icon className={`w-3 h-3 mx-auto mb-0.5 ${stat.color}`} />
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Ultra Compact Students List */}
          {loading && !showModal ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-1 text-sm">No Students Found</h3>
              <p className="text-muted-foreground text-xs mb-2">
                {searchTerm || filterClass !== 'ALL_CLASSES' ? 'No students match your criteria.' : 'Start by adding students.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-compact-sm">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="glass-card hover:shadow-lg transition-all duration-200">
                  <CardContent className="card-compact">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-secondary">
                        {student.photo ? (
                          <img 
                            src={student.photo} 
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate text-xs">{student.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: e.g. SU001 to latest</p>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {student.class}
                          </Badge>
                          <Badge 
                            variant={student.status === 'active' ? 'default' : 'secondary'}
                            className={`text-xs px-1 py-0 ${student.status === 'active' ? 'bg-green-600' : ''}`}
                          >
                            {student.status}
                          </Badge>
                        </div>
                        <div className="mt-0.5 space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-2 h-2" />
                            <span className="truncate">{student.guardianPhone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-2 h-2" />
                            <span>{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        onClick={() => handleView(student)}
                        size="sm"
                        variant="outline"
                        className="glass flex-1 btn-compact"
                      >
                        <Eye className="w-2 h-2 mr-0.5" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleEdit(student)}
                        size="sm"
                        variant="outline"
                        className="glass flex-1 btn-compact"
                      >
                        <Edit className="w-2 h-2 mr-0.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleAttendance(student)}
                        size="sm"
                        variant="outline"
                        className="glass btn-compact-icon"
                        title="Attendance"
                      >
                        <UserCheck className="w-2 h-2" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(student)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400 hover:bg-red-900/20 btn-compact-icon"
                      >
                        <Trash2 className="w-2 h-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-ultra-compact">
          <div className="space-y-2">
            <div>
              <Label htmlFor="name" className="text-foreground text-xs">Full Name *</Label>
              <Input
                id="name"
                value={studentForm.name}
                onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                className="glass input-compact"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="class" className="text-foreground text-xs">Class *</Label>
                <Select value={studentForm.class} onValueChange={(value) => setStudentForm(prev => ({ ...prev, class: value }))}>
                  <SelectTrigger className="glass input-compact">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender" className="text-foreground text-xs">Gender *</Label>
                <Select value={studentForm.gender} onValueChange={(value) => setStudentForm(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="glass input-compact">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="text-foreground text-xs">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={studentForm.dateOfBirth}
                onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="glass input-compact"
                required
              />
            </div>
            <div>
              <Label htmlFor="guardianName" className="text-foreground text-xs">Guardian Name *</Label>
              <Input
                id="guardianName"
                value={studentForm.guardianName}
                onChange={(e) => setStudentForm(prev => ({ ...prev, guardianName: e.target.value }))}
                className="glass input-compact"
                required
              />
            </div>
            <div>
              <Label htmlFor="guardianPhone" className="text-foreground text-xs">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={studentForm.guardianPhone}
                onChange={(e) => setStudentForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                className="glass input-compact"
                placeholder="+233 XX XXX XXXX"
              />
            </div>
            <div>
              <Label htmlFor="photo" className="text-foreground text-xs">Student Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="glass input-compact"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-foreground text-xs">Address</Label>
              <Textarea
                id="address"
                value={studentForm.address}
                onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                className="glass textarea-compact"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white flex-1 btn-compact"
            >
              {loading ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                  {editingStudent ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-2.5 h-2.5 mr-1" />
                  {editingStudent ? 'Update' : 'Add'}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="glass flex-1 btn-compact"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Profile with Tabs */}
      {selectedStudent && showProfileModal && (
        <StudentProfileTabs
          student={selectedStudent}
          onClose={() => setShowProfileModal(false)}
          currentUserRole={currentUser?.role}
        />
      )}

      {/* Attendance Modal */}
      <Modal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        title="Student Attendance"
        size="lg"
      >
        {selectedStudent && (
          <AttendanceManagement
            studentId={selectedStudent.id}
            studentName={selectedStudent.name}
            onClose={() => setShowAttendanceModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}