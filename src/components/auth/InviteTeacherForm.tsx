import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CheckCircle, AlertCircle, Send, Mail, Copy, ExternalLink } from "lucide-react";
import { db, type Teacher, type User } from "../../utils/database";
import { emailService, EmailService } from "../../utils/emailService";

export function InviteTeacherForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Teacher name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }

      // Email validation
      if (!EmailService.validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if email already exists
      const existingUsers = await db.getAllUsers();
      const existingUser = existingUsers.find(u => 
        u.email.toLowerCase() === formData.email.toLowerCase()
      );
      
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      // Generate secure invite code
      const generatedInviteCode = EmailService.generateInviteCode();
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create teacher record (pending)
      const teacherId = `T_PENDING_${Date.now()}`;
      const teacher: Teacher = {
        id: teacherId,
        name: formData.name,
        title: 'Mr.', // Default, can be updated during signup
        email: formData.email,
        phone: '',
        address: '',
        qualification: '',
        specialization: '',
        subjects: [],
        isClassTeacher: false,
        employmentDate: new Date().toISOString(),
        status: 'inactive', // Will be activated when they complete signup
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.addTeacher(teacher);

      // Create pending user invitation
      const user: User = {
        id: `INVITE_${teacherId}`,
        username: formData.email, // Will be updated during signup
        password: '', // Will be set during signup
        role: 'teacher',
        email: formData.email,
        phone: '',
        status: 'pending',
        lastLogin: '',
        teacherId: teacherId,
        inviteToken: generatedInviteCode,
        inviteExpiry: expiryDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.addUser(user);

      // Send invitation email
      const emailSent = await emailService.sendTeacherInvitation(
        formData.email,
        formData.name,
        generatedInviteCode
      );

      if (emailSent) {
        console.log('✅ Teacher invitation sent:', formData.email);
        setSuccess(true);
        setInviteCode(generatedInviteCode);
        setInvitedEmail(formData.email);

        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send invitation email');
      }

    } catch (error: any) {
      console.error('Teacher invitation failed:', error);
      setError(error.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      alert('Invite code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy invite code:', error);
    }
  };

  const resendInvitation = async () => {
    if (!invitedEmail || !inviteCode) return;
    
    setLoading(true);
    try {
      const emailSent = await emailService.sendTeacherInvitation(
        invitedEmail,
        formData.name || 'Teacher',
        inviteCode
      );
      
      if (emailSent) {
        alert('Invitation email resent successfully!');
      } else {
        alert('Failed to resend invitation email.');
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      alert('Failed to resend invitation email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
            Invitation sent successfully! The teacher will receive an email with signup instructions.
          </AlertDescription>
        </Alert>
      )}

      {success && inviteCode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            📧 Invitation Details
          </h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>Email:</strong> {invitedEmail}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>Invite Code:</strong> 
                <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded ml-2 font-mono">
                  {inviteCode}
                </code>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>Expires:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={copyInviteCode}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Code
              </Button>
              <Button
                type="button"
                onClick={resendInvitation}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={loading}
              >
                <Mail className="w-3 h-3 mr-1" />
                Resend Email
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="teacherName" className="text-foreground text-xs">
            Teacher's Full Name
          </Label>
          <Input
            id="teacherName"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="glass input-compact"
            placeholder="Enter teacher's full name"
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="teacherEmail" className="text-foreground text-xs">
            Teacher's Email Address
          </Label>
          <Input
            id="teacherEmail"
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
          <Label htmlFor="customMessage" className="text-foreground text-xs">
            Custom Message (Optional)
          </Label>
          <textarea
            id="customMessage"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            className="glass input-compact w-full h-16 resize-none"
            placeholder="Add a personal message to the invitation email..."
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-compact"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Sending Invitation...
            </>
          ) : (
            <>
              <Send className="w-3 h-3 mr-2" />
              Send Teacher Invitation
            </>
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          The teacher will receive an email with signup instructions and a secure invite code.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>📧 Email Notice:</strong> The invitation will open your default email client.
            In a production environment, emails would be sent automatically via email service.
          </p>
        </div>
      </div>
    </div>
  );
}