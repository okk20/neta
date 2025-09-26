import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Download,
  Share2,
  Smartphone
} from "lucide-react";
import { db, type Student, type Teacher } from "../utils/database";

interface Message {
  id: string;
  type: 'whatsapp' | 'sms' | 'email';
  recipient: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

interface MessagingServiceProps {
  defaultRecipient?: string;
  defaultMessage?: string;
  defaultType?: 'whatsapp' | 'sms' | 'email';
  onMessageSent?: (message: Message) => void;
}

export function MessagingService({ 
  defaultRecipient = '', 
  defaultMessage = '', 
  defaultType = 'whatsapp',
  onMessageSent 
}: MessagingServiceProps) {
  const [messageType, setMessageType] = useState<'whatsapp' | 'sms' | 'email'>(defaultType);
  const [recipientType, setRecipientType] = useState<'individual' | 'group'>('individual');
  const [groupType, setGroupType] = useState<'all_parents' | 'all_teachers' | 'class_specific'>('all_parents');
  const [selectedClass, setSelectedClass] = useState('');
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const classes = ["B.S.7A", "B.S.7B", "B.S.7C", "B.S.8A", "B.S.8B", "B.S.8C", "B.S.9A", "B.S.9B", "B.S.9C"];

  const messageTemplates = {
    report_card: "Dear Parent/Guardian, your child's report card for this term is now ready. Please visit the school to collect it or download it from our portal. Best regards, Offinso College of Education J.H.S.",
    exam_reminder: "Dear Parent/Guardian, this is to remind you that examinations for your child will begin on [DATE]. Please ensure your child is well prepared. Best regards, Offinso College of Education J.H.S.",
    fee_reminder: "Dear Parent/Guardian, this is to remind you about the outstanding school fees for your child. Please visit the school office for payment. Best regards, Offinso College of Education J.H.S.",
    vacation_notice: "Dear Parent/Guardian, we wish to inform you that the school will be closing for vacation on [DATE]. Resumption date is [DATE]. Best regards, Offinso College of Education J.H.S.",
    meeting_notice: "Dear Parent/Guardian, you are cordially invited to attend a PTA meeting on [DATE] at [TIME]. Your presence is highly valued. Best regards, Offinso College of Education J.H.S."
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'sms':
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-purple-400" />;
      default:
        return <Send className="w-5 h-5" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return 'bg-green-500/20 border-green-500/30 text-green-200';
      case 'sms':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-200';
      case 'email':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-200';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-200';
    }
  };

