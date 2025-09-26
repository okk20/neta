import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Settings, 
  School, 
  Upload, 
  Download, 
  RotateCcw, 
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Database,
  Users,
  FileText,
  Palette,
  Monitor,
  Sun,
  Moon,
  Circle,
  Key,
  User,
  Send,
  Copy
} from "lucide-react";
import { db, type SchoolSettings, type User as UserType } from "../utils/database";

interface SettingsManagementProps {
  onUsernameChange: () => void;
  currentUser: UserType;
}

const THEMES = [
  { 
    id: 'white', 
    name: 'Light Theme', 
    description: 'Clean white background with dark text',
    icon: Sun,
    colors: {
      bg: '#ffffff',
      text: '#000000',
      card: '#f8f9fa'
    }
  },
  { 
    id: 'dark', 
    name: 'Dark Theme', 
    description: 'Dark blue background with light text',
    icon: Moon,
    colors: {
      bg: '#0f172a',
      text: '#f8fafc',
      card: '#1e293b'
    }
  },
  { 
    id: 'black', 
    name: 'Black Theme', 
    description: 'Pure black background with white text',
    icon: Circle,
    colors: {
      bg: '#000000',
      text: '#ffffff',
      card: '#0a0a0a'
    }
  },
  { 
    id: 'grey', 
    name: 'Grey Theme', 
    description: 'Professional grey background',
    icon: Monitor,
    colors: {
      bg: '#374151',
      text: '#f9fafb',
      card: '#4b5563'
    }
  }
];

