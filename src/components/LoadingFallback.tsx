import { Circle } from "lucide-react";

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center">
        <Circle className="w-8 h-8 animate-spin text-blue-500" />
        <p className="mt-2 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}