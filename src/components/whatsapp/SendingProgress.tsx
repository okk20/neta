import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";

interface SendingProgressProps {
  progress: number;
  sentCount: number;
  totalCount: number;
  isVisible: boolean;
}

export function SendingProgress({ progress, sentCount, totalCount, isVisible }: SendingProgressProps) {
  if (!isVisible) return null;

  return (
    <Card className="glass-card">
      <CardContent className="card-compact">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-foreground">Sending Progress</Label>
            <span className="text-xs text-muted-foreground">{sentCount} / {totalCount}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Sending exam summary messages to guardians...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}