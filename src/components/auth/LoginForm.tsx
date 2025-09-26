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
  UserCheck,
  Shield
} from "lucide-react";
import { db, type User } from "../../utils/database";
import apiService from '../../utils/apiService';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!credentials.username.trim()) {
        throw new Error('Username is required');
      }
      if (!credentials.password.trim()) {
        throw new Error('Password is required');
      }

      // Authenticate via server to ensure bcrypt password comparison
      const response = await apiService.login(credentials.username, credentials.password, 'admin');

      if (!response || response.success !== true || !response.data) {
        throw new Error(response?.message || 'Invalid credentials');
      }

      // Persist token for subsequent requests
      try { if (response.token) apiService.setToken(response.token); } catch (_) { /* ignore token set errors */ }

      const data = response.data as any;
      const user: User = {
        id: data.id || data._id,
        username: data.username || credentials.username,
        password: '',
        role: data.role || 'admin',
        email: data.email || '',
        phone: data.phone || '',
        status: data.status || 'active',
        lastLogin: data.lastLogin || new Date().toISOString(),
        studentId: data.studentId || undefined,
        teacherId: data.teacherId || undefined,
      };

      console.log('✅ Admin login successful (server):', user.username);
      // Update local cache/lastLogin via db if needed
      try { if (user.id) await db.updateUser(user.id, { lastLogin: new Date().toISOString() }); } catch (e) { /* ignore cache update errors */ }
      onLogin(user);
      
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
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
          <Label htmlFor="username" className="text-gray-700 text-sm font-medium">
            Username
          </Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserCheck className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="pl-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
            Password
          </Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="pl-10 pr-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <Button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              variant="ghost"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
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
        <p className="text-xs text-gray-500">
          For admin access only
        </p>
      </div>
    </form>
  );
}