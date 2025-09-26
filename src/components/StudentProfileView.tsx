import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowLeft, Phone, MapPin, Calendar, User, GraduationCap, FileText, MessageSquare, Mail, Edit, Save, X, CheckCircle, XCircle } from "lucide-react";

interface StudentProfileViewProps {
  student: {
    id: string;
    name: string;
    class: string;
    gender: string;
    dateOfBirth: string;
    age: number;
    photo?: string;
    guardianName: string;
    guardianPhone: string;
    guardianAddress: string;
    admissionDate: string;
  };
  onBack: () => void;
  currentUserRole?: 'admin' | 'teacher' | 'student';
}

export function StudentProfileView({ student, onBack }: StudentProfileViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingAttendance, setEditingAttendance] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState({
    term1: { present: 88, total: 90 },
    term2: { present: 85, total: 88 },
    term3: { present: 92, total: 95 }
  });
  const [tempAttendance, setTempAttendance] = useState({ present: 0, total: 0 });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  const mockScores = [
    { subject: "Mathematics", term1: 42, term2: 38, term3: 45, average: 42 },
    { subject: "English Language", term1: 35, term2: 40, term3: 38, average: 38 },
    { subject: "Science", term1: 48, term2: 45, term3: 47, average: 47 },
    { subject: "Social Studies", term1: 40, term2: 42, term3: 44, average: 42 },
    { subject: "ICT", term1: 46, term2: 48, term3: 49, average: 48 },
    { subject: "RME", term1: 41, term2: 39, term3: 43, average: 41 }
  ];

  const startEditAttendance = (term: string) => {
    const termData = attendanceData[term as keyof typeof attendanceData];
    setTempAttendance({ present: termData.present, total: termData.total });
    setEditingAttendance(term);
  };

  const saveAttendance = (term: string) => {
    if (tempAttendance.present <= tempAttendance.total && tempAttendance.present >= 0) {
      setAttendanceData({
        ...attendanceData,
        [term]: tempAttendance
      });
      setEditingAttendance(null);
    } else {
      alert("Present days cannot be greater than total days or negative");
    }
  };

  const cancelEditAttendance = () => {
    setEditingAttendance(null);
    setTempAttendance({ present: 0, total: 0 });
  };

  const sendWhatsAppMessage = () => {
    const message = `Hello ${student.guardianName}, this is a message from Offinso College of Education J.H.S. regarding your ward ${student.name}'s academic progress. Please contact the school for more details.`;
    const whatsappUrl = `https://wa.me/${student.guardianPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendSMSMessage = () => {
    const message = `Hello ${student.guardianName}, this is Offinso College of Education J.H.S. regarding ${student.name}'s academic progress. Please contact us.`;
    const smsUrl = `sms:${student.guardianPhone}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_self');
  };

  return (
    <div className="space-y-6">
      <Button 
        onClick={onBack}
        className="bubble-button bg-primary/20 hover:bg-primary/30 text-white border-primary/30"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Students
      </Button>

      {/* Student Header */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-48 h-60 bg-white/10 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
              <ImageWithFallback 
                src={student.photo || `https://ui-avatars.com/api/?name=${student.name}&size=400&background=random`}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-white text-2xl mb-2">{student.name}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                  {student.id}
                </Badge>
                <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                  {student.class}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                  {student.gender}
                </Badge>
                <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/30">
                  Age {student.age}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>DOB: {formatDate(student.dateOfBirth)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Admitted: {formatDate(student.admissionDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Guardian: {student.guardianName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{student.guardianPhone}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2 mt-2 text-white/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{student.guardianAddress}</span>
              </div>
              
              {/* Communication buttons removed for student portal to restrict actions */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs - students only see Reports */}
      <div className="flex gap-2 overflow-x-auto">
        { (/* if student, show only reports */ false) ? null : (
          <Button
            key={'reports'}
            onClick={() => setActiveTab('reports')}
            className={`bubble-button ${activeTab === 'reports' 
              ? 'bg-primary/30 text-white border-primary/40' 
              : 'bg-white/10 text-white/80 border-white/20'
            }`}
          >
            Reports
          </Button>
        )}
      </div>

      {/* Tab Content */}
  {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Overall Average</span>
                  <Badge className="bg-green-500/20 text-green-200">78%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Class Rank</span>
                  <span className="text-white">3 / 35</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Attendance Rate</span>
                  <Badge className="bg-blue-500/20 text-blue-200">94%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Report card generated - Term 1</span>
                  </div>
                  <div className="text-white/60 text-xs mt-1">2 days ago</div>
                </div>
                <div className="text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Examination completed - Mathematics</span>
                  </div>
                  <div className="text-white/60 text-xs mt-1">1 week ago</div>
                </div>
                <div className="text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Guardian contacted via WhatsApp</span>
                  </div>
                  <div className="text-white/60 text-xs mt-1">2 weeks ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "academic" && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Academic Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 p-3">Subject</th>
                    <th className="text-center text-white/80 p-3">Term 1</th>
                    <th className="text-center text-white/80 p-3">Term 2</th>
                    <th className="text-center text-white/80 p-3">Term 3</th>
                    <th className="text-center text-white/80 p-3">Average</th>
                    <th className="text-center text-white/80 p-3">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {mockScores.map((score, index) => (
                    <tr key={index} className="border-b border-white/10">
                      <td className="text-white p-3">{score.subject}</td>
                      <td className="text-center text-white p-3">{score.term1}</td>
                      <td className="text-center text-white p-3">{score.term2}</td>
                      <td className="text-center text-white p-3">{score.term3}</td>
                      <td className="text-center text-white p-3">{score.average}</td>
                      <td className="text-center p-3">
                        <Badge className={`${score.average >= 40 ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                          {score.average >= 40 ? 'B' : 'C'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "attendance" && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Attendance Records
              <Badge className="bg-blue-500/20 text-blue-200">Editable</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(attendanceData).map(([term, data]) => (
                <div key={term} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white capitalize">{term.replace('term', 'Term ')}</h4>
                    {editingAttendance === term ? (
                      <div className="flex gap-1">
                        <Button
                          onClick={() => saveAttendance(term)}
                          className="bubble-button bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/30 p-1"
                          size="sm"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={cancelEditAttendance}
                          className="bubble-button bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30 p-1"
                          size="sm"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => startEditAttendance(term)}
                        className="bubble-button bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/30 p-1"
                        size="sm"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white/80">
                      <span>Present:</span>
                      {editingAttendance === term ? (
                        <Input
                          type="number"
                          value={tempAttendance.present}
                          onChange={(e) => setTempAttendance({
                            ...tempAttendance,
                            present: parseInt(e.target.value) || 0
                          })}
                          className="glass border-white/20 text-white w-16 h-6 text-xs"
                          min="0"
                          max={tempAttendance.total}
                        />
                      ) : (
                        <span>{data.present} days</span>
                      )}
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Total:</span>
                      {editingAttendance === term ? (
                        <Input
                          type="number"
                          value={tempAttendance.total}
                          onChange={(e) => setTempAttendance({
                            ...tempAttendance,
                            total: parseInt(e.target.value) || 0
                          })}
                          className="glass border-white/20 text-white w-16 h-6 text-xs"
                          min="0"
                        />
                      ) : (
                        <span>{data.total} days</span>
                      )}
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Rate:</span>
                      <Badge className={`${Math.round((data.present / data.total) * 100) >= 80 ? 'bg-green-500/20 text-green-200' : 'bg-orange-500/20 text-orange-200'}`}>
                        {Math.round((data.present / data.total) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      {Math.round((data.present / data.total) * 100) >= 80 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-white/60 text-sm">
                Click the edit button on any term to modify attendance records
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "reports" && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <FileText className="w-8 h-8 text-blue-400 mb-2" />
                  <h4 className="text-white mb-2">Report Card</h4>
                  <p className="text-white/60 text-sm mb-3">Terminal assessment report</p>
                  <Button className="bubble-button bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/30 w-full">
                    Download
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}