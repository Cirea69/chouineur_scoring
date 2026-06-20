import { Sparkles, Settings, Users, Laptop } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Theme } from "../types";

interface TopAppBarProps {
  roundName: string;
  theme: Theme;
  toggleTheme: () => void;
  openSettings: () => void;
  multiplayerMode: "local" | "simulated";
}

export default function TopAppBar({
  roundName,
  theme,
  toggleTheme,
  openSettings,
  multiplayerMode,
}: TopAppBarProps) {
  return (
    <header className="w-full top-0 border-b-2 border-tertiary-container dark:border-surface-variant bg-background/95 dark:bg-surface-container-low/95 backdrop-blur-xs sticky z-40 transition-colors">
      <div className="flex justify-between items-center px-margin-mobile py-2 w-full max-w-7xl mx-auto">
        {/* Left Option */}
        <div className="flex items-center gap-2">
          <div className="p-2 text-primary dark:text-primary-fixed-dim bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-label-md text-xs uppercase tracking-wider hidden sm:inline-block font-bold text-on-surface-variant flex items-center gap-1">
            {multiplayerMode === "local" ? (
              <>
                <Laptop className="w-3 h-3 text-secondary" />
                Local Pass-and-Play
              </>
            ) : (
              <>
                <Users className="w-3 h-3 text-tertiary animate-bounce" />
                Simulateur en ligne
              </>
            )}
          </span>
        </div>

        {/* Center Title */}
        <h1 className="font-headline-md text-headline-sm sm:text-headline-md text-primary dark:text-primary-fixed-dim transition-colors italic">
          {roundName}
        </h1>

        {/* Right Options */}
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={openSettings}
            className="p-2 text-primary hover:bg-black/5 dark:hover:bg-white/10 dark:text-primary-fixed-dim transition-colors rounded-full active:rotate-12 active:scale-95 duration-150 flex items-center justify-center cursor-pointer"
            title="Options du jeu"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
