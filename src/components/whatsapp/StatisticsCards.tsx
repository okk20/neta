import { Card, CardContent } from "../ui/card";
import { Users, Phone, MessageCircle } from "lucide-react";

interface StatisticsCardsProps {
  totalStudents: number;
  validGuardians: number;
  sentCount: number;
}

export function StatisticsCards({ totalStudents, validGuardians, sentCount }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="glass-card">
        <CardContent className="card-compact text-center">
          <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
          <p className="text-base font-bold text-foreground">{totalStudents}</p>
          <p className="text-xs text-muted-foreground">Total Students</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="card-compact text-center">
          <Phone className="w-6 h-6 mx-auto mb-1 text-green-400" />
          <p className="text-base font-bold text-foreground">{validGuardians}</p>
          <p className="text-xs text-muted-foreground">Valid Guardians</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="card-compact text-center">
          <MessageCircle className="w-6 h-6 mx-auto mb-1 text-blue-400" />
          <p className="text-base font-bold text-foreground">{sentCount}</p>
          <p className="text-xs text-muted-foreground">Messages Sent</p>
        </CardContent>
      </Card>
    </div>
  );
}