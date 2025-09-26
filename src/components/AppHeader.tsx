import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { getGreeting, getSectionTitle } from "../constants/app";
import type { User } from "../utils/database";

interface AppHeaderProps {
  currentUser?: User | null;
  activeSection: string;
  onLogout: () => void;
}

export function AppHeader({ currentUser, activeSection, onLogout }: AppHeaderProps) {
  const displayName = currentUser?.username || 'Guest';
  const displayRole = currentUser?.role || 'guest';
  return (
    <div className="mb-6">
      <div className="glass-card p-4 rounded-xl bg-white">
        <div className="flex items-center justify-between">
          <div className="greeting-animate">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {getGreeting()}, {displayName}! 👋
                </h1>
                <p className="text-muted-foreground text-sm">
                  {getSectionTitle(activeSection, displayRole)}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <p className="text-foreground text-sm font-semibold">
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-muted-foreground text-xs">
                {new Date().toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white shadow-lg btn-compact"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}