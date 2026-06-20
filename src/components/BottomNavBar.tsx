import { Users, Play, Trophy } from "lucide-react";

interface BottomNavBarProps {
  currentTab: "players" | "game" | "scores";
  setCurrentTab: (tab: "players" | "game" | "scores") => void;
}

export default function BottomNavBar({
  currentTab,
  setCurrentTab,
}: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-5 pt-2 bg-surface-container/95 dark:bg-surface-container-highest/95 backdrop-blur-md shadow-2xl border-t-2 border-outline-variant/60 rounded-t-[32px] transition-colors">
      {/* 1. Joueurs */}
      <button
        onClick={() => setCurrentTab("players")}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
          currentTab === "players"
            ? "bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-6 py-1 transform -rotate-1 scale-105 shadow-md font-bold"
            : "text-on-surface-variant hover:text-secondary"
        }`}
      >
        <Users className="w-6 h-6" />
        <span className="font-label-lg text-xs mt-0.5">Joueurs</span>
      </button>

      {/* 2. Partie */}
      <button
        onClick={() => setCurrentTab("game")}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
          currentTab === "game"
            ? "bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-6 py-1 transform rotate-1 scale-105 shadow-md font-bold"
            : "text-on-surface-variant hover:text-secondary"
        }`}
      >
        <Play className="w-6 h-6" />
        <span className="font-label-lg text-xs mt-0.5">Partie</span>
      </button>

      {/* 3. Scores */}
      <button
        onClick={() => setCurrentTab("scores")}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
          currentTab === "scores"
            ? "bg-primary-container text-on-primary-container dark:bg-primary dark:text-on-primary rounded-full px-6 py-1 transform rotate-1 scale-110 shadow-md font-bold"
            : "text-on-surface-variant hover:text-secondary"
        }`}
      >
        <Trophy className="w-6 h-6" />
        <span className="font-label-lg text-xs mt-0.5">Scores</span>
      </button>
    </nav>
  );
}
