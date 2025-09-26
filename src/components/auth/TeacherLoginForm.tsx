import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Loader2,
  AlertCircle,
  Phone,
  User,
  LogIn,
} from "lucide-react";
import { AuthService } from '../../utils/auth';

interface TeacherLoginFormProps {
  onLogin: (teacher: any) => void;
}

export function TeacherLoginForm({ onLogin }: TeacherLoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [credentials, setCredentials] = useState({
    teacherId: '',
    phoneNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!credentials.teacherId.trim()) {
        throw new Error('Teacher ID is required');
      }
      if (!credentials.phoneNumber.trim()) {
        throw new Error('Phone number is required');
      }

  const user = await AuthService.handleTeacherLogin(credentials.teacherId, credentials.phoneNumber);
  onLogin(user);
    } catch (err: any) {
      console.error('Teacher login failed:', err);
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="py-2 border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="teacherId" className="text-gray-700 text-sm font-medium">
            Teacher ID
          </Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="teacherId"
              type="text"
              value={credentials.teacherId}
              onChange={(e) => setCredentials(prev => ({ ...prev, teacherId: e.target.value }))}
              className="pl-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              placeholder="Enter your teacher ID"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phoneNumber" className="text-gray-700 text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="phoneNumber"
              type="tel"
              value={credentials.phoneNumber}
              onChange={(e) => setCredentials(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="pl-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              placeholder="Enter your phone number"
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>

      <div className="text-center mt-3">
        <p className="text-xs text-gray-500">For teacher access only</p>
      </div>
    </form>
  );
}