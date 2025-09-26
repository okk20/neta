import { AlertCircle } from "lucide-react";

interface DatabaseErrorProps {
  error: string;
}

export function DatabaseError({ error }: DatabaseErrorProps) {
  return (
    <div className="mb-6">
      <div className="glass-card p-4 rounded-xl border-red-500/50 bg-red-900/20 error-glow">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <h3 className="text-red-300 font-semibold">Database Warning</h3>
            <p className="text-red-200 text-sm">{error}</p>
            <p className="text-red-300 text-xs mt-1">
              SEMS will continue to function, but some features may be limited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}