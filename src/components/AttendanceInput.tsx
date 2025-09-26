import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Search, Save, Users, Calendar, Check, X, Phone } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import database, { type StudentUI as Student, type UserUI as User } from "../utils/database";
import { toast } from "sonner";

interface AttendanceRecord {
  studentId: string;
  term: string;
  year: string;
  present: number;
  total: number;
  percentage: number;
}

interface AttendanceInputProps {
  currentUser?: User;
}

export function AttendanceInput({ currentUser }: AttendanceInputProps = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const studentsList = await database.getAllStudents();
        
        let filteredStudents = studentsList || [];
        if (isStudent && currentUser?.studentId) {
          filteredStudents = studentsList.filter(s => s.id === currentUser.studentId);
        } else if (isTeacher && currentUser?.classAssigned) {
          filteredStudents = studentsList.filter(s => s.class === currentUser.classAssigned);
        }
        
        setStudents(filteredStudents);
        await loadAttendanceData(filteredStudents);
      } catch (error) {
        console.error('Failed to load attendance data:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, selectedTerm, selectedYear]);

  const loadAttendanceData = async (studentList: Student[]) => {
    try {
      const attendanceRecords: Record<string, AttendanceRecord> = {};
      
      for (const student of studentList) {
        const saved = await database.getSetting(`attendance_${student.id}_${selectedTerm}_${selectedYear}`);
        if (saved) {
          attendanceRecords[student.id] = saved;
        } else {
          // Default attendance values
          attendanceRecords[student.id] = {
            studentId: student.id,
            term: selectedTerm,
            year: selectedYear,
            present: 0,
            total: 0,
            percentage: 0
          };
        }
      }
      
      setAttendanceData(attendanceRecords);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const updateAttendance = (studentId: string, field: 'present' | 'total', value: number) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) {
        updated[studentId] = {
          studentId,
          term: selectedTerm,
          year: selectedYear,
          present: 0,
          total: 0,
          percentage: 0
        };
      }
      
      updated[studentId][field] = Math.max(0, value);
      
      // Ensure present doesn't exceed total
      if (field === 'total' && updated[studentId].present > value) {
        updated[studentId].present = value;
      }
      if (field === 'present' && value > updated[studentId].total) {
        updated[studentId].total = value;
      }
      
      // Calculate percentage
      if (updated[studentId].total > 0) {
        updated[studentId].percentage = Math.round((updated[studentId].present / updated[studentId].total) * 100);
      } else {
        updated[studentId].percentage = 0;
      }
      
      return updated;
    });
  };

  const saveAllAttendance = async () => {
    try {
      setSaving(true);
      
      for (const [studentId, record] of Object.entries(attendanceData)) {
        await database.saveSetting(`attendance_${studentId}_${selectedTerm}_${selectedYear}`, record);
      }
      
      toast.success('Attendance data saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance data');
    } finally {
      setSaving(false);
    }
  };

  const saveStudentAttendance = async (studentId: string) => {
    try {
      const record = attendanceData[studentId];
      if (record) {
        await database.saveSetting(`attendance_${studentId}_${selectedTerm}_${selectedYear}`, record);
        toast.success('Attendance saved');
      }
    } catch (error) {
      console.error('Error saving student attendance:', error);
      toast.error('Failed to save attendance');
    }
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 75) return { label: 'Good', color: 'bg-blue-500' };
    if (percentage >= 60) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  const handleCallParent = (student: Student) => {
    if (!student.guardianPhone) {
      toast.error('No guardian phone number available');
      return;
    }
    
    const phoneNumber = student.guardianPhone.replace(/[^0-9+]/g, '');
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map(s => s.class))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white text-black">
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="flex items-center gap-2 text-black">
            <Calendar className="w-5 h-5" />
            Attendance Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          {!isStudent && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Search Student</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 input-compact"
                  />
                </div>
              </div>
              {!isTeacher && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="input-compact">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {uniqueClasses.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1">Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="input-compact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Academic Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="input-compact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Save All Button */}
          {!isStudent && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">{filteredStudents.length} Students</span>
              </div>
              <Button
                onClick={saveAllAttendance}
                disabled={saving}
                className="btn-success btn-compact"
              >
                <Save className="w-3 h-3 mr-1" />
                {saving ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          )}

          {/* Attendance Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Attendance Records - {selectedTerm} {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-center">Days Present</TableHead>
                      <TableHead className="text-center">Total Days</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      {!isStudent && <TableHead className="text-center">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(student => {
                      const attendance = attendanceData[student.id] || {
                        present: 0,
                        total: 0,
                        percentage: 0
                      };
                      const status = getAttendanceStatus(attendance.percentage);

                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.class}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {isStudent ? (
                              <span className="font-mono">{attendance.present}</span>
                            ) : (
                              <Input
                                type="number"
                                value={attendance.present}
                                onChange={(e) => updateAttendance(student.id, 'present', parseInt(e.target.value) || 0)}
                                className="input-compact w-16 text-center"
                                min="0"
                                max={attendance.total}
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isStudent ? (
                              <span className="font-mono">{attendance.total}</span>
                            ) : (
                              <Input
                                type="number"
                                value={attendance.total}
                                onChange={(e) => updateAttendance(student.id, 'total', parseInt(e.target.value) || 0)}
                                className="input-compact w-16 text-center"
                                min="0"
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-mono font-medium">
                              {attendance.percentage}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          {!isStudent && (
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  onClick={() => saveStudentAttendance(student.id)}
                                  className="btn-success btn-compact-icon"
                                  title="Save attendance"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                {student.guardianPhone && (
                                  <Button
                                    onClick={() => handleCallParent(student)}
                                    className="btn-whatsapp btn-compact-icon"
                                    title="Call guardian"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredStudents.filter(s => {
                      const att = attendanceData[s.id];
                      return att && att.percentage >= 90;
                    }).length}
                  </div>
                  <div className="text-xs text-gray-500">Excellent (≥90%)</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredStudents.filter(s => {
                      const att = attendanceData[s.id];
                      return att && att.percentage >= 75 && att.percentage < 90;
                    }).length}
                  </div>
                  <div className="text-xs text-gray-500">Good (75-89%)</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredStudents.filter(s => {
                      const att = attendanceData[s.id];
                      return att && att.percentage >= 60 && att.percentage < 75;
                    }).length}
                  </div>
                  <div className="text-xs text-gray-500">Fair (60-74%)</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredStudents.filter(s => {
                      const att = attendanceData[s.id];
                      return att && att.percentage < 60;
                    }).length}
                  </div>
                  <div className="text-xs text-gray-500">Poor ({`<60%`})</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}