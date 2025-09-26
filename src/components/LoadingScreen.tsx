import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-white">
      <div className="text-center">
        <div className="glass-card p-8 rounded-xl max-w-md mx-auto bg-white">
          <div className="loading-glow rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl mb-3 text-foreground">Initializing SEMS</h2>
          <p className="text-muted-foreground text-sm mb-4">
            School Examination Management System is loading...
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Please wait</span>
          </div>
        </div>
      </div>
    </div>
  );
}