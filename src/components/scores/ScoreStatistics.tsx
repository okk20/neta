import { Card, CardContent } from "../ui/card";
import { ClipboardList, TrendingUp, Trophy, Target } from "lucide-react";
import type { ScoreStatistics } from "../../utils/scores";

interface ScoreStatisticsProps {
  stats: ScoreStatistics;
}

export function ScoreStatistics({ stats }: ScoreStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Scores</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalScores}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Average Score</p>
              <p className="text-2xl font-bold text-green-400">{stats.averageScore}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Grade A Count</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.gradeDistribution.A}</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pass Rate</p>
              <p className="text-2xl font-bold text-blue-400">{stats.passRate}%</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}