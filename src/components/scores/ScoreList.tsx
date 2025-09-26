import { Card, CardContent } from "../ui/card";
import { Loader2, ClipboardList } from "lucide-react";
import { ScoreItem } from "./ScoreItem";
import type { Score, Student, Subject } from "../../utils/database";

interface ScoreListProps {
  scores: Score[];
  students: Student[];
  subjects: Subject[];
  loading: boolean;
  onEdit: (score: Score) => void;
  onDelete: (score: Score) => void;
  canDelete: boolean;
  hasFilters: boolean;
}

export function ScoreList({ 
  scores, 
  students, 
  subjects, 
  loading, 
  onEdit, 
  onDelete, 
  canDelete,
  hasFilters 
}: ScoreListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading scores...</p>
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-12">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Scores Found</h3>
          <p className="text-muted-foreground mb-4">
            {hasFilters ? 'No scores match your search criteria.' : 'Start by adding your first score.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scores.map((score) => (
        <ScoreItem
          key={score.id}
          score={score}
          students={students}
          subjects={subjects}
          onEdit={onEdit}
          onDelete={onDelete}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}