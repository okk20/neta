import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { 
  Calendar as CalendarIcon,
  Check,
  X,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Save,
  Plus,
  Edit,
  Trash2,
  Download,
  FileText
} from "lucide-react";
import { db } from "../utils/database";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

interface AttendanceManagementProps {
  studentId?: string;
  studentName?: string;
  onClose?: () => void;
  isFullView?: boolean;
}

export function AttendanceManagement({ 
  studentId, 
  studentName, 
  onClose, 
  isFullView = false 
}: AttendanceManagementProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    excusedDays: 0,
    attendanceRate: 0
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newRecord, setNewRecord] = useState({
    status: 'present' as AttendanceRecord['status'],
    reason: ''
  });
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (studentId) {
      loadAttendanceData();
    }
  }, [studentId, filterMonth, filterYear]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get attendance records from localStorage (demo implementation)
      const storedData = localStorage.getItem(`attendance_${studentId}`);
      const records: AttendanceRecord[] = storedData ? JSON.parse(storedData) : [];
      
      // Filter records by selected month/year
      const filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === filterMonth && recordDate.getFullYear() === filterYear;
      });
      
      setAttendanceRecords(filteredRecords);
      calculateStats(filteredRecords);
      setError('');
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: AttendanceRecord[]) => {
    const schoolDays = getSchoolDaysInMonth(filterYear, filterMonth);
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const excusedDays = records.filter(r => r.status === 'excused').length;
    
    const attendanceRate = schoolDays > 0 ? Math.round(((presentDays + lateDays) / schoolDays) * 100) : 0;
    
    setStats({
      totalDays: schoolDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendanceRate
    });
  };

  const getSchoolDaysInMonth = (year: number, month: number): number => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let schoolDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      // Count weekdays only (Monday to Friday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        schoolDays++;
      }
    }
    
    return schoolDays;
  };

  const saveAttendanceRecord = async (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setSaving(true);
      
      const newRecord: AttendanceRecord = {
        ...record,
        id: `ATT_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Get existing records
      const storedData = localStorage.getItem(`attendance_${studentId}`);
      const existingRecords: AttendanceRecord[] = storedData ? JSON.parse(storedData) : [];
      
      // Check if record already exists for this date
      const existingIndex = existingRecords.findIndex(r => r.date === record.date);
      
      if (existingIndex >= 0) {
        // Update existing record
        existingRecords[existingIndex] = { ...existingRecords[existingIndex], ...record, updatedAt: new Date().toISOString() };
      } else {
        // Add new record
        existingRecords.push(newRecord);
      }
      
      // Save to localStorage
      localStorage.setItem(`attendance_${studentId}`, JSON.stringify(existingRecords));
      
      await loadAttendanceData();
      setSuccess('Attendance record saved successfully!');
      
    } catch (error) {
      console.error('Failed to save attendance:', error);
      setError('Failed to save attendance record.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRecord = async () => {
    if (!selectedDate || !studentId) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    
    await saveAttendanceRecord({
      studentId,
      date: dateString,
      status: newRecord.status,
      reason: newRecord.reason.trim(),
      markedBy: 'admin' // In real app, get from current user
    });
    
    setNewRecord({ status: 'present', reason: '' });
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleEditRecord = async (record: AttendanceRecord) => {
    setEditingRecord(record);
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;
    
    await saveAttendanceRecord({
      studentId: editingRecord.studentId,
      date: editingRecord.date,
      status: editingRecord.status,
      reason: editingRecord.reason || '',
      markedBy: 'admin'
    });
    
    setEditingRecord(null);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    
    try {
      const storedData = localStorage.getItem(`attendance_${studentId}`);
      const existingRecords: AttendanceRecord[] = storedData ? JSON.parse(storedData) : [];
      
      const updatedRecords = existingRecords.filter(r => r.id !== recordId);
      localStorage.setItem(`attendance_${studentId}`, JSON.stringify(updatedRecords));
      
      await loadAttendanceData();
      setSuccess('Attendance record deleted successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Failed to delete record:', error);
      setError('Failed to delete attendance record.');
    }
  };

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return <Check className="w-3 h-3 text-success" />;
      case 'absent': return <X className="w-3 h-3 text-destructive" />;
      case 'late': return <Clock className="w-3 h-3 text-warning" />;
      case 'excused': return <Users className="w-3 h-3 text-primary" />;
      default: return null;
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return 'badge-success';
      case 'absent': return 'bg-destructive text-destructive-foreground';
      case 'late': return 'bg-warning text-warning-foreground';
      case 'excused': return 'bg-primary text-primary-foreground';
      default: return 'badge-secondary';
    }
  };

  const exportAttendanceReport = () => {
    const reportData = {
      student: studentName,
      studentId,
      month: new Date(filterYear, filterMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      stats,
      records: attendanceRecords.map(r => ({
        date: new Date(r.date).toLocaleDateString('en-GB'),
        status: r.status,
        reason: r.reason || 'N/A'
      }))
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentName}_attendance_${filterYear}_${filterMonth + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Calendar className="w-8 h-8 animate-pulse mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground text-sm">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {studentName && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Attendance Management</h3>
            <p className="text-sm text-muted-foreground">{studentName}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportAttendanceReport}
              variant="outline"
              className="glass btn-compact"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" className="glass btn-compact">
                Close
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <Alert className="py-2 border-destructive bg-destructive/20">
          <AlertCircle className="h-3 w-3 text-destructive" />
          <AlertDescription className="text-destructive text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="py-2 border-success bg-success/20">
          <CheckCircle className="h-3 w-3 text-success" />
          <AlertDescription className="text-success text-xs">{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="glass-card">
          <CardContent className="card-compact text-center">
            <Check className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-sm font-bold text-foreground">{stats.presentDays}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="card-compact text-center">
            <X className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <p className="text-sm font-bold text-foreground">{stats.absentDays}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="card-compact text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-warning" />
            <p className="text-sm font-bold text-foreground">{stats.lateDays}</p>
            <p className="text-xs text-muted-foreground">Late</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="card-compact text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold text-foreground">{stats.excusedDays}</p>
            <p className="text-xs text-muted-foreground">Excused</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="card-compact text-center">
            <CalendarIcon className="w-5 h-5 mx-auto mb-1 text-foreground" />
            <p className="text-sm font-bold text-foreground">{stats.attendanceRate}%</p>
            <p className="text-xs text-muted-foreground">Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground text-sm">Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="card-compact space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-foreground">Filter Month/Year</Label>
              <div className="flex gap-2">
                <Select value={filterMonth.toString()} onValueChange={(value) => setFilterMonth(parseInt(value))}>
                  <SelectTrigger className="glass input-compact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {new Date(2024, i).toLocaleDateString('en-GB', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear.toString()} onValueChange={(value) => setFilterYear(parseInt(value))}>
                  <SelectTrigger className="glass input-compact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-foreground">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="glass input-compact justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {selectedDate ? selectedDate.toLocaleDateString('en-GB') : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="glass w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-foreground">Status</Label>
              <Select value={newRecord.status} onValueChange={(value) => setNewRecord(prev => ({ ...prev, status: value as AttendanceRecord['status'] }))}>
                <SelectTrigger className="glass input-compact">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-foreground">Reason (Optional)</Label>
              <Input
                value={newRecord.reason}
                onChange={(e) => setNewRecord(prev => ({ ...prev, reason: e.target.value }))}
                className="glass input-compact"
                placeholder="Reason for absence/lateness"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddRecord}
                disabled={saving || !selectedDate}
                className="btn-success flex-1 btn-compact"
              >
                {saving ? (
                  <>
                    <Save className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-1" />
                    Mark Attendance
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground text-sm">
            Attendance Records - {new Date(filterYear, filterMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="card-compact">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-6">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-1 text-sm">No Records Found</h3>
              <p className="text-muted-foreground text-xs">
                No attendance records for the selected month.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attendanceRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-border"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(record.date).toLocaleDateString('en-GB')}
                      </p>
                      {record.reason && (
                        <p className="text-xs text-muted-foreground">{record.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(record.status)}`}>
                      {record.status}
                    </Badge>
                    <Button
                      onClick={() => handleEditRecord(record)}
                      size="sm"
                      variant="outline"
                      className="glass btn-compact-icon"
                    >
                      <Edit className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteRecord(record.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive/20 btn-compact-icon"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Record Modal */}
      {editingRecord && (
        <Card className="glass-card border-primary">
          <CardHeader className="card-compact-header">
            <CardTitle className="text-foreground text-sm">Edit Attendance Record</CardTitle>
          </CardHeader>
          <CardContent className="card-compact space-y-3">
            <p className="text-sm text-foreground">
              Date: {new Date(editingRecord.date).toLocaleDateString('en-GB')}
            </p>
            
            <div>
              <Label className="text-xs text-foreground">Status</Label>
              <Select 
                value={editingRecord.status} 
                onValueChange={(value) => setEditingRecord(prev => prev ? { ...prev, status: value as AttendanceRecord['status'] } : null)}
              >
                <SelectTrigger className="glass input-compact">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-foreground">Reason</Label>
              <Input
                value={editingRecord.reason || ''}
                onChange={(e) => setEditingRecord(prev => prev ? { ...prev, reason: e.target.value } : null)}
                className="glass input-compact"
                placeholder="Reason for absence/lateness"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdateRecord}
                disabled={saving}
                className="btn-success flex-1 btn-compact"
              >
                {saving ? (
                  <>
                    <Save className="w-3 h-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Update
                  </>
                )}
              </Button>
              <Button
                onClick={() => setEditingRecord(null)}
                variant="outline"
                className="glass flex-1 btn-compact"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}