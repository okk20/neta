import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Modal } from "./ui/modal";
import { FullWindowTeacherProfile } from "./FullWindowTeacherProfile";
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
  Mail,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  GraduationCap
} from "lucide-react";
import { db, type Teacher, type Subject } from "../utils/database";

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL_STATUS');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    title: 'Mr.',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    specialization: '',
    subjects: [] as string[],
    classAssigned: '',
    isClassTeacher: false,
    employmentDate: new Date().toISOString().split('T')[0],
    photo: ''
  });

  const titles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
  const classes = ['B.S.7A', 'B.S.7B', 'B.S.7C', 'B.S.8A', 'B.S.8B', 'B.S.8C', 'B.S.9A', 'B.S.9B', 'B.S.9C'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersList, subjectsList] = await Promise.all([
        db.getAllTeachers(),
        db.getAllSubjects()
      ]);
      setTeachers(teachersList);
      setSubjects(subjectsList);
      setError('');
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setTeacherForm({
      name: '',
      title: 'Mr.',
      email: '',
      phone: '',
      address: '',
      qualification: '',
      specialization: '',
      subjects: [],
      classAssigned: '',
      isClassTeacher: false,
      employmentDate: new Date().toISOString().split('T')[0],
      photo: ''
    });
    setEditingTeacher(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      // Validation
      if (!teacherForm.name.trim()) {
        throw new Error('Teacher name is required');
      }
      if (!teacherForm.email.trim()) {
        throw new Error('Email is required');
      }
      if (!teacherForm.qualification.trim()) {
        throw new Error('Qualification is required');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(teacherForm.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if class teacher assignment conflicts
      if (teacherForm.isClassTeacher && teacherForm.classAssigned) {
        const existingClassTeacher = teachers.find(t => 
          t.isClassTeacher && 
          t.classAssigned === teacherForm.classAssigned && 
          (!editingTeacher || t.id !== editingTeacher.id)
        );
        if (existingClassTeacher) {
          throw new Error(`${teacherForm.classAssigned} already has a class teacher assigned`);
        }
      }

      const teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'> = {
        name: teacherForm.name.trim(),
        title: teacherForm.title,
        email: teacherForm.email.trim().toLowerCase(),
        phone: teacherForm.phone.trim(),
        address: teacherForm.address.trim(),
        qualification: teacherForm.qualification.trim(),
        specialization: teacherForm.specialization.trim(),
        subjects: teacherForm.subjects,
        classAssigned: teacherForm.isClassTeacher ? teacherForm.classAssigned : undefined,
        isClassTeacher: teacherForm.isClassTeacher,
        employmentDate: teacherForm.employmentDate,
        status: 'active',
        photo: teacherForm.photo.trim()
      };

      if (editingTeacher) {
        await db.updateTeacher(editingTeacher.id, teacherData);
        setSuccess('Teacher updated successfully!');
      } else {
        await db.addTeacher(teacherData as Teacher);
        setSuccess('Teacher added successfully!');
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save teacher:', error);
      setError(error.message || 'Failed to save teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setTeacherForm({
      name: teacher.name,
      title: teacher.title,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      subjects: teacher.subjects || [],
      classAssigned: teacher.classAssigned || '',
      isClassTeacher: teacher.isClassTeacher,
      employmentDate: teacher.employmentDate,
      photo: teacher.photo || ''
    });
    setEditingTeacher(teacher);
    setShowModal(true);
    clearMessages();
  };

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowProfileModal(true);
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await db.deleteTeacher(teacher.id);
      setSuccess('Teacher deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      setError('Failed to delete teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setTeacherForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL_STATUS' || teacher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTeacherForm(prev => ({ ...prev, photo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || subjectId;
  };

  return (
    <div className="space-y-3">
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <GraduationCap className="w-3 h-3" />
            Teacher Management
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

          {/* Ultra Compact Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-1.5 top-1.5 h-2.5 w-2.5 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass pl-6 input-compact"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="glass w-full sm:w-32 input-compact">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="ALL_STATUS">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
              { label: 'Total', value: teachers.length, icon: GraduationCap, color: 'text-primary' },
              { label: 'Active', value: teachers.filter(t => t.status === 'active').length, icon: CheckCircle, color: 'text-green-400' },
              { label: 'Class Teachers', value: teachers.filter(t => t.isClassTeacher).length, icon: Users, color: 'text-blue-400' },
              { label: 'Results', value: filteredTeachers.length, icon: Filter, color: 'text-foreground' }
            ].map((stat, index) => (
              <div key={index} className="glass-card card-compact text-center">
                <stat.icon className={`w-3 h-3 mx-auto mb-0.5 ${stat.color}`} />
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Ultra Compact Teachers List */}
          {loading && !showModal ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-6">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-1 text-sm">No Teachers Found</h3>
              <p className="text-muted-foreground text-xs mb-2">
                {searchTerm || filterStatus !== 'ALL_STATUS' ? 'No teachers match your criteria.' : 'Start by adding teachers.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-compact-sm">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="glass-card hover:shadow-lg transition-all duration-200">
                  <CardContent className="card-compact">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-secondary">
                        {teacher.photo ? (
                          <img 
                            src={teacher.photo} 
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20">
                            <GraduationCap className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate text-xs">
                          {teacher.title} {teacher.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">ID: e.g. TE001 to latest</p>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          <Badge 
                            variant={teacher.status === 'active' ? 'default' : 'secondary'}
                            className={`text-xs px-1 py-0 ${teacher.status === 'active' ? 'bg-green-600' : ''}`}
                          >
                            {teacher.status}
                          </Badge>
                          {teacher.isClassTeacher && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 bg-blue-600">
                              Class Teacher
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-2 h-2" />
                            <span className="truncate">{teacher.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BookOpen className="w-2 h-2" />
                            <span className="truncate">{teacher.qualification}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        onClick={() => handleView(teacher)}
                        size="sm"
                        variant="outline"
                        className="glass flex-1 btn-compact"
                      >
                        <Eye className="w-2 h-2 mr-0.5" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleEdit(teacher)}
                        size="sm"
                        variant="outline"
                        className="glass flex-1 btn-compact"
                      >
                        <Edit className="w-2 h-2 mr-0.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(teacher)}
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
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-ultra-compact">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="title" className="text-foreground text-xs">Title *</Label>
                <Select value={teacherForm.title} onValueChange={(value) => setTeacherForm(prev => ({ ...prev, title: value }))}>
                  <SelectTrigger className="glass input-compact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {titles.map(title => (
                      <SelectItem key={title} value={title}>{title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name" className="text-foreground text-xs">Full Name *</Label>
                <Input
                  id="name"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                  className="glass input-compact"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground text-xs">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                className="glass input-compact"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-foreground text-xs">Phone Number</Label>
              <Input
                id="phone"
                value={teacherForm.phone}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                className="glass input-compact"
                placeholder="+233 XX XXX XXXX"
              />
            </div>
            <div>
              <Label htmlFor="qualification" className="text-foreground text-xs">Qualification *</Label>
              <Input
                id="qualification"
                value={teacherForm.qualification}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, qualification: e.target.value }))}
                className="glass input-compact"
                placeholder="e.g., B.Ed Mathematics"
                required
              />
            </div>
            <div>
              <Label htmlFor="specialization" className="text-foreground text-xs">Specialization</Label>
              <Input
                id="specialization"
                value={teacherForm.specialization}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, specialization: e.target.value }))}
                className="glass input-compact"
                placeholder="e.g., Mathematics, Science"
              />
            </div>

            {/* Subject Assignment */}
            {subjects.length > 0 ? (
              <div>
                <Label className="text-foreground text-xs">Subjects to Teach</Label>
                <div className="grid grid-cols-2 gap-1 mt-1 max-h-20 overflow-y-auto">
                  {subjects.slice(0, 6).map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-1">
                      <Checkbox
                        id={`subject-${subject.id}`}
                        checked={teacherForm.subjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                        className="w-3 h-3"
                      />
                      <Label
                        htmlFor={`subject-${subject.id}`}
                        className="text-foreground text-xs cursor-pointer truncate"
                      >
                        {subject.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass p-3 rounded-md bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-800 text-xs">
                  No subjects available in the system. Please contact your administrator to create subjects.
                </p>
              </div>
            )}

            {/* Class Teacher Assignment */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isClassTeacher"
                  checked={teacherForm.isClassTeacher}
                  onCheckedChange={(checked) => 
                    setTeacherForm(prev => ({ 
                      ...prev, 
                      isClassTeacher: !!checked,
                      classAssigned: checked ? prev.classAssigned : ''
                    }))
                  }
                  className="w-3 h-3"
                />
                <Label htmlFor="isClassTeacher" className="text-foreground text-xs">
                  Assign as Class Teacher
                </Label>
              </div>
              
              {teacherForm.isClassTeacher && (
                <div>
                  <Select 
                    value={teacherForm.classAssigned} 
                    onValueChange={(value) => setTeacherForm(prev => ({ ...prev, classAssigned: value }))}
                  >
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
              )}
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
                  {editingTeacher ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-2.5 h-2.5 mr-1" />
                  {editingTeacher ? 'Update' : 'Add'}
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

      {/* Full Window Teacher Profile */}
      {selectedTeacher && showProfileModal && (
        <FullWindowTeacherProfile
          teacherId={selectedTeacher.id}
          onClose={() => setShowProfileModal(false)}
          onEdit={() => {
            setShowProfileModal(false);
            handleEdit(selectedTeacher);
          }}
        />
      )}
    </div>
  );
}