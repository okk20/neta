import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { ExamSummary } from "../../utils/whatsapp";
import { generateMessage } from "../../utils/whatsapp";

interface MessagePreviewProps {
  summaries: ExamSummary[];
  messageTemplate: string;
  maxPreview?: number;
}

export function MessagePreview({ summaries, messageTemplate, maxPreview = 3 }: MessagePreviewProps) {
  if (summaries.length === 0) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="card-compact-header">
        <CardTitle className="text-foreground text-sm">
          Preview Messages ({summaries.length} recipients)
        </CardTitle>
      </CardHeader>
      <CardContent className="card-compact">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {summaries.slice(0, maxPreview).map((summary) => (
            <div key={summary.studentId} className="p-2 bg-secondary/20 rounded text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{summary.guardianName}</span>
                <Badge variant="secondary" className="text-xs">{summary.guardianPhone}</Badge>
                <Badge variant="secondary" className="text-xs">{summary.studentName}</Badge>
              </div>
              <div className="text-muted-foreground line-clamp-3">
                {generateMessage(summary, messageTemplate).substring(0, 150)}...
              </div>
            </div>
          ))}
          {summaries.length > maxPreview && (
            <p className="text-xs text-muted-foreground text-center">
              And {summaries.length - maxPreview} more messages...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}