  const sendWhatsAppMessage = async (phoneNumber: string, content: string) => {
    // In a real implementation, you would integrate with WhatsApp Business API
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(content)}`;
    window.open(whatsappUrl, '_blank');
    return true;
  };

  const sendSMSMessage = async (phoneNumber: string, content: string) => {
    // In a real implementation, you would integrate with SMS API service like Twilio
    console.log('SMS would be sent to:', phoneNumber, 'Content:', content);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  };

  const sendEmailMessage = async (email: string, subject: string, content: string) => {
    // In a real implementation, you would integrate with email service
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
    window.open(mailtoUrl);
    return true;
  };

  const getRecipients = async () => {
    const recipients: Array<{phone: string, email: string, name: string}> = [];
    
    if (recipientType === 'individual') {
      // For individual messages, use the provided recipient
      recipients.push({
        phone: recipient,
        email: recipient,
        name: 'Individual Recipient'
      });
    } else {
      // For group messages
      if (groupType === 'all_parents') {
        const students = await db.getAllStudents();
        students.forEach(student => {
          recipients.push({
            phone: student.guardianPhone,
            email: '', // Assuming we don't have guardian emails in student data
            name: `Parent of ${student.name}`
          });
        });
      } else if (groupType === 'all_teachers') {
        const teachers = await db.getAllTeachers();
        teachers.forEach(teacher => {
          recipients.push({
            phone: teacher.phone,
            email: teacher.email,
            name: teacher.name
          });
        });
      } else if (groupType === 'class_specific' && selectedClass) {
        const students = await db.getAllStudents();
        const classStudents = students.filter(student => student.class === selectedClass);
        classStudents.forEach(student => {
          recipients.push({
            phone: student.guardianPhone,
            email: '',
            name: `Parent of ${student.name} (${student.class})`
          });
        });
      }
    }
    
    return recipients;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    
    try {
      const recipients = await getRecipients();
      const successCount = { whatsapp: 0, sms: 0, email: 0 };
      const failedCount = { whatsapp: 0, sms: 0, email: 0 };

      for (const recipientData of recipients) {
        try {
          let success = false;
          
          if (messageType === 'whatsapp' && recipientData.phone) {
            success = await sendWhatsAppMessage(recipientData.phone, message);
          } else if (messageType === 'sms' && recipientData.phone) {
            success = await sendSMSMessage(recipientData.phone, message);
          } else if (messageType === 'email' && recipientData.email) {
            success = await sendEmailMessage(recipientData.email, subject, message);
          }

          const newMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: messageType,
            recipient: messageType === 'email' ? recipientData.email : recipientData.phone,
            content: message,
            status: success ? 'sent' : 'failed',
            timestamp: new Date().toISOString()
          };

          setSentMessages(prev => [newMessage, ...prev]);

          if (success) {
            successCount[messageType]++;
            if (onMessageSent) {
              onMessageSent(newMessage);
            }
          } else {
            failedCount[messageType]++;
          }

          // Small delay between messages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error('Failed to send message:', error);
          failedCount[messageType]++;
        }
      }

      const totalSuccess = successCount.whatsapp + successCount.sms + successCount.email;
      const totalFailed = failedCount.whatsapp + failedCount.sms + failedCount.email;

      if (totalSuccess > 0) {
        alert(`Successfully sent ${totalSuccess} message(s)!${totalFailed > 0 ? ` ${totalFailed} failed.` : ''}`);
      } else {
        alert('Failed to send messages. Please check your connection and try again.');
      }

      // Reset form
      if (recipientType === 'individual') {
        setRecipient('');
      }
      setMessage('');
      setSubject('');
      
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('An error occurred while sending messages. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const previewRecipientCount = async () => {
    const recipients = await getRecipients();
    return recipients.length;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Communication Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Type Selection */}
          <div>
            <Label className="text-white mb-3 block">Communication Method</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['whatsapp', 'sms', 'email'] as const).map((type) => (
                <Button
                  key={type}
                  onClick={() => setMessageType(type)}
                  className={`bubble-button h-auto p-4 flex flex-col items-center gap-2 ${
                    messageType === type 
                      ? getMessageColor(type) 
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {getMessageIcon(type)}
                  <span className="capitalize text-sm font-medium">{type}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Recipient Type */}
          <div>
            <Label className="text-white mb-3 block">Recipient Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setRecipientType('individual')}
                className={`bubble-button h-auto p-4 flex items-center gap-3 ${
                  recipientType === 'individual'
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Phone className="w-4 h-4" />
                Individual
              </Button>
              <Button
                onClick={() => setRecipientType('group')}
                className={`bubble-button h-auto p-4 flex items-center gap-3 ${
                  recipientType === 'group'
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                Group
              </Button>
            </div>
          </div>

          {/* Recipient Configuration */}
          {recipientType === 'individual' ? (
            <div>
              <Label className="text-white">
                Recipient {messageType === 'email' ? 'Email' : 'Phone Number'}
              </Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/60"
                placeholder={messageType === 'email' ? 'user@example.com' : '+233 XX XXX XXXX'}
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-white">Group Type</Label>
                <Select value={groupType} onValueChange={setGroupType}>
                  <SelectTrigger className="glass border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/20">
                    <SelectItem value="all_parents" className="text-white">All Parents/Guardians</SelectItem>
                    <SelectItem value="all_teachers" className="text-white">All Teachers</SelectItem>
                    <SelectItem value="class_specific" className="text-white">Specific Class Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {groupType === 'class_specific' && (
                <div>
                  <Label className="text-white">Select Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="glass border-white/20 text-white">
                      <SelectValue placeholder="Choose class" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/20">
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls} className="text-white">{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Quick Templates */}
          <div>
            <Label className="text-white mb-3 block">Quick Templates</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(messageTemplates).map(([key, template]) => (
                <Button
                  key={key}
                  onClick={() => setMessage(template)}
                  className="bubble-button bg-gray-500/10 hover:bg-gray-500/20 text-white border-gray-500/20 text-xs h-auto p-2"
                >
                  {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>

          {/* Email Subject (only for emails) */}
          {messageType === 'email' && (
            <div>
              <Label className="text-white">Email Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/60"
                placeholder="Enter email subject"
                required
              />
            </div>
          )}

          {/* Message Content */}
          <div>
            <Label className="text-white">Message Content</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="glass border-white/20 text-white placeholder:text-white/60 min-h-[120px]"
              placeholder="Type your message here..."
              required
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/40 text-xs">
                {message.length} characters
              </span>
              {messageType === 'sms' && message.length > 160 && (
                <span className="text-yellow-400 text-xs">
                  This SMS will be sent as {Math.ceil(message.length / 160)} messages
                </span>
              )}
            </div>
          </div>

          {/* Preview and Send */}
          <div className="flex gap-3">
            <Button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className={`bubble-button flex-1 ${getMessageColor(messageType)}`}
            >
              {sending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {getMessageIcon(messageType)}
                  Send {messageType.charAt(0).toUpperCase() + messageType.slice(1)}
                </div>
              )}
            </Button>

            <Button
              onClick={() => setShowPreview(!showPreview)}
              className="bubble-button bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Preview
            </Button>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                <div className="space-y-2">
                  <p><strong>Method:</strong> {messageType.toUpperCase()}</p>
                  <p><strong>Recipients:</strong> {recipientType === 'individual' ? 'Individual' : groupType.replace('_', ' ')}</p>
                  {messageType === 'email' && subject && <p><strong>Subject:</strong> {subject}</p>}
                  <p><strong>Message:</strong></p>
                  <div className="bg-black/20 p-2 rounded text-sm whitespace-pre-wrap">
                    {message || 'No message content'}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Messages */}
      {sentMessages.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {sentMessages.slice(0, 10).map((msg) => (
                <div key={msg.id} className="glass p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getMessageIcon(msg.type)}
                      <span className="text-white text-sm font-medium">
                        {msg.type.toUpperCase()}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={msg.status === 'sent' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}
                      >
                        {msg.status}
                      </Badge>
                    </div>
                    <span className="text-white/60 text-xs">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-white/80 text-sm">
                    <strong>To:</strong> {msg.recipient}
                  </div>
                  <div className="text-white/70 text-xs mt-1 truncate">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}