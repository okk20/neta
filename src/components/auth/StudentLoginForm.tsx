import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  LogIn,
  GraduationCap,
  CalendarDays
} from "lucide-react";
import { db, type User, type StudentUI as Student } from "../../utils/database";

interface StudentLoginFormProps {
  onLogin: (user: User) => void;
}

export function StudentLoginForm({ onLogin }: StudentLoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [credentials, setCredentials] = useState({
    studentId: '',
    dateOfBirth: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!credentials.studentId.trim()) {
        throw new Error('Student ID is required');
      }
      if (!credentials.dateOfBirth.trim()) {
        throw new Error('Date of birth is required');
      }

      // Find student by ID
      const students = await db.getAllStudents();
      const student = students.find(s => 
        s.id.toUpperCase() === credentials.studentId.toUpperCase() &&
        s.status === 'active'
      );

      if (!student) {
        throw new Error('Student ID not found or account is inactive');
      }

      // Validate date of birth
      const inputDate = new Date(credentials.dateOfBirth);
      const studentDob = new Date(student.dateOfBirth);
      
      // Compare dates (ignore time)
      const inputDateString = inputDate.toISOString().split('T')[0];
      const studentDobString = studentDob.toISOString().split('T')[0];
      
      if (inputDateString !== studentDobString) {
        throw new Error('Date of birth does not match our records');
      }

      // Check if user account exists for this student
      const users = await db.getAllUsers();
      let user = users.find(u => 
        u.studentId === student.id && 
        u.role === 'student'
      );

      // Create user account if it doesn't exist
      if (!user) {
        // Build payload without sending client-side _id to server
        const passwordCandidate = String(credentials.dateOfBirth || '');
        const safePassword = passwordCandidate.length >= 6 ? passwordCandidate : `${passwordCandidate}00`;

        const newUser = {
          username: String(student.id).toLowerCase(),
          password: safePassword, // Using DOB as initial password (ensure minlength)
          role: 'student',
          email: `${String(student.id).toLowerCase()}@student.oce.edu.gh`,
          phone: student.guardianPhone || '',
          status: 'active',
          lastLogin: new Date().toISOString(),
          studentId: student.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const created = await db.addUser(newUser);
        // If backend returned the created user, use it so we have the server _id
        if (created) {
          user = created as unknown as User;
        } else {
          user = {
            username: newUser.username,
            password: newUser.password,
            role: newUser.role,
            email: newUser.email,
            phone: newUser.phone,
            status: newUser.status,
            lastLogin: newUser.lastLogin,
            studentId: newUser.studentId,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
          } as unknown as User;
        }
        console.log('✅ Student user account created:', student.id);
      } else {
        // Update last login only if we have an id from the server
        const userId = (user as any)._id || (user as any).id;
        if (userId) {
          await db.updateUser(userId, {
            ...user,
            lastLogin: new Date().toISOString()
          });
        } else {
          // Best-effort: skip server update when id is unavailable
          console.warn('Skipping updateUser: no user id available for', user);
        }
      }

      console.log('✅ Student login successful:', student.id);
      // Ensure we pass a valid user object to the app
      if (!user) {
        // As a fallback, construct a minimal user object
        user = {
          username: String(student.id).toLowerCase(),
          role: 'student',
          studentId: student.id,
          email: `${String(student.id).toLowerCase()}@student.oce.edu.gh`,
          phone: student.guardianPhone || '',
          status: 'active',
          lastLogin: new Date().toISOString()
        } as unknown as User;
      }

      onLogin(user);

  // Clear input fields after successful login
  setCredentials({ studentId: '', dateOfBirth: '' });
      
    } catch (error: any) {
      console.error('Student login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Accept raw student ID input (no auto-format)
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({ ...prev, studentId: e.target.value }));
  };

  // Get current date for date input max value
  const getCurrentDate = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
  // For JHS students, allow ages roughly 8-25 to accommodate younger students
  const minDate = new Date(currentYear - 25, 0, 1); // Oldest possible (adult returning students)
  const maxDate = new Date(currentYear - 8, currentMonth, currentDay); // Youngest (approx 8 years ago from today)
    
    return {
      min: '',
      max: ''
    };
  };

  const dateRange = getCurrentDate();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="py-2 border-red-500 bg-red-900/20">
          <AlertCircle className="h-3 w-3 text-red-400" />
          <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div>
          <Label htmlFor="studentId" className="text-foreground text-xs">
            Student ID
          </Label>
          <div className="relative">
            <Input
              id="studentId"
              type="text"
              value={credentials.studentId}
              onChange={handleStudentIdChange}
              className="glass input-compact pl-8"
              placeholder="Enter Student ID (e.g., SU001)"
              required
              disabled={loading}
            />
            <GraduationCap className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your student ID (e.g., SU001, SU025)
          </p>
        </div>

        <div>
          <Label htmlFor="dateOfBirth" className="text-foreground text-xs">
            Date of Birth
          </Label>
          <div className="relative">
            <Input
              id="dateOfBirth"
              type="date"
              value={credentials.dateOfBirth}
              onChange={(e) => setCredentials(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="glass input-compact pl-8"
              required
              disabled={loading}
            />
            <CalendarDays className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your date of birth as registered in school records
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-compact"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="w-3 h-3 mr-2" />
            Sign In as Student
          </>
        )}
      </Button>

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          For students to access their academic reports and records
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
            📚 Student Login Information:
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            • Use your <strong>Student ID</strong> (found on your school ID card)
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            • Enter your <strong>Date of Birth</strong> as registered with the school
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            • Contact school administration if you need assistance
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300">
            <strong>✅ What you can access:</strong> View reports, check grades, download certificates
          </p>
        </div>
      </div>
    </form>
  );
}