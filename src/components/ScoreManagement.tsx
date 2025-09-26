import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ClipboardList, CheckCircle, AlertCircle } from "lucide-react";
import { ScoreForm } from "./scores/ScoreForm";
import { ScoreStatistics } from "./scores/ScoreStatistics";
import { ScoreFilters } from "./scores/ScoreFilters";
import { ScoreList } from "./scores/ScoreList";
import { ScoreUtils } from "../utils/scores";
import { DEFAULT_SCORE_FORM, SCORE_VALIDATION_MESSAGES } from "../constants/scores";
import { db, type Score, type Student, type Subject, type User } from "../utils/database";

interface ScoreManagementProps {
  currentUser?: User;
}

export function ScoreManagement({ currentUser }: ScoreManagementProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL_CLASSES');
  const [filterSubject, setFilterSubject] = useState('ALL_SUBJECTS');
  const [filterTerm, setFilterTerm] = useState('Term 1');
  const [filterYear, setFilterYear] = useState('2024');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [scoreForm, setScoreForm] = useState(DEFAULT_SCORE_FORM);

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scoresList, studentsList, subjectsList] = await Promise.all([
        db.getAllScores(),
        db.getAllStudents(),
        db.getAllSubjects()
      ]);

      console.log('Raw data loaded:', { scoresList, studentsList, subjectsList });

      let filteredScores = scoresList;
      let filteredSubjects = subjectsList;

      if (isTeacher && currentUser?.teacherId) {
        const teacher = await db.getTeacherById(currentUser.teacherId);
        console.log('Teacher data:', teacher);
        if (teacher && teacher.subjects) {
          // Teacher.subjects may contain different id shapes (subjectId, _id, code, or name)
          // Normalize teacher.subjects: entries might be strings or objects
          const teacherSubjects = teacher.subjects.map((t: any) => {
            if (!t) return '';
            if (typeof t === 'string') return t.trim();
            // t might be an object with various fields
            return (t.subjectId || t.id || t._id || t.code || t.name || '').toString().trim();
          }).filter(Boolean).map(String);

          console.log('Teacher subjects (normalized):', teacherSubjects);
          console.log('All subjects:', subjectsList);

          const matchesTeacherSubject = (subject: any) => {
            // Create a comprehensive list of possible subject identifiers
            const subjectIds = [
              subject.id, 
              subject.subjectId, 
              subject._id, 
              subject.code, 
              subject.name
            ].filter(Boolean).map((id: any) => String(id).trim().toLowerCase());

            // Check if any of the teacher's subjects match any of the subject's identifiers
            return teacherSubjects.some((teacherSubject: string) => {
              const normalizedTeacherSubject = teacherSubject.toLowerCase();
              return subjectIds.includes(normalizedTeacherSubject) || 
                     subjectIds.some(id => id.includes(normalizedTeacherSubject)) ||
                     normalizedTeacherSubject.includes(subject.name?.toLowerCase() || '');
            });
          };

          filteredSubjects = subjectsList.filter(s => matchesTeacherSubject(s));
          console.log('Filtered subjects for teacher:', filteredSubjects);
          
          // If no subjects match, show all subjects with a warning
          if (filteredSubjects.length === 0) {
            console.warn('No subjects matched for teacher, showing all subjects');
            filteredSubjects = subjectsList;
          }
          
          filteredScores = scoresList.filter(s => {
            const subjId = (s as any).subjectId || (s as any).subject || (s as any).subject_id;
            if (!subjId) return false;
            return teacherSubjects.includes(String(subjId)) || 
                   teacherSubjects.includes(String(subjId).toLowerCase()) ||
                   teacherSubjects.some((ts: string) => String(subjId).toLowerCase().includes(ts.toLowerCase()));
          });
        }
      }

      setScores(filteredScores);
      setStudents(studentsList);
      setSubjects(filteredSubjects);
      setError('');
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load scores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setScoreForm(DEFAULT_SCORE_FORM);
    setEditingScore(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const validationError = ScoreUtils.validateScoreForm(scoreForm);
      if (validationError) {
        throw new Error(validationError);
      }

      const scoreData = ScoreUtils.createScoreData(scoreForm, currentUser);

      if (editingScore) {
        await db.updateScore(editingScore.id, scoreData, currentUser?.role);
        setSuccess('Score updated successfully!');
      } else {
        await db.addScore(scoreData as Score, currentUser?.role);
        setSuccess('Score added successfully!');
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save score:', error);
      setError(error.message || 'Failed to save score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (score: Score) => {
    setScoreForm({
      studentId: score.studentId,
      subjectId: score.subjectId,
      term: score.term,
      year: score.year,
      classScore: score.classScore,
      examScore: score.examScore,
      remarks: score.remarks || ''
    });
    setEditingScore(score);
    setShowAddForm(true);
    clearMessages();
  };

  const handleDelete = async (score: Score) => {
    if (!isAdmin) {
      setError(SCORE_VALIDATION_MESSAGES.ADMIN_DELETE_ONLY);
      return;
    }

    if (!confirm('Are you sure you want to delete this score? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await db.deleteScore(score.id, currentUser?.role);
      setSuccess('Score deleted successfully!');
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete score:', error);
      setError(error.message || 'Failed to delete score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterClass('ALL_CLASSES');
    setFilterSubject('ALL_SUBJECTS');
    setSearchTerm('');
  };

  const filteredScores = ScoreUtils.filterScores(scores, students, subjects, {
    searchTerm,
    filterClass: filterClass === 'ALL_CLASSES' ? '' : filterClass,
    filterSubject: filterSubject === 'ALL_SUBJECTS' ? '' : filterSubject,
    filterTerm,
    filterYear
  });

  const stats = ScoreUtils.calculateStatistics(filteredScores);
  const hasFilters = searchTerm || filterClass !== 'ALL_CLASSES' || filterSubject !== 'ALL_SUBJECTS';

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Score Management
            {isTeacher && <Badge className="badge-secondary ml-2">Teacher View</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          {error && (
            <Alert className="mb-4 border-red-500 bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500 bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">{success}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <ScoreFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterClass={filterClass}
            onClassChange={setFilterClass}
            filterSubject={filterSubject}
            onSubjectChange={setFilterSubject}
            filterTerm={filterTerm}
            onTermChange={setFilterTerm}
            filterYear={filterYear}
            onYearChange={setFilterYear}
            subjects={subjects}
            onAddScore={() => {
              setShowAddForm(true);
              clearMessages();
            }}
            onClearFilters={handleClearFilters}
          />

          {/* Add/Edit Form */}
          {showAddForm && (
            <>
              {isTeacher && subjects.length === 0 && (
                <Alert className="mb-4 border-yellow-500 bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    You don't have any subjects assigned to your account. Please contact your administrator to assign subjects before adding scores.
                  </AlertDescription>
                </Alert>
              )}
              <ScoreForm
                scoreForm={scoreForm}
                setScoreForm={setScoreForm}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                students={students}
                subjects={subjects}
                loading={loading}
                editingScore={editingScore}
              />
            </>
          )}

          {/* Statistics */}
          <ScoreStatistics stats={stats} />

          {/* Scores List */}
          <ScoreList
            scores={filteredScores}
            students={students}
            subjects={subjects}
            loading={loading && !showAddForm}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canDelete={isAdmin}
            hasFilters={hasFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
}