export function SettingsManagement({ onUsernameChange, currentUser }: SettingsManagementProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTheme, setCurrentTheme] = useState('black');
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    schoolName: 'School Examination Management System (SEMS)',
    address: 'Offinso, Ashanti Region, Ghana',
    phone: '+233 24 000 0000',
    email: 'info@oce.edu.gh',
    website: 'www.oce.edu.gh',
    logo: '',
    principalName: 'Dr. Samuel Adjei',
    principalSignature: '',
    headmasterName: '',
    currentTerm: 'Term 1',
    currentYear: '2024',
    motto: 'Knowledge is Power',
    establishedYear: '1995',
    updatedAt: new Date().toISOString()
  });

  const [academicSettings, setAcademicSettings] = useState({
    term1Start: '2024-01-15',
    term1End: '2024-04-12',
    term2Start: '2024-05-06',
    term2End: '2024-08-09',
    term3Start: '2024-09-02',
    term3End: '2024-12-13',
    classScoreWeight: 50,
    examScoreWeight: 50,
    passingGrade: 50,
    promotionRequirement: 60
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '3years',
    enableNotifications: true,
    enableReporting: true,
    enableMessaging: true,
    theme: 'black'
  });
  
  // Admin credential change state
  const [adminCredentials, setAdminCredentials] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Teacher invitation state
  const [teacherInvitation, setTeacherInvitation] = useState({
    name: '',
    email: '',
    inviteCode: '',
    generatedAt: '' as string | null
  });

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalScores: 0,
    lastBackup: '',
    databaseSize: '0 KB'
  });

  useEffect(() => {
    loadSettings();
    loadStats();
    loadCurrentTheme();
  }, []);

  const loadCurrentTheme = () => {
  // Prefer persisted server setting, fallback to localStorage
  const savedTheme = localStorage.getItem('theme') || 'black';
  setCurrentTheme(savedTheme);
  setSystemSettings(prev => ({ ...prev, theme: savedTheme }));
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await db.getSetting('schoolSettings');
      
      if (settings) {
        setSchoolSettings(settings);
      }
      
      const academicData = await db.getSetting('academicSettings');
      if (academicData) {
        setAcademicSettings(academicData);
      }

      const systemData = await db.getSetting('systemSettings');
      if (systemData) {
        setSystemSettings(prev => ({ ...prev, ...systemData }));
      }
      
      setError('');
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load settings. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [students, teachers, subjects, scores] = await Promise.all([
        db.getAllStudents(),
        db.getAllTeachers(), 
        db.getAllSubjects(),
        db.getAllScores()
      ]);

      const healthCheck = await db.healthCheck();
      
      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalSubjects: subjects.length,
        totalScores: scores.length,
        lastBackup: healthCheck.details.lastBackup || 'Never',
        databaseSize: healthCheck.details.storageUsed || '0 KB'
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleThemeChange = async (themeId: string) => {
    try {
      setCurrentTheme(themeId);
      setSystemSettings(prev => ({ ...prev, theme: themeId }));
      
      // Apply theme immediately to DOM
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('theme', themeId);
      
      // Save to database
      await db.updateSetting('systemSettings', { ...systemSettings, theme: themeId });
      
      setSuccess('Theme applied and saved successfully!');
      
      // Force a small delay to show the visual change
      setTimeout(() => {
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save theme:', error);
      setError('Theme applied but failed to save preference.');
    }
  };

  const handleSchoolSettingsSave = async () => {
    setSaving(true);
    clearMessages();

    try {
      await db.updateSetting('schoolSettings', schoolSettings);
      await db.updateSetting('academicSettings', academicSettings);
      await db.updateSetting('systemSettings', systemSettings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle admin credential change
  const handleAdminCredentialChange = async () => {
    setSaving(true);
    clearMessages();
    
    try {
      // Validation
      if (!adminCredentials.currentPassword.trim()) {
        throw new Error('Current password is required');
      }
      if (!adminCredentials.newPassword.trim()) {
        throw new Error('New password is required');
      }
      if (adminCredentials.newPassword !== adminCredentials.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      if (adminCredentials.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
  // Call secure change password API
  await db.changePassword(currentUser.id, adminCredentials.currentPassword, adminCredentials.newPassword);
      
      // Clear form
      setAdminCredentials({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Admin credentials updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to update admin credentials:', error);
      setError(error.message || 'Failed to update admin credentials. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Generate teacher invitation code
  const generateTeacherInvitationCode = () => {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setTeacherInvitation({
      name: teacherInvitation.name,
      email: teacherInvitation.email,
      inviteCode: code,
      generatedAt: new Date().toISOString()
    });
    
    setSuccess('Invitation code generated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // Copy invitation code to clipboard
  const copyInvitationCode = async () => {
    try {
      await navigator.clipboard.writeText(teacherInvitation.inviteCode);
      setSuccess('Invitation code copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      setError('Failed to copy code to clipboard');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSchoolSettings(prev => ({ 
          ...prev, 
          logo: event.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (type: 'principal' | 'headmaster') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const field = type === 'principal' ? 'principalSignature' : 'headmasterSignature';
        setSchoolSettings(prev => ({ 
          ...prev, 
          [field]: event.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportData = async () => {
    try {
      setSaving(true);
      const data = await db.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sems-data-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setSaving(true);
          const jsonData = event.target?.result as string;
          await db.importData(jsonData);
          setSuccess('Data imported successfully! Refreshing...');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error('Failed to import data:', error);
          setError('Failed to import data. Please check the file format.');
        } finally {
          setSaving(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await db.resetData();
      setSuccess('Data reset successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to reset data:', error);
      setError('Failed to reset data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" />
            Settings Management
          </CardTitle>
        </CardHeader>
        <CardContent className="card-compact">
          {/* Messages */}
          {error && (
            <Alert className="mb-4 py-2 border-red-500 bg-red-900/20">
              <AlertCircle className="h-3 w-3 text-red-400" />
              <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 py-2 border-success bg-success/20">
              <CheckCircle className="h-3 w-3 text-success" />
              <AlertDescription className="text-success text-xs">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="glass mb-4">
              <TabsTrigger value="appearance" className="text-foreground text-xs">
                <Palette className="w-3 h-3 mr-1" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="school" className="text-foreground text-xs">
                <School className="w-3 h-3 mr-1" />
                School Info
              </TabsTrigger>
              <TabsTrigger value="academic" className="text-foreground text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Academic
              </TabsTrigger>
              <TabsTrigger value="system" className="text-foreground text-xs">
                <Database className="w-3 h-3 mr-1" />
                System
              </TabsTrigger>
              <TabsTrigger value="data" className="text-foreground text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Data
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-foreground text-xs">
                <Key className="w-3 h-3 mr-1" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card className="glass-card">
                <CardHeader className="card-compact-header">
                  <CardTitle className="text-foreground text-sm">Theme Selection</CardTitle>
                </CardHeader>
                <CardContent className="card-compact space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {THEMES.map((theme) => {
                      const IconComponent = theme.icon;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                            currentTheme === theme.id 
                              ? 'border-primary bg-primary/10 shadow-lg scale-105' 
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                              style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground text-sm">{theme.name}</h3>
                              <p className="text-xs text-muted-foreground">{theme.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded border shadow-sm"
                              style={{ backgroundColor: theme.colors.bg }}
                              title="Background"
                            />
                            <div 
                              className="w-4 h-4 rounded border shadow-sm"
                              style={{ backgroundColor: theme.colors.text }}
                              title="Text"
                            />
                            <div 
                              className="w-4 h-4 rounded border shadow-sm"
                              style={{ backgroundColor: theme.colors.card }}
                              title="Cards"
                            />
                          </div>
                          
                          {currentTheme === theme.id && (
                            <div className="flex items-center gap-1 text-primary">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-xs font-medium">Active</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Theme changes are applied immediately and saved automatically. 
                      The interface colors will update to match your selection, including changing all 
                      green elements to black or white based on the chosen theme.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* School Information Tab */}
            <TabsContent value="school">
              <Card className="glass-card">
                <CardHeader className="card-compact-header">
                  <CardTitle className="text-foreground text-sm">School Information</CardTitle>
                </CardHeader>
                <CardContent className="card-compact space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="schoolName" className="text-foreground text-xs">School Name</Label>
                      <Input
                        id="schoolName"
                        value={schoolSettings.schoolName}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motto" className="text-foreground text-xs">School Motto</Label>
                      <Input
                        id="motto"
                        value={schoolSettings.motto}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, motto: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground text-xs">Phone</Label>
                      <Input
                        id="phone"
                        value={schoolSettings.phone}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={schoolSettings.email}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-foreground text-xs">Website</Label>
                      <Input
                        id="website"
                        value={schoolSettings.website}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, website: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="establishedYear" className="text-foreground text-xs">Established Year</Label>
                      <Input
                        id="establishedYear"
                        value={schoolSettings.establishedYear}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, establishedYear: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="principalName" className="text-foreground text-xs">Principal/Headteacher Name</Label>
                      <Input
                        id="principalName"
                        value={schoolSettings.principalName}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, principalName: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="headmasterName" className="text-foreground text-xs">Headmaster Name</Label>
                      <Input
                        id="headmasterName"
                        value={schoolSettings.headmasterName || ''}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, headmasterName: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentTerm" className="text-foreground text-xs">Current Term</Label>
                      <Input
                        id="currentTerm"
                        value={schoolSettings.currentTerm}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, currentTerm: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-foreground text-xs">Address</Label>
                    <Textarea
                      id="address"
                      value={schoolSettings.address}
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="glass textarea-compact"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="logo" className="text-foreground text-xs">School Logo</Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="glass input-compact"
                      />
                      {schoolSettings.logo && (
                        <div className="mt-2">
                          <img src={schoolSettings.logo} alt="School Logo" className="w-12 h-12 object-cover rounded" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="principalSignature" className="text-foreground text-xs">Principal Signature</Label>
                      <Input
                        id="principalSignature"
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload('principal')}
                        className="glass input-compact"
                      />
                      {schoolSettings.principalSignature && (
                        <div className="mt-2">
                          <img src={schoolSettings.principalSignature} alt="Principal Signature" className="w-16 h-8 object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="headmasterSignature" className="text-foreground text-xs">Headmaster Signature</Label>
                      <Input
                        id="headmasterSignature"
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload('headmaster')}
                        className="glass input-compact"
                      />
                      {schoolSettings.headmasterSignature && (
                        <div className="mt-2">
                          <img src={schoolSettings.headmasterSignature} alt="Headmaster Signature" className="w-16 h-8 object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleSchoolSettingsSave}
                    disabled={saving}
                    className="btn-success btn-compact"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-1" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Settings Tab */}
            <TabsContent value="academic">
              <Card className="glass-card">
                <CardHeader className="card-compact-header">
                  <CardTitle className="text-foreground text-sm">Academic Calendar & Grading</CardTitle>
                </CardHeader>
                <CardContent className="card-compact space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="term1Start" className="text-foreground text-xs">Term 1 Start</Label>
                      <Input
                        id="term1Start"
                        type="date"
                        value={academicSettings.term1Start}
                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, term1Start: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="term1End" className="text-foreground text-xs">Term 1 End</Label>
                      <Input
                        id="term1End"
                        type="date"
                        value={academicSettings.term1End}
                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, term1End: e.target.value }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="passingGrade" className="text-foreground text-xs">Passing Grade (%)</Label>
                      <Input
                        id="passingGrade"
                        type="number"
                        min="0"
                        max="100"
                        value={academicSettings.passingGrade}
                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, passingGrade: parseInt(e.target.value) }))}
                        className="glass input-compact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="promotionRequirement" className="text-foreground text-xs">Promotion Requirement (%)</Label>
                      <Input
                        id="promotionRequirement"
                        type="number"
                        min="0"
                        max="100"
                        value={academicSettings.promotionRequirement}
                        onChange={(e) => setAcademicSettings(prev => ({ ...prev, promotionRequirement: parseInt(e.target.value) }))}
                        className="glass input-compact"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system">
              <Card className="glass-card">
                <CardHeader className="card-compact-header">
                  <CardTitle className="text-foreground text-sm">System Statistics</CardTitle>
                </CardHeader>
                <CardContent className="card-compact">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded mx-auto mb-1">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-base font-bold text-foreground">{stats.totalStudents}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-success/20 rounded mx-auto mb-1">
                        <Users className="w-4 h-4 text-success" />
                      </div>
                      <p className="text-base font-bold text-foreground">{stats.totalTeachers}</p>
                      <p className="text-xs text-muted-foreground">Teachers</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded mx-auto mb-1">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-base font-bold text-foreground">{stats.totalSubjects}</p>
                      <p className="text-xs text-muted-foreground">Subjects</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded mx-auto mb-1">
                        <Database className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-base font-bold text-foreground">{stats.totalScores}</p>
                      <p className="text-xs text-muted-foreground">Scores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management Tab */}
            <TabsContent value="data">
              <Card className="glass-card">
                <CardHeader className="card-compact-header">
                  <CardTitle className="text-foreground text-sm">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="card-compact space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      onClick={handleExportData}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white btn-compact"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export Data
                    </Button>
                    
                    <div>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="glass input-compact"
                        disabled={saving}
                      />
                    </div>
                    
                    <Button
                      onClick={handleResetData}
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700 text-white btn-compact"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}