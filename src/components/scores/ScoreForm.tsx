import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Save, Loader2 } from "lucide-react";
import { CLASSES, TERMS, YEARS } from "../../constants/scores";
import { ScoreUtils } from "../../utils/scores";
import type { Student, Subject } from "../../utils/database";

interface ScoreFormProps {
  scoreForm: any;
  setScoreForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  students: Student[];
  subjects: Subject[];
  loading: boolean;
  editingScore: any;
}

export function ScoreForm({ 
  scoreForm, 
  setScoreForm, 
  onSubmit, 
  onCancel, 
  students, 
  subjects, 
  loading, 
  editingScore 
}: ScoreFormProps) {
  return (
    <Card className="glass-card mb-6">
      <CardHeader>
        <CardTitle className="text-foreground">
          {editingScore ? 'Edit Score' : 'Add New Score'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentId" className="text-foreground">Student *</Label>
              <Select 
                value={scoreForm.studentId} 
                onValueChange={(value) => setScoreForm(prev => ({ ...prev, studentId: value }))}
              >
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="glass">
                  {students.filter(s => s.status === 'active').map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subjectId" className="text-foreground">Subject *</Label>
              <Select 
                value={scoreForm.subjectId} 
                onValueChange={(value) => setScoreForm(prev => ({ ...prev, subjectId: value }))}
              >
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="glass">
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term" className="text-foreground">Term *</Label>
              <Select 
                value={scoreForm.term} 
                onValueChange={(value) => setScoreForm(prev => ({ ...prev, term: value }))}
              >
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  {TERMS.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year" className="text-foreground">Year *</Label>
              <Select 
                value={scoreForm.year} 
                onValueChange={(value) => setScoreForm(prev => ({ ...prev, year: value }))}
              >
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  {YEARS.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="classScore" className="text-foreground">Class Score (0-50) *</Label>
              <Input
                id="classScore"
                type="number"
                min="0"
                max="50"
                value={scoreForm.classScore}
                onChange={(e) => setScoreForm(prev => ({ ...prev, classScore: parseInt(e.target.value) || 0 }))}
                className="glass"
                required
              />
            </div>

            <div>
              <Label htmlFor="examScore" className="text-foreground">Exam Score (0-50) *</Label>
              <Input
                id="examScore"
                type="number"
                min="0"
                max="50"
                value={scoreForm.examScore}
                onChange={(e) => setScoreForm(prev => ({ ...prev, examScore: parseInt(e.target.value) || 0 }))}
                className="glass"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="remarks" className="text-foreground">Remarks</Label>
            <Input
              id="remarks"
              value={scoreForm.remarks}
              onChange={(e) => setScoreForm(prev => ({ ...prev, remarks: e.target.value }))}
              className="glass"
              placeholder="Optional remarks about performance"
            />
          </div>

          {/* Score Preview */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h4 className="text-foreground font-semibold mb-2">Score Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Score</p>
                <p className="text-foreground font-bold">{scoreForm.classScore + scoreForm.examScore}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Grade</p>
                <p className="text-foreground font-bold">{ScoreUtils.calculateGrade(scoreForm.classScore + scoreForm.examScore)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Class %</p>
                <p className="text-foreground font-bold">{ScoreUtils.formatPercentage(scoreForm.classScore, 50)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Exam %</p>
                <p className="text-foreground font-bold">{ScoreUtils.formatPercentage(scoreForm.examScore, 50)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingScore ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingScore ? 'Update Score' : 'Add Score'}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="glass"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}