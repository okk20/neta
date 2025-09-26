import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import { db } from "../utils/database";

interface DatabaseStats {
  students: number;
  teachers: number;
  subjects: number;
  scores: number;
  settings: number;
}

export function DatabaseStatus() {
  const [stats, setStats] = useState<DatabaseStats>({
    students: 0,
    teachers: 0,
    subjects: 0,
    scores: 0,
    settings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [students, teachers, subjects, scores, settings] = await Promise.all([
        db.getAllStudents(),
        db.getAllTeachers(),
        db.getAllSubjects(),
        db.getAllScores(),
        db.getAllSettings()
      ]);

      setStats({
        students: students.length,
        teachers: teachers.length,
        subjects: subjects.length,
        scores: scores.length,
        settings: Object.keys(settings).length
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load database stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const testDatabaseOperations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test student operations
      const studentId = await db.generateStudentId();
      const testStudent = {
        studentId: studentId,
        name: "Test Student",
        class: "B.S.7A",
        gender: "Male",
        dateOfBirth: "01/01/2010",
        address: "Test Address",  // Adding required field
        guardianName: "Test Guardian",
        guardianPhone: "+233 24 000 0000",
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'active' as const
      };

      await db.addStudent(testStudent);
      const retrievedStudent = await db.getStudent(studentId);

      if (!retrievedStudent || retrievedStudent.name !== testStudent.name) {
        throw new Error('Student CRUD operations failed');
      }

      await db.deleteStudent(studentId);

      // Test subject operations
      const subjectId = await db.generateSubjectId();
      const testSubject = {
        subjectId: subjectId,
        name: "Test Subject",
        code: "TEST",
        description: "Test Description",
        category: "Test Category",
        creditHours: 3,
        isCore: true
      };

      await db.addSubject(testSubject);
      const subjects = await db.getAllSubjects();
      const foundSubject = subjects.find(s => s.id === subjectId);

      if (!foundSubject || foundSubject.name !== testSubject.name) {
        throw new Error('Subject CRUD operations failed');
      }

      await db.deleteSubject(subjectId);

      // Test settings operations
      await db.setSetting('test_setting', 'test_value');
      const testValue = await db.getSetting('test_setting');

      if (testValue !== 'test_value') {
        throw new Error('Settings operations failed');
      }

      // Reload stats
      await loadStats();
      alert('Database operations test completed successfully! ✅');
      
    } catch (err) {
      console.error('Database test failed:', err);
      setError(`Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      alert(`Database test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = () => {
    if (loading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />;
    if (error) return <XCircle className="w-5 h-5 text-red-400" />;
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const statusText = () => {
    if (loading) return "Loading...";
    if (error) return "Error";
    return "Connected";
  };

  const statusColor = () => {
    if (loading) return "badge-primary";
    if (error) return "badge-danger";
    return "badge-success";
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Status
          </div>
          <Badge variant="secondary" className={statusColor()}>
            {statusIcon()}
            {statusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="glass rounded-lg p-4 border-red-500/50 bg-red-900/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium">Error</span>
            </div>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass rounded-lg p-3 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-foreground text-xl font-bold">{stats.students}</p>
            <p className="text-muted-foreground text-xs">Students</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <GraduationCap className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-foreground text-xl font-bold">{stats.teachers}</p>
            <p className="text-muted-foreground text-xs">Teachers</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-foreground text-xl font-bold">{stats.subjects}</p>
            <p className="text-muted-foreground text-xs">Subjects</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-foreground text-xl font-bold">{stats.scores}</p>
            <p className="text-muted-foreground text-xs">Scores</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <Database className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-foreground text-xl font-bold">{stats.settings}</p>
            <p className="text-muted-foreground text-xs">Settings</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={loadStats}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          <Button 
            onClick={testDatabaseOperations}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Test Database
          </Button>
        </div>

        {lastUpdated && (
          <p className="text-muted-foreground text-xs text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}