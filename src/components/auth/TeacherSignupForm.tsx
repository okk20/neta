import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CheckCircle, AlertCircle, UserPlus, Eye, EyeOff } from "lucide-react";
import { db, type Teacher, type User } from "../../utils/database";

interface TeacherSignupFormProps {
  onLogin?: (user: User) => void;
}

export function TeacherSignupForm({ onLogin }: TeacherSignupFormProps = {}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: 'Mr.',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    specialization: '',
    password: '',
    confirmPassword: '',
    username: '',
    invitationCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Full name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.username.trim()) {
        throw new Error('Username is required');
      }
      if (!formData.invitationCode.trim()) {
        throw new Error('Invitation code is required');
      }
      if (!formData.password) {
        throw new Error('Password is required');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate invitation code
      const isValidCode = await db.validateTeacherInvitationCode(formData.invitationCode);
      if (!isValidCode) {
        throw new Error('Invalid or expired invitation code');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if username or email already exists
      const existingUsers = await db.getAllUsers();
      const existingUser = existingUsers.find(u => 
        u.username.toLowerCase() === formData.username.toLowerCase() || 
        u.email.toLowerCase() === formData.email.toLowerCase()
      );
      
      if (existingUser) {
        throw new Error('Username or email already exists');
      }

      // Create teacher record
      const teacherId = `TC-${Date.now()}`;
      const teacher: Teacher = {
        id: teacherId,
        teacherId: teacherId,
        name: formData.name,
        title: formData.title,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        qualification: formData.qualification,
        specialization: formData.specialization,
        subjects: [],
        isClassTeacher: false,
        employmentDate: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.addTeacher(teacher);

      // Create user account
      const user: User = {
        id: `USER_${teacherId}`,
        username: formData.username,
        password: formData.password,
        role: 'teacher',
        email: formData.email,
        phone: formData.phone,
        status: 'active',
        lastLogin: new Date().toISOString(),
        teacherId: teacherId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.addUser(user);

      console.log('✅ Teacher signup successful:', formData.username);
      setSuccess(true);

      // Reset form
      setFormData({
        name: '',
        title: 'Mr.',
        email: '',
        phone: '',
        address: '',
        qualification: '',
        specialization: '',
        password: '',
        confirmPassword: '',
        username: '',
        invitationCode: ''
      });

    } catch (error: any) {
      console.error('Teacher signup failed:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateUsername = () => {
    if (formData.name) {
      const cleanName = formData.name.toLowerCase().replace(/[^a-z]/g, '');
      const randomNum = Math.floor(Math.random() * 1000);
      setFormData(prev => ({ ...prev, username: `${cleanName}${randomNum}` }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="py-2 border-red-500 bg-red-900/20">
          <AlertCircle className="h-3 w-3 text-red-400" />
          <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="py-2 border-green-500 bg-green-900/20">
          <CheckCircle className="h-3 w-3 text-green-400" />
          <AlertDescription className="text-green-300 text-xs">
            Teacher account created successfully! You can now login with your credentials.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="invitationCode" className="text-foreground text-xs">Invitation Code</Label>
        <Input
          id="invitationCode"
          type="text"
          value={formData.invitationCode}
          onChange={(e) => setFormData(prev => ({ ...prev, invitationCode: e.target.value }))}
          className="glass input-compact"
          placeholder="Enter invitation code"
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Contact your administrator for an invitation code
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-foreground text-xs">Title</Label>
          <Select value={formData.title} onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}>
            <SelectTrigger className="glass input-compact">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass">
              <SelectItem value="Mr.">Mr.</SelectItem>
              <SelectItem value="Mrs.">Mrs.</SelectItem>
              <SelectItem value="Ms.">Ms.</SelectItem>
              <SelectItem value="Dr.">Dr.</SelectItem>
              <SelectItem value="Prof.">Prof.</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="name" className="text-foreground text-xs">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="glass input-compact"
            placeholder="Enter full name"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-foreground text-xs">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="glass input-compact"
            placeholder="teacher@example.com"
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-foreground text-xs">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="glass input-compact"
            placeholder="+233 24 000 0000"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="text-foreground text-xs">Address</Label>
        <Input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="glass input-compact"
          placeholder="Enter your address"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="qualification" className="text-foreground text-xs">Qualification</Label>
          <Input
            id="qualification"
            type="text"
            value={formData.qualification}
            onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
            className="glass input-compact"
            placeholder="e.g., B.Ed, M.Ed"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="specialization" className="text-foreground text-xs">Specialization</Label>
          <Input
            id="specialization"
            type="text"
            value={formData.specialization}
            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
            className="glass input-compact"
            placeholder="e.g., Mathematics, English"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="username" className="text-foreground text-xs">Username</Label>
        <div className="flex gap-2">
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="glass input-compact flex-1"
            placeholder="Choose a username"
            required
            disabled={loading}
          />
          <Button
            type="button"
            onClick={generateUsername}
            variant="outline"
            className="glass text-xs px-3"
            disabled={loading || !formData.name}
          >
            Generate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password" className="text-foreground text-xs">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="glass input-compact pr-8"
              placeholder="Enter password"
              required
              disabled={loading}
            />
            <Button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0 hover:bg-transparent"
              variant="ghost"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-2.5 w-2.5 text-muted-foreground" />
              ) : (
                <Eye className="h-2.5 w-2.5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-foreground text-xs">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="glass input-compact"
            placeholder="Confirm password"
            required
            disabled={loading}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || success}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-compact"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-3 h-3 mr-2" />
            Account Created!
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 mr-2" />
            Create Teacher Account
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Creating an account as a teacher in the SEMS system
        </p>
      </div>
    </form>
  );
}