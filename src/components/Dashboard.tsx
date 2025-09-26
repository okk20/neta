import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, GraduationCap, BookOpen, FileText, TrendingUp, Calendar, Sparkles, BarChart3, PieChart } from "lucide-react";
import { db } from "../utils/database";
import { DatabaseStatus } from "./DatabaseStatus";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie } from 'recharts';

interface DashboardProps {
  onNavigate: (section: string) => void;
  username: string;
}

export function Dashboard({ onNavigate, username }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalScores: 0
  });
  const [teacherSubmissionStats, setTeacherSubmissionStats] = useState({
    submitted: 0,
    pending: 0,
    notSubmitted: 0,
    teachers: [] as { id: string; name: string; status: 'submitted' | 'pending' | 'not-submitted'; lastSubmission?: string }[]
  });
  const [chartData, setChartData] = useState({
    classDistribution: [] as { name: string; students: number; color: string }[],
    subjectScores: [] as { subject: string; average: number }[],
    gradeDistribution: [] as { grade: string; count: number; color: string }[],
    monthlyRegistrations: [] as { month: string; students: number; teachers: number }[],
    topPerformers: [] as { name: string; class: string; average: number; photo?: string }[],
    poorPerformers: [] as { name: string; class: string; average: number; photo?: string }[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [students, teachers, subjects, scores] = await Promise.all([
          db.getAllStudents(),
          db.getAllTeachers(),
          db.getAllSubjects(),
          db.getAllScores()
        ]);

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalSubjects: subjects.length,
          totalScores: scores.length
        });

        // Process teacher submission stats
        processTeacherSubmissionStats(teachers, scores);

        // Process chart data
        processChartData(students, teachers, subjects, scores);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const processTeacherSubmissionStats = (teachers: any[], scores: any[]) => {
    // For demo purposes, we'll create mock data
    // In a real implementation, you would check actual score submissions
    const submittedTeachers = Math.floor(teachers.length * 0.7);
    const pendingTeachers = Math.floor(teachers.length * 0.2);
    const notSubmittedTeachers = teachers.length - submittedTeachers - pendingTeachers;
    
    // Mock teacher data with submission status
    const teacherData = teachers.map((teacher, index) => {
      let status: 'submitted' | 'pending' | 'not-submitted' = 'not-submitted';
      let lastSubmission: string | undefined;
      
      if (index < submittedTeachers) {
        status = 'submitted';
        lastSubmission = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toLocaleString();
      } else if (index < submittedTeachers + pendingTeachers) {
        status = 'pending';
      }
      
      return {
        id: teacher.id,
        name: teacher.name,
        status,
        lastSubmission
      };
    });
    
    setTeacherSubmissionStats({
      submitted: submittedTeachers,
      pending: pendingTeachers,
      notSubmitted: notSubmittedTeachers,
      teachers: teacherData
    });
  };

  const processChartData = async (students: any[], teachers: any[], subjects: any[], scores: any[]) => {
    // Class Distribution
    const classDistribution = students.reduce((acc: Record<string, number>, student) => {
      acc[student.class] = (acc[student.class] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    const classData = Object.entries(classDistribution).map(([name, students], index) => ({
      name,
      students: students as number,
      color: colors[index % colors.length]
    }));

    // Grade Distribution
    const gradeDistribution = scores.reduce((acc: Record<string, number>, score) => {
      acc[score.grade] = (acc[score.grade] || 0) + 1;
      return acc;
    }, {});

    const gradeColors: Record<string, string> = {
      'A': '#10b981',
      'B': '#06b6d4', 
      'C': '#f59e0b',
      'D': '#f97316',
      'E': '#ef4444',
      'F': '#dc2626'
    };

    const gradeData = Object.entries(gradeDistribution).map(([grade, count]) => ({
      grade,
      count: count as number,
      color: gradeColors[grade] || '#6b7280'
    }));

    // Subject Scores Average
    const subjectAverages: Record<string, { total: number; count: number }> = {};
    scores.forEach(score => {
      const subjectName = subjects.find(s => s.id === score.subjectId)?.name || 'Unknown';
      if (!subjectAverages[subjectName]) {
        subjectAverages[subjectName] = { total: 0, count: 0 };
      }
      subjectAverages[subjectName].total += score.totalScore;
      subjectAverages[subjectName].count += 1;
    });

    const subjectScores = Object.entries(subjectAverages).map(([subject, data]) => ({
      subject,
      average: Math.round(data.total / data.count) || 0
    }));

    // Monthly Registrations (mock data for demo)
    const monthlyRegistrations = [
      { month: 'Sep', students: Math.floor(students.length * 0.3), teachers: Math.floor(teachers.length * 0.2) },
      { month: 'Oct', students: Math.floor(students.length * 0.2), teachers: Math.floor(teachers.length * 0.3) },
      { month: 'Nov', students: Math.floor(students.length * 0.25), teachers: Math.floor(teachers.length * 0.25) },
      { month: 'Dec', students: Math.floor(students.length * 0.15), teachers: Math.floor(teachers.length * 0.15) },
      { month: 'Jan', students: Math.floor(students.length * 0.1), teachers: Math.floor(teachers.length * 0.1) }
    ];

    setChartData({
      classDistribution: classData,
      subjectScores,
      gradeDistribution: gradeData,
      monthlyRegistrations,
      topPerformers: [],
      poorPerformers: []
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
  const safeUsername = username || 'Guest';
  const firstName = (safeUsername || 'Guest').split(' ')[0];
    if (hour < 12) return `Good Morning, ${firstName}! ☀️`;
    if (hour < 17) return `Good Afternoon, ${firstName}! 🌤️`;
    return `Good Evening, ${firstName}! 🌙`;
  };

  const quickActions = [
    {
      title: "Add New Student",
      description: "Register a new student to the system",
      icon: Users,
      action: () => onNavigate("students"),
      color: "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
    },
    {
      title: "Manage Teachers",
      description: "Add and manage teaching staff",
      icon: GraduationCap,
      action: () => onNavigate("teachers"),
      color: "bg-green-600 hover:bg-green-700 text-white border-green-500"
    },
    {
      title: "Setup Subjects",
      description: "Configure academic subjects",
      icon: BookOpen,
      action: () => onNavigate("subjects"),
      color: "bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
    },
    {
      title: "Generate Reports",
      description: "Create student reports and certificates",
      icon: FileText,
      action: () => onNavigate("reports"),
      color: "bg-orange-600 hover:bg-orange-700 text-white border-orange-500"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-glow rounded-full h-12 w-12 border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <CardHeader className="relative">
          <div className="flex items-center gap-3 mb-2 greeting-animate">
            <div className="p-2 rounded-lg bg-primary text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                {getGreeting()}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Welcome to Offinso College of Education J.H.S. Management System
              </p>
            </div>
          </div>
          <p className="text-foreground">
            {stats.totalStudents === 0 && stats.totalTeachers === 0 && stats.totalSubjects === 0 
              ? "🚀 Get started by adding your first student, teacher, or subject to the system."
              : "📊 Manage your school operations efficiently with our integrated dashboard."
            }
          </p>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card hover:scale-105 transition-all duration-300 group relative overflow-hidden card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-md bg-blue-500 text-white shadow-md">
                <Users className="w-4 h-4" />
              </div>
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1 text-foreground">{stats.totalStudents}</div>
            <p className="text-muted-foreground text-xs">
              {stats.totalStudents === 0 ? "Start by adding students" : "Registered students"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-105 transition-all duration-300 group relative overflow-hidden card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-md bg-green-500 text-white shadow-md">
                <GraduationCap className="w-4 h-4" />
              </div>
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1 text-foreground">{stats.totalTeachers}</div>
            <p className="text-muted-foreground text-xs">
              {stats.totalTeachers === 0 ? "Add teaching staff" : "Teaching staff"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-105 transition-all duration-300 group relative overflow-hidden card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-md bg-purple-500 text-white shadow-md">
                <BookOpen className="w-4 h-4" />
              </div>
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1 text-foreground">{stats.totalSubjects}</div>
            <p className="text-muted-foreground text-xs">
              {stats.totalSubjects === 0 ? "Configure subjects" : "Available subjects"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-105 transition-all duration-300 group relative overflow-hidden card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-md bg-yellow-500 text-white shadow-md">
                <TrendingUp className="w-4 h-4" />
              </div>
              Total Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold mb-1 text-foreground">{stats.totalScores}</div>
            <p className="text-muted-foreground text-xs">
              {stats.totalScores === 0 ? "Record student scores" : "Recorded scores"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Submission Status */}
      {stats.totalTeachers > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <GraduationCap className="w-5 h-5 text-green-400" />
              Teacher Score Submission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">{teacherSubmissionStats.submitted}</div>
                <div className="text-sm text-green-600">Submitted</div>
                <div className="text-xs text-green-500 mt-1">Scores recorded this term</div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">{teacherSubmissionStats.pending}</div>
                <div className="text-sm text-yellow-600">Pending</div>
                <div className="text-xs text-yellow-500 mt-1">In progress submissions</div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">{teacherSubmissionStats.notSubmitted}</div>
                <div className="text-sm text-red-600">Not Submitted</div>
                <div className="text-xs text-red-500 mt-1">No scores recorded yet</div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-700">Teacher</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Last Submission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teacherSubmissionStats.teachers.slice(0, 5).map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-800">{teacher.name}</td>
                      <td className="p-3">
                        <Badge 
                          className={`${
                            teacher.status === 'submitted' 
                              ? 'bg-green-100 text-green-800' 
                              : teacher.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {teacher.status === 'submitted' 
                            ? 'Submitted' 
                            : teacher.status === 'pending' 
                              ? 'Pending' 
                              : 'Not Submitted'}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-600">
                        {teacher.lastSubmission || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teacherSubmissionStats.teachers.length > 5 && (
                <div className="p-3 bg-gray-50 text-center text-sm text-gray-600">
                  Showing 5 of {teacherSubmissionStats.teachers.length} teachers. 
                  <Button 
                    variant="link" 
                    className="ml-1 p-0 h-auto text-blue-600"
                    onClick={() => onNavigate("teachers")}
                  >
                    View all
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      {(stats.totalStudents > 0 || stats.totalScores > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Distribution Chart */}
          {chartData.classDistribution.length > 0 && (
            <Card className="glass-card chart-animate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Class Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #404040',
                        borderRadius: '8px',
                        color: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                      }} 
                    />
                    <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Grade Distribution Pie Chart */}
          {chartData.gradeDistribution.length > 0 && (
            <Card className="glass-card chart-animate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <PieChart className="w-5 h-5 text-green-400" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ grade, count }) => `${grade}: ${count}`}
                      labelStyle={{ fill: '#ffffff', fontSize: '12px' }}
                    >
                      {chartData.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #404040',
                        borderRadius: '8px',
                        color: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Subject Performance Chart */}
      {chartData.subjectScores.length > 0 && (
        <Card className="glass-card chart-animate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Subject Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.subjectScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 ${action.color} shadow-lg hover:shadow-xl`}
                >
                  <Icon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      {stats.totalStudents === 0 && stats.totalTeachers === 0 && stats.totalSubjects === 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">🚀 Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-foreground text-sm mb-3">
                <strong>Welcome to your fresh installation!</strong> Follow these steps to set up your school management system:
              </p>
              <ol className="text-muted-foreground text-sm space-y-2 ml-4 list-decimal">
                <li>🏫 <strong className="text-foreground">Configure School Settings:</strong> Go to Settings to add your school logo and information</li>
                <li>📚 <strong className="text-foreground">Add Subjects:</strong> Set up your curriculum in Subject Management</li>
                <li>👨‍🏫 <strong className="text-foreground">Register Teachers:</strong> Add your teaching staff in Teacher Management</li>
                <li>👨‍🎓 <strong className="text-foreground">Enroll Students:</strong> Register students in Student Management</li>
                <li>📊 <strong className="text-foreground">Record Scores:</strong> Enter student scores and generate reports</li>
              </ol>
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => onNavigate("settings")}
                  className="bubble-button"
                >
                  Start Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Status */}
      <DatabaseStatus />
    </div>
  );
}