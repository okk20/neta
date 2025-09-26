import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { ScoreUtils } from "../../utils/scores";
import type { Score, Student, Subject } from "../../utils/database";

interface ScoreItemProps {
  score: Score;
  students: Student[];
  subjects: Subject[];
  onEdit: (score: Score) => void;
  onDelete: (score: Score) => void;
  canDelete: boolean;
}

export function ScoreItem({ score, students, subjects, onEdit, onDelete, canDelete }: ScoreItemProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="font-semibold text-foreground">
                {ScoreUtils.getStudentName(score.studentId, students)}
              </h3>
              <Badge variant="secondary" className="badge-secondary">
                {ScoreUtils.getStudentClass(score.studentId, students)}
              </Badge>
              <Badge variant="secondary" className="badge-secondary">
                {ScoreUtils.getSubjectName(score.subjectId, subjects)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Term/Year</p>
                <p className="text-foreground font-semibold">{score.term} {score.year}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Class Score</p>
                <p className="text-foreground font-semibold">{score.classScore}/50</p>
              </div>
              <div>
                <p className="text-muted-foreground">Exam Score</p>
                <p className="text-foreground font-semibold">{score.examScore}/50</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-foreground font-bold">{score.totalScore}/100</p>
              </div>
              <div>
                <p className="text-muted-foreground">Grade</p>
                <p className={`font-bold ${ScoreUtils.getGradeColorClass(score.grade)}`}>
                  {score.grade}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Percentage</p>
                <p className="text-foreground font-semibold">{score.totalScore}%</p>
              </div>
            </div>
            {score.remarks && (
              <p className="text-muted-foreground text-sm mt-2">
                <strong>Remarks:</strong> {score.remarks}
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={() => onEdit(score)}
              size="sm"
              variant="outline"
              className="glass"
            >
              <Edit className="w-3 h-3" />
            </Button>
            {canDelete && (
              <Button
                onClick={() => onDelete(score)}
                size="sm"
                variant="outline"
                className="text-red-400 border-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}