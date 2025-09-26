import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  MessageSquare, 
  Send, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Eye,
  EyeOff,
  Download,
  Loader2,
  Phone,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { MessagePreview } from "./whatsapp/MessagePreview";
import { SendingProgress } from "./whatsapp/SendingProgress";
import { StatisticsCards } from "./whatsapp/StatisticsCards";
import { db, type Student } from "../utils/database";
import { 
  generateAllSummaries, 
  sendBulkWhatsAppMessages, 
  type ExamSummary,
  getWhatsAppConfigStatus
} from "../utils/whatsapp";
import { MESSAGE_TEMPLATE, MESSAGE_PLACEHOLDERS } from "../constants/whatsapp";

export function WhatsAppBulkMessaging() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [summaries, setSummaries] = useState<ExamSummary[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [messageTemplate, setMessageTemplate] = useState(MESSAGE_TEMPLATE);
  const [showTemplate, setShowTemplate] = useState(false); // Hide by default
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [configStatus, setConfigStatus] = useState(getWhatsAppConfigStatus());

  useEffect(() => {
    loadData();
    setConfigStatus(getWhatsAppConfigStatus());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      generateSummaries();
    }
  }, [students, selectedClass]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allStudents = await db.getAllStudents();
      const activeStudents = allStudents.filter(s => s.status === 'active');
      setStudents(activeStudents);
      setError('');
    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load student data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSummaries = async () => {
    try {
      const filteredStudents = selectedClass === 'all' 
        ? students 
        : students.filter(s => s.class === selectedClass);
      
      const studentsWithGuardians = filteredStudents.filter(s => 
        s.guardianPhone && s.guardianPhone.trim() && s.guardianName && s.guardianName.trim()
      );
      
      const examSummaries = await generateAllSummaries(studentsWithGuardians);
      setSummaries(examSummaries);
    } catch (error) {
      console.error('Failed to generate summaries:', error);
      setError('Failed to generate exam summaries.');
    }
  };

  const handleSendMessages = async () => {
    if (summaries.length === 0) {
      setError('No students with valid guardian information found.');
      return;
    }

    try {
      setSending(true);
      setResults(null);
      setError('');
      setSuccess('');
      setSendingProgress({ sent: 0, total: summaries.length });

      const sendResults = await sendBulkWhatsAppMessages(
        summaries,
        messageTemplate,
        (sent, total) => {
          setSendingProgress({ sent, total });
        }
      );

      setResults(sendResults);

      if (sendResults.success > 0) {
        setSuccess(`Successfully processed ${sendResults.success} messages! ${
          !configStatus.configured 
            ? 'Messages opened in WhatsApp Web for manual sending.' 
            : 'Messages sent via WhatsApp Business API.'
        }`);
      }

      if (sendResults.failed > 0) {
        setError(`${sendResults.failed} messages failed to process. Check console for details.`);
      }

    } catch (error) {
      console.error('Bulk messaging failed:', error);
      setError('Failed to send messages. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(students.map(s => s.class))].sort();
    return classes;
  };

  const studentsWithGuardians = students.filter(s => 
    s.guardianPhone && s.guardianPhone.trim() && s.guardianName && s.guardianName.trim()
  );

  const studentsWithoutGuardians = students.filter(s => 
    !s.guardianPhone || !s.guardianPhone.trim() || !s.guardianName || !s.guardianName.trim()
  );

  const exportResults = () => {
    if (!results) return;
    
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalStudents: summaries.length,
        successful: results.success,
        failed: results.failed,
        configurationStatus: configStatus.configured ? 'API' : 'Manual'
      },
      students: summaries.map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        class: s.class,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        totalExamScore: s.totalExamScoreDoubled, // Use doubled score
        averageScore: s.averageScore,
        grade: s.actualGrade, // Use actual grade
        position: `${s.position}/${s.classSize}`
      })),
      errors: results.errors
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-messaging-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading WhatsApp messaging system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4" />
            WhatsApp Bulk Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="card-compact">
          {/* Configuration Status */}
          <Alert className={`mb-4 py-2 ${configStatus.configured ? 'border-success bg-success/20' : 'border-blue-500 bg-blue-900/20'}`}>
            <Info className={`h-3 w-3 ${configStatus.configured ? 'text-success' : 'text-blue-400'}`} />
            <AlertDescription className={`${configStatus.configured ? 'text-success' : 'text-blue-300'} text-xs`}>
              <strong>Configuration Status:</strong> {configStatus.message}
              {!configStatus.configured && (
                <div className="mt-1">
                  <p className="text-xs">
                    To enable direct API messaging, configure your WhatsApp Business API credentials in the constants file.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Messages */}
          {error && (
            <Alert className="mb-4 py-2 border-destructive bg-destructive/20">
              <AlertCircle className="h-3 w-3 text-destructive" />
              <AlertDescription className="text-destructive text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 py-2 border-success bg-success/20">
              <CheckCircle className="h-3 w-3 text-success" />
              <AlertDescription className="text-success text-xs">{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <StatisticsCards 
        totalStudents={students.length}
        studentsWithGuardians={studentsWithGuardians.length}
        studentsWithoutGuardians={studentsWithoutGuardians.length}
        selectedForMessaging={summaries.length}
      />

      {/* Controls */}
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground text-sm">Message Configuration</CardTitle>
        </CardHeader>
        <CardContent className="card-compact space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground mb-1 block">Filter by Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="glass input-compact">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="all">All Classes</SelectItem>
                  {getUniqueClasses().map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="glass flex-1 btn-compact"
              >
                <Eye className="w-3 h-3 mr-1" />
                {showPreview ? 'Hide Preview' : 'Preview Messages'}
              </Button>

              {results && (
                <Button
                  onClick={exportResults}
                  variant="outline"
                  className="glass btn-compact"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export Report
                </Button>
              )}
            </div>
          </div>

          {/* Message Template Section - Collapsible */}
          <div className="border border-border rounded-lg">
            <Button
              onClick={() => setShowTemplate(!showTemplate)}
              variant="outline"
              className="w-full justify-between glass btn-compact"
            >
              <span className="flex items-center gap-2">
                {showTemplate ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                Message Template
              </span>
              {showTemplate ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>

            {showTemplate && (
              <div className="p-3 border-t border-border">
                <div>
                  <label className="text-xs text-foreground mb-1 block">Customize Message Template</label>
                  <Textarea
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    className="glass textarea-compact"
                    rows={10}
                    placeholder="Enter your message template..."
                  />
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Available placeholders:</p>
                    <div className="flex flex-wrap gap-1">
                      {MESSAGE_PLACEHOLDERS.map((placeholder) => (
                        <Badge key={placeholder} variant="secondary" className="text-xs">
                          {placeholder}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                      <p className="text-xs text-blue-300">
                        <strong>Note:</strong> Total Exam Score is calculated as (Sum of Exam Scores × 2). 
                        Class Position uses ordinal format (1st, 2nd, 3rd, etc.). 
                        Grade is taken from actual report card scores.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendMessages}
              disabled={sending || summaries.length === 0}
              className="btn-success flex-1 btn-compact"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing Messages...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-1" />
                  {configStatus.configured ? 'Send Messages' : 'Open in WhatsApp Web'} ({summaries.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && summaries.length > 0 && (
        <MessagePreview 
          summaries={summaries.slice(0, 3)} 
          messageTemplate={messageTemplate}
        />
      )}

      {/* Sending Progress */}
      {sending && (
        <SendingProgress 
          sent={sendingProgress.sent}
          total={sendingProgress.total}
          configurationMode={configStatus.configured ? 'api' : 'manual'}
        />
      )}

      {/* Results */}
      {results && !sending && (
        <Card className="glass-card">
          <CardHeader className="card-compact-header">
            <CardTitle className="text-foreground text-sm">Messaging Results</CardTitle>
          </CardHeader>
          <CardContent className="card-compact">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-success/20 rounded mx-auto mb-1 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <p className="text-base font-bold text-foreground">{results.success}</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-destructive/20 rounded mx-auto mb-1 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-base font-bold text-foreground">{results.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary/20 rounded mx-auto mb-1 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-base font-bold text-foreground">{summaries.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Errors:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Students without Guardian Info */}
      {studentsWithoutGuardians.length > 0 && (
        <Card className="glass-card border-yellow-500/50">
          <CardHeader className="card-compact-header">
            <CardTitle className="text-foreground text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Students Missing Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="card-compact">
            <p className="text-xs text-muted-foreground mb-2">
              The following students cannot receive messages due to missing guardian information:
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {studentsWithoutGuardians.map((student) => (
                <div key={student.id} className="flex justify-between items-center text-xs p-2 bg-secondary/20 rounded">
                  <span className="text-foreground">{student.name} ({student.class})</span>
                  <Badge variant="secondary" className="text-xs">
                    {!student.guardianName ? 'No Guardian Name' : 'No Phone Number'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}