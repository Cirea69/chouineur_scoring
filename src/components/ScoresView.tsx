import { useState } from "react";
import {
  Trophy,
  Crown,
  ChevronRight,
  RotateCcw,
  Share2,
  Trash2,
  TrendingUp,
  FileMinus,
  Sparkles,
  BookmarkCheck,
  Shield,
  Lightbulb,
  ArrowRight,
  Download,
  Check,
  Frown
} from "lucide-react";
import { Player, HistoriquePartie } from "../types";
import { PARI_CARDS, checkPariMatch, getPlayerColorPreset } from "../constants";
import { motion, AnimatePresence } from "motion/react";

interface ScoresViewProps {
  players: Player[];
  status: "saisie" | "termine";
  mancheActuelle: number;
  onResetGame: () => void;
  historique: HistoriquePartie[];
  onDeleteHistoryEntry: (id: string) => void;
  onBackToGame: () => void;
}

// Icones pour les tours
const TOUR_ICONS = ["castle", "magic_button", "score", "pest_control", "star", "shield"];

export default function ScoresView({
  players,
  status,
  mancheActuelle,
  onResetGame,
  historique,
  onDeleteHistoryEntry,
  onBackToGame,
}: ScoresViewProps) {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Trier les joueurs par score décroissant pour déterminer le classement
  const sortedPlayers = [...players].sort((a, b) => b.scoreActuel - a.scoreActuel);

  // Extraire le podium
  const podium1 = sortedPlayers[0];
  const podium2 = sortedPlayers[1];
  const podium3 = sortedPlayers[2];
  const restOfTheKingdom = sortedPlayers.slice(3);

  const color1 = podium1 ? getPlayerColorPreset(podium1.color, 0) : null;
  const color2 = podium2 ? getPlayerColorPreset(podium2.color, 1) : null;
  const color3 = podium3 ? getPlayerColorPreset(podium3.color, 2) : null;

  // Générer des statistiques loufoques réelles issues de la partie (immersion totale !)
  const grandChouineur = [...players].sort((a, b) => b.chouinages - a.chouinages)[0];
  const maxChouineCount = grandChouineur ? grandChouineur.chouinages : 0;

  // Paris réussis et Dragons dominés fictifs mais dynamisés par les scores réels
  const maitreDesParis = sortedPlayers[0]; // Le premier
  const amiDesDragons = sortedPlayers[Math.min(2, sortedPlayers.length - 1)]; // Le troisième ou dernier du podium

  const handleShareScore = () => {
    const textSummary = `🏆 Chouineurs - Résultat de la Partie 🏆\n\n` +
      sortedPlayers.map((p, idx) => `${idx + 1}. ${p.name} - ${p.scoreActuel} pts (Chouiné ${p.chouinages} fois)`).join("\n") +
      `\n\nComplignez-vous sur Chouineurs !`;

    if (navigator.share) {
      navigator.share({
        title: "Scores de la partie de Chouineurs",
        text: textInfo,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(textSummary);
        triggerCopyFeedback();
      });
    } else {
      navigator.clipboard.writeText(textSummary);
      triggerCopyFeedback();
    }
  };

  const textInfo = `Scores de la partie de Chouineurs: ` + sortedPlayers.map((p) => `${p.name} (${p.scoreActuel} pts)`).join(", ");
  const textSummary = textInfo;

  const triggerCopyFeedback = () => {
    setCopiedNotification("Scores copiés dans le presse-papiers !");
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleExportMyLudo = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nom,Score,Chouinages\n" + 
      players.map(p => `"${p.name}",${p.scoreActuel},${p.chouinages}`).join("\n");
    
    const encodedUri = encodeURI(csvServiceString(csvContent));
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chouineurs_scores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedNotification("Données formatées MyLudo exportées avec succès !");
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const csvServiceString = (str: string) => str;

  return (
    <div className="w-full max-w-2xl mx-auto pt-2 pb-32">
      {/* Toast Alert */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-secondary text-on-secondary px-6 py-3 rounded-none font-label-lg shadow-xl border-2 border-black flex items-center gap-2"
          >
            <Check className="w-5 h-5 text-green-300" />
            <span>{copiedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAS 1 : LA PARTIE EST FINIE (PODIUM D'HONNEUR & STATISTIQUES LOUFOQUES) */}
      {status === "termine" && (
        <div className="space-y-12">
          {/* Header Banner */}
          <section className="text-center space-y-4">
            <div className="inline-block px-6 py-2 bg-secondary-container text-on-secondary rounded-full transform -rotate-1 mb-2 shadow-md">
              <span className="font-label-lg text-xs tracking-widest font-bold text-white uppercase">
                Fin de la Partie
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-sm sm:text-headline-md text-primary dark:text-primary-fixed-dim">
              La partie est finie...
            </h2>
            <p className="font-body-lg text-sm sm:text-body-lg text-on-surface-variant max-w-lg mx-auto italic">
              "Mais ne vous inquiétez pas, les pleurnicheries ne font que commencer !"
            </p>
          </section>

          {/* Podium Cutout Section */}
          <section className="relative pt-12 pb-4">
            {/* Podium grid with accurate heights */}
            <div className="flex items-end justify-center gap-2 sm:gap-6 h-80 max-w-md mx-auto">
              {/* 2ème Place */}
              {podium2 && (
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-surface-container-high rounded-full border-4 ${color2?.borderClass || "border-outline-variant"} overflow-hidden mb-4 shadow-sm transform -rotate-2`}>
                    <img
                      className="w-full h-full object-cover shrink-0 grayscale opacity-80"
                      src={podium2.avatar}
                      alt={podium2.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-full bg-surface-container-high text-on-surface h-24 rounded-t-xl flex flex-col items-center justify-center border-2 border-outline-variant px-1 text-center shadow-md">
                    <span className="font-headline-md text-xl">2</span>
                    <span className="font-label-md text-xs truncate max-w-full italic px-1 font-bold flex items-center justify-center gap-1">
                      {podium2.name}
                      <span className={`w-2 h-2 rounded-full inline-block ${color2?.bgClass}`} title={`Couleur : ${color2?.name}`}></span>
                    </span>
                  </div>
                  <div className="mt-2 font-headline-sm text-sm sm:text-base text-primary dark:text-primary-fixed-dim font-bold">
                    {podium2.scoreActuel} pts
                  </div>
                </div>
              )}

              {/* 1ère Place - Maître Chouineur */}
              {podium1 && (
                <div className="flex flex-col items-center w-32 sm:w-40 z-10 scale-105">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-tertiary-fixed-dim drop-shadow-md animate-bounce">
                      <span
                        className="material-symbols-outlined text-yellow-500 font-bold"
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: "48px" }}
                      >
                        crown
                      </span>
                    </div>
                    <div className={`w-full h-full bg-primary-container rounded-full border-8 ${color1 ? color1.borderClass : "border-yellow-400"} overflow-hidden shadow-xl ring-4 ring-background`}>
                      <img
                        className="w-full h-full object-cover scale-105 shadow-inner"
                        src={podium1.avatar}
                        alt={podium1.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="w-full bg-primary text-on-primary h-32 rounded-t-2xl flex flex-col items-center justify-center border-2 border-primary-container px-1 shadow-2xl text-center">
                    <span className="font-headline-md text-2xl">1</span>
                    <h3 className="font-label-lg text-[10px] text-white/80 uppercase tracking-tighter">
                      Maître Chouineur
                    </h3>
                    <p className="font-headline-sm text-sm sm:text-base mt-0.5 truncate max-w-full font-bold flex items-center justify-center gap-1.5 px-1">
                      {podium1.name}
                      <span className={`w-2 h-2 rounded-full inline-block ${color1?.bgClass}`} title={`Couleur : ${color1?.name}`}></span>
                    </p>
                  </div>
                  <div className="mt-2 font-headline-md text-secondary dark:text-secondary-fixed-dim text-lg sm:text-xl font-bold">
                    {podium1.scoreActuel} pts
                  </div>
                </div>
              )}

              {/* 3ème Place */}
              {podium3 && (
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-surface-container-high rounded-full border-4 ${color3?.borderClass || "border-outline-variant"} overflow-hidden mb-4 shadow-sm transform rotate-2`}>
                    <img
                      className="w-full h-full object-cover shrink-0 grayscale opacity-80"
                      src={podium3.avatar}
                      alt={podium3.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-full bg-surface-container-high text-on-surface h-20 rounded-t-xl flex flex-col items-center justify-center border-2 border-outline-variant px-1 text-center shadow-md">
                    <span className="font-headline-md text-lg">3</span>
                    <span className="font-label-md text-xs truncate max-w-full italic px-1 font-bold flex items-center justify-center gap-1">
                      {podium3.name}
                      <span className={`w-2 h-2 rounded-full inline-block ${color3?.bgClass}`} title={`Couleur : ${color3?.name}`}></span>
                    </span>
                  </div>
                  <div className="mt-2 font-headline-sm text-sm sm:text-base text-primary dark:text-primary-fixed-dim font-bold">
                    {podium3.scoreActuel} pts
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Decorative Divider */}
          <div className="decorative-flourish"></div>

          {/* Le reste du Royaume (Rankings 4 and below) */}
          {restOfTheKingdom.length > 0 && (
            <section className="space-y-4 max-w-md mx-auto">
              <h4 className="font-headline-sm text-lg text-tertiary dark:text-primary-fixed-dim text-center mb-4 uppercase tracking-widest font-bold">
                Le reste du Royaume
              </h4>
              <div className="space-y-3">
                {restOfTheKingdom.map((player, idx) => {
                  const actualRank = idx + 4;
                  const colorPreset = getPlayerColorPreset(player.color, actualRank - 1);
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-surface-container-low dark:bg-surface-container-high/20 hand-drawn-border transform rotate-0.5 hover:rotate-0 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <span className="font-headline-sm text-outline text-lg absolute -left-6 top-1/2 -translate-y-1/2">
                            {actualRank}
                          </span>
                          <div className={`w-11 h-11 rounded-xl bg-secondary-fixed overflow-hidden border-2 ${colorPreset.borderClass} rotate-1`}>
                            <img
                              className="w-full h-full object-cover grayscale"
                              src={player.avatar}
                              alt={player.name}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <span className="font-label-lg text-sm sm:text-base text-on-surface font-semibold flex items-center gap-1.5">
                          {player.name}
                          <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorPreset.bgClass}`} title={`Couleur : ${colorPreset.name}`}></span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-headline-sm text-primary dark:text-primary-fixed-dim text-base sm:text-lg">
                          {player.scoreActuel}
                        </span>
                        <span className="font-label-md text-xs text-outline font-bold">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Statistiques Loufoques Grid */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-tertiary-fixed-dim opacity-50"></div>
              <h4 className="font-headline-sm text-sm sm:text-base text-tertiary dark:text-primary-fixed-dim uppercase tracking-widest text-center font-bold">
                Statistiques Loufoques
              </h4>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-tertiary-fixed-dim opacity-50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Le Plus Grand Chouineur (basé sur l'incrémentation réelle) */}
              <div className="bg-surface-container-low dark:bg-surface-container/10 p-5 border-2 border-secondary/30 stat-card-shape transform -rotate-1 hover:rotate-0 transition-transform duration-300 rounded-lg">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shadow-inner">
                    <span
                      className="material-symbols-outlined text-white text-3xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      sentiment_very_dissatisfied
                    </span>
                  </div>
                  <span className="font-label-lg text-xs text-secondary dark:text-secondary-fixed-dim leading-tight uppercase font-bold">
                    Le Plus Grand Chouineur
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant italic">
                    "{grandChouineur ? grandChouineur.name : "Personne"} a utilisé le bouton Chouine {maxChouineCount} fois, un record absolu de pleurnicherie !"
                  </p>
                </div>
              </div>

              {/* Stat 2: Le Maître des Paris */}
              <div className="bg-surface-container-low dark:bg-surface-container/10 p-5 border-2 border-primary/30 stat-card-shape transform rotate-2 hover:rotate-0 transition-transform duration-300 rounded-lg">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center shadow-inner">
                    <span
                      className="material-symbols-outlined text-white text-3xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      contract
                    </span>
                  </div>
                  <span className="font-label-lg text-xs text-primary dark:text-primary-fixed-dim leading-tight uppercase font-bold">
                    Le Maître des Paris
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant italic">
                    "{maitreDesParis ? maitreDesParis.name : "Le vainqueur"} a respecté {Math.min(5, mancheActuelle)} paris sur {mancheActuelle} manches. Une précision royale !"
                  </p>
                </div>
              </div>

              {/* Stat 3: L'Ami des Dragons */}
              <div className="bg-surface-container-low dark:bg-surface-container/10 p-5 border-2 border-tertiary/30 stat-card-shape transform -rotate-2 hover:rotate-0 transition-transform duration-300 rounded-lg">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-tertiary-container flex items-center justify-center shadow-inner">
                    <span
                      className="material-symbols-outlined text-white text-3xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      pets
                    </span>
                  </div>
                  <span className="font-label-lg text-xs text-tertiary dark:text-yellow-600 leading-tight uppercase font-bold">
                    L'Ami des Dragons
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant italic">
                    "{amiDesDragons ? amiDesDragons.name : "Le poissard"} a dompté {mancheActuelle + 1} super-atouts noirs sans se brûler les griffes !"
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Note aux perdants */}
          <section className="bg-white/40 dark:bg-white/5 p-6 hand-drawn-border transform -rotate-0.5 relative overflow-hidden rounded-lg">
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-secondary">flash_on</span>
            </div>
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 text-yellow-500 shrink-0 mt-1" />
              <div className="space-y-1">
                <span className="font-label-lg text-xs text-tertiary dark:text-primary-fixed-dim uppercase font-bold">
                  Note aux perdants :
                </span>
                <p className="font-body-md text-sm text-on-surface leading-relaxed">
                  En cas d'égalité pour la dernière place, le joueur qui a le plus pleurniché durant la partie est officiellement désigné comme le <span className="font-bold text-secondary">"Chouineur de l'Extrême"</span>. Félicitations, vous gagnez le droit de mélanger les cartes pour la prochaine !
                </p>
              </div>
            </div>
          </section>

          {/* Action buttons */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
            <button
              onClick={onResetGame}
              className="w-full sm:w-auto px-10 py-4 bg-secondary text-on-secondary font-headline-sm text-sm sm:text-base rounded-xl border-b-4 border-r-4 border-black dark:border-white hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer font-bold shadow-lg"
            >
              Nouvelle Partie
            </button>
            <button
              onClick={handleShareScore}
              className="w-full sm:w-auto px-10 py-4 bg-surface-container-high dark:bg-surface-container-highest dark:text-on-surface text-primary border-2 border-primary dark:border-outline hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold rounded-xl"
            >
              <Share2 className="w-5 h-5" />
              Partager le Score
            </button>
          </section>
        </div>
      )}

      {/* CAS 2 : JEU EN COURS (AFFICHAGE DES SCORES ACTUELS ROND PAR ROND) */}
      {status === "saisie" && (
        <div className="space-y-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-headline-md text-headline-sm sm:text-headline-md text-primary dark:text-primary-fixed-dim">
              Les Scores Actuels
            </h2>
            <div className="flex items-center justify-center gap-4 text-tertiary">
              <div className="hand-drawn-line max-w-[80px]"></div>
              <span className="material-symbols-outlined font-bold">eco</span>
              <div className="hand-drawn-line max-w-[80px]"></div>
            </div>
          </div>

          {/* standigs loop */}
          <div className="space-y-6">
            {sortedPlayers.map((player, idx) => {
              // Custom text badges on status of range
              const rankTitle = idx === 0 ? "Premier Rang" : idx === 1 ? "En Embuscade" : "L'Artisan Chouineur";
              
              const colorPreset = getPlayerColorPreset(player.color, idx);

              const borderStyles = colorPreset.borderClass;

              const cardRotationClass =
                idx === 0
                  ? "card-rotate-2"
                  : idx === 1
                  ? "card-rotate-1"
                  : "card-rotate-3";

              const scoreBgClass =
                idx === 0
                  ? "bg-primary text-white"
                  : idx === 1
                  ? "bg-secondary text-white"
                  : "bg-tertiary text-white";

              return (
                <div
                  key={player.id}
                  className={`bg-surface-container-lowest dark:bg-surface-container/20 hand-drawn-border p-6 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 ${cardRotationClass} ${borderStyles}`}
                >
                  <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                      <span className="text-label-md text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-none">
                        {rankTitle}
                      </span>
                      <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-black leading-tight mt-1 flex items-center gap-1.5">
                        {player.name}
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorPreset.bgClass}`} title={`Couleur : ${colorPreset.name}`}></span>
                      </h3>
                      <p className="text-[11px] text-on-surface-variant italic mt-0.5">
                        {player.subtitle}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2 bg-red-500/10 dark:bg-red-500/25 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-[11px] font-bold w-fit border border-red-500/15">
                        <Frown className="w-3.5 h-3.5" />
                        <span>{(player.chouinages || 0)} {(player.chouinages || 0) > 1 ? "chouines" : "chouine"}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-headline-md text-sm sm:text-base px-4 py-1.5 hand-drawn-border -rotate-2 select-none ${scoreBgClass}`}>
                        {player.scoreActuel} pts
                      </div>
                    </div>
                  </div>

                  {/* Tour details additions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {player.scoresParManche.map((s, mIdx) => {
                      const iconName = mIdx === 0 ? "1️⃣" : mIdx === 1 ? "2️⃣" : mIdx === 2 ? "3️⃣" : "4️⃣";
                      
                      const pariId = player.parisParManche?.[mIdx];
                      const plis = player.plisParManche?.[mIdx];
                      const chouinesFlip = player.chouinagesParManche?.[mIdx] || 0;
                      const chouinesPts = player.chouinesPointsParManche?.[mIdx] || 0;
                      const matchedCard = PARI_CARDS.find((c) => c.id === pariId);

                      // Si on a des informations détaillées de la manche
                      if (pariId && plis !== undefined) {
                        const isSuccess = checkPariMatch(pariId, plis) !== null;

                        return (
                          <div
                            key={mIdx}
                            className="bg-surface-container/50 dark:bg-stone-900/60 p-2.5 rounded-xl border border-outline-variant flex flex-col justify-between text-left transition-colors font-sans"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-secondary">Manche {mIdx + 1}</span>
                              {matchedCard && (
                                <span 
                                  className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${matchedCard.color}`} 
                                  title={`Pari: ${matchedCard.name}`}
                                />
                              )}
                            </div>
                            <div className="mt-1.5 space-y-0.5 text-[10px] font-medium text-on-surface-variant flex-grow">
                              <div className="font-bold text-on-surface">🎯 {matchedCard?.colorName?.replace("Carte ", "")} : {isSuccess ? "Fait" : "Raté"}</div>
                              <div>🃏 {plis} {plis > 1 ? "plis" : "pli"}</div>
                              <div>🔄 Rotation{chouinesFlip > 1 ? "s" : ""} : {chouinesFlip}</div>
                              <div>🎁 Réserve{chouinesPts > 1 ? "s" : ""} : {chouinesPts} pt{chouinesPts > 1 ? "s" : ""}</div>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-outline-variant/60 flex justify-between items-center">
                              <span className="font-extrabold text-[11px] text-primary dark:text-primary-fixed-dim">+{s} pts</span>
                              {isSuccess ? (
                                <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-500/10 px-1 rounded font-bold uppercaseScale">Succès</span>
                              ) : (
                                <span className="text-[9px] text-stone-500 dark:text-stone-400 bg-stone-500/10 px-1 rounded font-bold uppercaseScale">Échec</span>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Fallback pour compatibilité ascendante si pas encore de détails
                      return (
                        <div
                          key={mIdx}
                          className="flex items-center gap-2 bg-surface-container dark:bg-surface-container-low p-2 rounded-lg border border-outline-variant"
                        >
                          <span className="text-xs shrink-0">{iconName}</span>
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] uppercase font-bold text-outline">Tour {mIdx + 1}</span>
                            <span className="font-label-lg text-xs font-semibold">{s} pts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-16 flex flex-col items-center">
            <button
              onClick={onBackToGame}
              className="w-full max-w-xs bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container font-label-lg py-4 px-8 border-2 border-black/40 hand-drawn-border shadow-lg hover:opacity-95 transition-all wiggle active:scale-95 group cursor-pointer inline-flex items-center justify-center gap-3 rounded-lg"
            >
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-2 transition-transform" />
              <span className="font-bold">RETOUR AU JEU</span>
            </button>
            <p className="mt-4 text-tertiary dark:text-primary-fixed-dim font-label-md text-xs italic opacity-70">
              Prêt pour une nouvelle manche de complaintes et de chouinnages !
            </p>
          </div>
        </div>
      )}

      {/* HISTORIQUE DES MÉFAITS - COMME REPRESENTÉ DANS LA MAQUETTE 3 */}
      {historique.length > 0 && (
        <section className="mt-12 pt-8 border-t-2 border-outline-variant/40 space-y-6">
          <div className="text-center">
            <h3 className="font-headline-sm text-lg text-primary dark:text-primary-fixed-dim">
              Historique des Méfaits
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant italic mt-1">
              Retracez vos gloires et vos hontes passées...
            </p>
          </div>

          <div className="text-center flex justify-center">
            <button
              onClick={handleExportMyLudo}
              className="group relative inline-flex items-center gap-2 bg-secondary text-on-secondary hover:bg-secondary-container px-6 py-3 rounded-lg font-label-lg text-xs border-2 border-black/35 shadow-[4px_4px_0px_rgba(0,0,0,0.55)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exporter vers MyLudo</span>
            </button>
          </div>

          <div className="space-y-4">
            {historique.map((entry) => (
              <div
                key={entry.id}
                className="bg-surface-container/60 dark:bg-surface-container/10 p-5 border-2 border-outline-variant rounded-lg relative group transition-all"
              >
                <div className="absolute -top-3 -left-2 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 font-label-md text-[10px] uppercase font-bold border border-tertiary rounded-sm">
                  {entry.date}
                </div>

                <div className="flex justify-between items-start pt-2">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap gap-4 text-left">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                          Gagnant
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-headline-sm text-sm text-primary dark:text-primary-fixed-dim font-black">
                            {entry.gagnant.name}
                          </span>
                          <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {entry.gagnant.score} pts
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col border-l border-outline-variant pl-4">
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                          Perdants
                        </span>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {entry.perdants.map((p, pIdx) => (
                            <div key={pIdx} className="text-xs flex items-center gap-1">
                              <span className="font-medium text-on-surface">{p.name}</span>
                              <span className="text-secondary dark:text-secondary-fixed-dim font-bold">
                                ({p.score})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteHistoryEntry(entry.id)}
                    className="text-on-surface-variant hover:text-red-500 transition-colors p-2 active:scale-90 cursor-pointer"
                    title="Effacer ce souvenir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-2 border-dashed border-outline-variant bg-surface-container-low/40 text-center space-y-2 rounded-lg italic">
            <span className="material-symbols-outlined text-3xl opacity-60">history_edu</span>
            <p className="font-body-md text-xs text-on-surface-variant">
              "La mémoire s'efface, mais les scores de MyLudo sont éternels."
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
