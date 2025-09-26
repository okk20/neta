interface StatusIndicatorProps {
  isDbInitialized: boolean;
  dbError: string | null;
}

export function StatusIndicator({ isDbInitialized, dbError }: StatusIndicatorProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="glass-card p-3 rounded-lg shadow-lg bg-white">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isDbInitialized && !dbError ? 'bg-green-500' : 
            dbError ? 'bg-yellow-500' : 'bg-red-500'
          } ${isDbInitialized ? '' : 'animate-pulse'}`}></div>
          <span className="text-xs text-foreground">
            {isDbInitialized && !dbError ? 'System Online' : 
             dbError ? 'Limited Mode' : 'Initializing...'}
          </span>
        </div>
      </div>
    </div>
  );
}