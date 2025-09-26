import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Calendar,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react";

interface SimpleAttendanceProps {
  studentId: string;
  studentName?: string;
  initialAttendance?: string;
  onSave?: (attendance: string) => void;
  readOnly?: boolean;
}

export function SimpleAttendance({ 
  studentId, 
  studentName, 
  initialAttendance = '',
  onSave,
  readOnly = false
}: SimpleAttendanceProps) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load attendance from localStorage
    const savedAttendance = localStorage.getItem(`attendance_simple_${studentId}`);
    if (savedAttendance) {
      setAttendance(savedAttendance);
    } else if (initialAttendance) {
      setAttendance(initialAttendance);
    }
  }, [studentId, initialAttendance]);

  const validateAttendance = (value: string): boolean => {
    // Format: "34/54" or "0/0"
    const pattern = /^\d+\/\d+$/;
    if (!pattern.test(value)) {
      setError('Please use format: present/total (e.g., 34/54)');
      return false;
    }

    const [present, total] = value.split('/').map(Number);
    if (present > total) {
      setError('Present days cannot exceed total days');
      return false;
    }

    if (total > 200) {
      setError('Total days seems too high (max: 200)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateAttendance(attendance)) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Save to localStorage
      localStorage.setItem(`attendance_simple_${studentId}`, attendance);

      // Call parent callback if provided
      if (onSave) {
        onSave(attendance);
      }

      setSuccess('Attendance saved successfully!');
      setEditing(false);

      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Failed to save attendance:', error);
      setError('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateAttendanceRate = (): number => {
    if (!attendance || !attendance.includes('/')) return 0;
    
    const [present, total] = attendance.split('/').map(Number);
    if (total === 0) return 0;
    
    return Math.round((present / total) * 100);
  };

  const getAttendanceStatus = (): { color: string; text: string } => {
    const rate = calculateAttendanceRate();
    
    if (rate >= 90) return { color: 'text-success', text: 'Excellent' };
    if (rate >= 80) return { color: 'text-blue-400', text: 'Good' };
    if (rate >= 70) return { color: 'text-warning', text: 'Average' };
    return { color: 'text-destructive', text: 'Poor' };
  };

  const status = getAttendanceStatus();

  return (
    <Card className="glass-card">
      <CardHeader className="card-compact-header">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          Attendance Record
          {studentName && <span className="text-muted-foreground">- {studentName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="card-compact space-y-3">
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

        <div className="space-y-3">
          {/* Attendance Input/Display */}
          <div>
            <Label htmlFor="attendance" className="text-xs text-foreground mb-1 block">
              Attendance (Present/Total Days)
            </Label>
            {editing || !attendance ? (
              <div className="flex gap-2">
                <Input
                  id="attendance"
                  value={attendance}
                  onChange={(e) => {
                    setAttendance(e.target.value);
                    setError(''); // Clear error on change
                  }}
                  placeholder="e.g., 34/54"
                  className="glass input-compact flex-1"
                  disabled={saving || readOnly}
                />
                {!readOnly && (
                  <Button
                    onClick={handleSave}
                    disabled={saving || !attendance}
                    className="btn-success btn-compact"
                  >
                    {saving ? (
                      <Save className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                  </Button>
                )}
                {editing && (
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setError('');
                    }}
                    variant="outline"
                    className="glass btn-compact"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-border">
                <div className="flex items-center gap-2">
                  <span className="attendance-display">{attendance}</span>
                  <div className="text-xs">
                    <span className={`font-semibold ${status.color}`}>
                      {calculateAttendanceRate()}% ({status.text})
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <Button
                    onClick={() => setEditing(true)}
                    size="sm"
                    variant="outline"
                    className="glass btn-compact-icon"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Attendance Statistics */}
          {attendance && attendance.includes('/') && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-success/10 rounded border border-success/20">
                <Users className="w-4 h-4 mx-auto mb-1 text-success" />
                <p className="text-xs font-bold text-foreground">{attendance.split('/')[0]}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              
              <div className="text-center p-2 bg-primary/10 rounded border border-primary/20">
                <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs font-bold text-foreground">{attendance.split('/')[1]}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              
              <div className="text-center p-2 bg-secondary/10 rounded border border-border">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-foreground" />
                <p className="text-xs font-bold text-foreground">{calculateAttendanceRate()}%</p>
                <p className="text-xs text-muted-foreground">Rate</p>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
            <p className="text-xs text-blue-300">
              <strong>Format:</strong> Enter attendance as "present/total" (e.g., 34/54 means 34 days present out of 54 total school days).
              This will appear in the student's report card.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get attendance for report cards
export const getStudentAttendance = (studentId: string): string => {
  return localStorage.getItem(`attendance_simple_${studentId}`) || '0/0';
};

// Helper function to set attendance programmatically
export const setStudentAttendance = (studentId: string, attendance: string): void => {
  localStorage.setItem(`attendance_simple_${studentId}`, attendance);
};

// Helper function to calculate attendance rate
export const calculateAttendanceRate = (attendance: string): number => {
  if (!attendance || !attendance.includes('/')) return 0;
  
  const [present, total] = attendance.split('/').map(Number);
  if (total === 0) return 0;
  
  return Math.round((present / total) * 100);
};