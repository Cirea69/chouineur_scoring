import { useState, useEffect } from "react";
import { CheckCircle, Frown, Sparkles, Info, Plus, Minus, ChevronDown, ChevronUp, Trophy, HelpCircle } from "lucide-react";
import { Player } from "../types";
import { PARI_CARDS, checkPariMatch, getPlayerColorPreset } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import PariCardVisual from "./PariCardVisual";

interface PartieViewProps {
  players: Player[];
  mancheActuelle: number;
  onValiderManche: (roundData: {
    [playerId: string]: {
      plis: number;
      pariCardId: string;
      chouinesFlipping: number;
      chouinesPoints: number;
      pariPoints: number;
      isPariSuccess: boolean;
      totalScore: number;
    }
  }) => void;
  onResetGame?: () => void;
  isGM?: boolean;
  multiplayerMode?: string;
}

export default function PartieView({
  players,
  mancheActuelle,
  onValiderManche,
  onResetGame,
  isGM = true,
  multiplayerMode = "local",
}: PartieViewProps) {
  const isReadOnly = multiplayerMode === "multiplayer" && !isGM;

  const getFirstAvailableCard = (player: Player) => {
    const valides = player.parissValides || [];
    const available = PARI_CARDS.filter((c) => !valides.includes(c.id));
    return available.length > 0 ? available[0].id : PARI_CARDS[0].id;
  };

  // State to track which players are expanded
  // By default, expand the first player, collapse others to save space
  const [expandedPlayers, setExpandedPlayers] = useState<{ [playerId: string]: boolean }>(() => {
    const initial: { [playerId: string]: boolean } = {};
    players.forEach((p, idx) => {
      initial[p.id] = idx === 0; // Only first player is expanded on load
    });
    return initial;
  });

  // State to track expanded sub-sections per player: 'pari', 'plis', 'chouines'
  const [expandedSections, setExpandedSections] = useState<{
    [playerId: string]: { pari: boolean; plis: boolean; chouines: boolean };
  }>(() => {
    const initial: { [playerId: string]: { pari: boolean; plis: boolean; chouines: boolean } } = {};
    players.forEach((p) => {
      initial[p.id] = { pari: true, plis: true, chouines: true }; // All open by default inside expanded player, can be toggled
    });
    return initial;
  });

  // State to track step in score input (1/ choix du pari, 2/ plis & chouines)
  const [activePart, setActivePart] = useState<1 | 2>(1);

  // Help info box toggle state for simplified chouines
  const [helpOpen, setHelpOpen] = useState<{
    [playerId: string]: { tactique: boolean; bonus: boolean };
  }>({});

  const toggleHelpOpen = (playerId: string, type: "tactique" | "bonus") => {
    setHelpOpen((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [type]: !prev[playerId]?.[type],
      },
    }));
  };

  // 1. Pari Card selected per player
  const [selectedPari, setSelectedPari] = useState<{ [playerId: string]: string }>(() => {
    const initial: { [playerId: string]: string } = {};
    players.forEach((p) => {
      initial[p.id] = getFirstAvailableCard(p);
    });
    return initial;
  });

  // 2. Plis count per player (0 to 7) - starts at 0 for all players
  const [plisCount, setPlisCount] = useState<{ [playerId: string]: number }>(() => {
    const initial: { [playerId: string]: number } = {};
    players.forEach((p) => {
      initial[p.id] = 0;
    });
    return initial;
  });

  // 3a. Chouines de retournement de carte (0 point)
  const [activeFlippingChouines, setActiveFlippingChouines] = useState<{ [playerId: string]: number }>(() => {
    const initial: { [playerId: string]: number } = {};
    players.forEach((p) => {
      initial[p.id] = 0;
    });
    return initial;
  });

  // 3b. Chouines de points (cartes de réserve, +1 point)
  const [activePointsChouines, setActivePointsChouines] = useState<{ [playerId: string]: number }>(() => {
    const initial: { [playerId: string]: number } = {};
    players.forEach((p) => {
      initial[p.id] = 0;
    });
    return initial;
  });

  // Déclencher la réinitialisation automatique en cas de nouvelle partie ou de changement de manche
  const resetTrigger = `${mancheActuelle}_${players.map((p) => `${p.id}:${p.scoreActuel}:${(p.scoresParManche || []).length}`).join(",")}`;

  useEffect(() => {
    const resetPari: { [playerId: string]: string } = {};
    const resetPlis: { [playerId: string]: number } = {};
    const resetFlipping: { [playerId: string]: number } = {};
    const resetPoints: { [playerId: string]: number } = {};

    players.forEach((p) => {
      resetPari[p.id] = getFirstAvailableCard(p);
      resetPlis[p.id] = 0; // Remettre à zéro les plis de la manche
      resetFlipping[p.id] = 0;
      resetPoints[p.id] = 0;
    });

    setSelectedPari(resetPari);
    setPlisCount(resetPlis);
    setActiveFlippingChouines(resetFlipping);
    setActivePointsChouines(resetPoints);
    setActivePart(1); // Retour à la première partie (cartes paris) lors des changements de manche
  }, [resetTrigger]);

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  const toggleSection = (playerId: string, section: "pari" | "plis" | "chouines") => {
    setExpandedSections((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [section]: !prev[playerId][section],
      },
    }));
  };

  const handlePariChange = (playerId: string, cardId: string) => {
    if (isReadOnly) return;
    setSelectedPari((prev) => ({
      ...prev,
      [playerId]: cardId,
    }));
  };

  const handlePlisSelect = (playerId: string, val: number) => {
    if (isReadOnly) return;
    setPlisCount((prev) => ({
      ...prev,
      [playerId]: val,
    }));
  };

  const handleIncrementFlipping = (playerId: string) => {
    if (isReadOnly) return;
    setActiveFlippingChouines((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + 1,
    }));
  };

  const handleDecrementFlipping = (playerId: string) => {
    if (isReadOnly) return;
    setActiveFlippingChouines((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) - 1),
    }));
  };

  const handleIncrementPoints = (playerId: string) => {
    if (isReadOnly) return;
    setActivePointsChouines((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + 1,
    }));
  };

  const handleDecrementPoints = (playerId: string) => {
    if (isReadOnly) return;
    setActivePointsChouines((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) - 1),
    }));
  };

  const handleSubmit = () => {
    let totalPlisSaisis = 0;
    players.forEach((p) => {
      totalPlisSaisis += plisCount[p.id];
    });

    const maxAllowedPlis = 7;
    
    if (totalPlisSaisis !== maxAllowedPlis) {
      if (!confirm(`Attention : Le total de vos plis saisis est de ${totalPlisSaisis}, mais une manche de Chouine comporte exactement ${maxAllowedPlis} plis à répartir. Voulez-vous tout de même valider ?`)) {
        return;
      }
    }

    const roundData: {
      [playerId: string]: {
        plis: number;
        pariCardId: string;
        chouinesFlipping: number;
        chouinesPoints: number;
        pariPoints: number;
        isPariSuccess: boolean;
        totalScore: number;
      };
    } = {};

    players.forEach((p) => {
      const cardId = selectedPari[p.id];
      const countPlis = plisCount[p.id];
      const countFlipping = activeFlippingChouines[p.id] || 0;
      const countPoints = activePointsChouines[p.id] || 0;

      const matchedBet = checkPariMatch(cardId, countPlis);
      const pariPoints = matchedBet ? matchedBet.points : 0;
      const isPariSuccess = matchedBet !== null;
      const totalScore = pariPoints + countPoints;

      roundData[p.id] = {
        plis: countPlis,
        pariCardId: cardId,
        chouinesFlipping: countFlipping,
        chouinesPoints: countPoints,
        pariPoints,
        isPariSuccess,
        totalScore,
      };
    });

    onValiderManche(roundData);

    // Réinitialiser les états
    const resetPari: { [playerId: string]: string } = {};
    const resetPlis: { [playerId: string]: number } = {};
    const resetFlipping: { [playerId: string]: number } = {};
    const resetPoints: { [playerId: string]: number } = {};

    players.forEach((p) => {
      resetPari[p.id] = getFirstAvailableCard(p);
      resetPlis[p.id] = 1;
      resetFlipping[p.id] = 0;
      resetPoints[p.id] = 0;
    });

    setSelectedPari(resetPari);
    setPlisCount(resetPlis);
    setActiveFlippingChouines(resetFlipping);
    setActivePointsChouines(resetPoints);
    setActivePart(1);
  };

  // Compute stats for summary banner
  let sumPlis = 0;
  players.forEach((p) => {
    sumPlis += plisCount[p.id];
  });

  return (
    <div className="w-full max-w-2xl mx-auto pt-2 pb-32 px-2 sm:px-4">
      {/* Saisie des Scores Banner Header */}
      <div className="mb-6 rotate-card-1 bg-surface-container-low dark:bg-surface-container-high/30 p-5 hand-drawn-border rounded-xl transition-colors flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <span className="font-label-lg text-xs leading-none text-secondary dark:text-secondary-fixed-dim uppercase tracking-widest font-bold">
            Manche {mancheActuelle} sur 4
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 flex-wrap">
            <h2 className="font-headline-sm text-lg sm:text-xl font-black text-on-surface">
              Saisie de la Manche
            </h2>
            {!isReadOnly && onResetGame && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Voulez-vous vraiment recommencer la partie à zéro ? Les scores et l'avancement de la partie en cours seront perdus.")) {
                    // Force clean up of all local state inputs
                    const resetPari: { [playerId: string]: string } = {};
                    const resetPlis: { [playerId: string]: number } = {};
                    const resetFlipping: { [playerId: string]: number } = {};
                    const resetPoints: { [playerId: string]: number } = {};

                    players.forEach((p) => {
                      resetPari[p.id] = getFirstAvailableCard(p);
                      resetPlis[p.id] = 0;
                      resetFlipping[p.id] = 0;
                      resetPoints[p.id] = 0;
                    });

                    setSelectedPari(resetPari);
                    setPlisCount(resetPlis);
                    setActiveFlippingChouines(resetFlipping);
                    setActivePointsChouines(resetPoints);
                    setActivePart(1);

                    // Call parent game state reset
                    onResetGame();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70 border border-red-500/10 px-2 py-1 rounded transition-all cursor-pointer hover:scale-[1.03] active:scale-95"
                title="Démarrer une nouvelle partie (Conserver les joueurs)"
              >
                Recommencer à zéro 🔄
              </button>
            )}
          </div>
          <p className="font-body-md text-xs mt-1.5 text-on-surface-variant max-w-sm">
            Configurez d'abord les paris de chacun, puis passez à la saisie des plis et des chouines !
          </p>
        </div>

        {/* Live dynamic count indicator */}
        {activePart === 2 && (
          <div className={`p-3 rounded-xl border font-mono font-bold text-center shrink-0 flex flex-col justify-center min-w-[7.5rem] transition-colors ${
            sumPlis === 7
              ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400"
              : "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
          }`}>
            <span className="text-[10px] uppercase font-sans font-bold text-on-surface-variant/80 tracking-wider">Total des plis</span>
            <span className="text-2xl mt-0.5">{sumPlis} / 7</span>
            <span className="text-[9px] font-sans font-medium mt-1 leading-none">
              {sumPlis === 7 ? "✓ Répartition parfaite" : "⚠️ Doit idéalement faire 7"}
            </span>
          </div>
        )}
      </div>

      {/* Dual Step Stepper Switcher */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActivePart(1)}
          className={`flex-1 max-w-[200px] py-2.5 px-3 rounded-xl font-headline-sm text-xs sm:text-sm font-black uppercase text-center cursor-pointer transition-all border-2 flex items-center justify-center gap-2 ${
            activePart === 1
              ? "bg-primary text-on-primary border-primary shadow-sm"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant"
          }`}
        >
          <span>🎯</span>
          <span>1. Choix Paris</span>
        </button>
        
        <div className="h-0.5 w-6 bg-outline-variant hidden sm:block" />

        <button
          type="button"
          onClick={() => setActivePart(2)}
          className={`flex-1 max-w-[200px] py-2.5 px-3 rounded-xl font-headline-sm text-xs sm:text-sm font-black uppercase text-center cursor-pointer transition-all border-2 flex items-center justify-center gap-2 ${
            activePart === 2
              ? "bg-primary text-on-primary border-primary shadow-sm"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant"
          }`}
        >
          <span>🃏</span>
          <span>2. Plis & Chouines</span>
        </button>
      </div>

      {activePart === 1 ? (
        /* PARTIE 1 : CHOIX DES PARIS POUR CHACUN DES JOUEURS */
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-xs text-on-surface flex items-start gap-2.5">
            <span className="text-sm">🎯</span>
            <div>
              <p className="font-extrabold text-primary dark:text-primary-fixed-dim uppercase tracking-wider">
                Prise de Pari Générale (Mode Correction Active)
              </p>
              <p className="text-on-surface-variant font-semibold mt-0.5 leading-normal">
                Sélectionnez le pari actif de la manche pour chaque joueur. En cas d'erreur de saisie à l'étape suivante, vous pouvez revenir ici pour corriger à tout moment !
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {players.map((player, idx) => {
              const activePariId = selectedPari[player.id];
              const activePariCard = PARI_CARDS.find((c) => c.id === activePariId);
              const valides = player.parissValides || [];
              const colorPreset = getPlayerColorPreset(player.color, idx);

              return (
                <div 
                  key={player.id} 
                  className="bg-surface-bright dark:bg-surface-container-high/10 rounded-2xl p-4 sm:p-5 border border-outline-variant/60 hover:border-primary/40 transition-all relative pl-5 overflow-hidden shadow-xs"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-3 ${colorPreset.bgClass}`}></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={player.avatar} 
                      alt={player.name}
                      referrerPolicy="no-referrer"
                      className={`w-10 h-10 rounded-full object-cover border-2 ${colorPreset.borderClass}`}
                    />
                    <div>
                      <h3 className="font-headline-sm text-sm sm:text-base text-primary dark:text-primary-fixed-dim font-black flex items-center gap-1.5 flex-wrap">
                        {player.name}
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorPreset.bgClass}`} />
                        {activePariCard && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold rounded-full text-white bg-gradient-to-br ${activePariCard.color} border border-black/10 shadow-xs uppercase tracking-wider`}>
                            Actuel : {activePariCard.colorName}
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant font-semibold">
                        Score global: <strong className="text-on-surface">{player.scoreActuel} pts</strong>
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Scroll of Pari Options */}
                  <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x scrollbar-thin">
                    {PARI_CARDS.map((card) => {
                      const isDiscarded = valides.includes(card.id);
                      const isSelected = activePariId === card.id;

                      return (
                        <div key={card.id} className="snap-center shrink-0">
                          <PariCardVisual
                            card={card}
                            isSelected={isSelected}
                            isDiscarded={isDiscarded}
                            size="sm"
                            onClick={() => handlePariChange(player.id, card.id)}
                            playerIndex={idx}
                          />
                          <div className="mt-2 text-center">
                            <button
                              type="button"
                              disabled={isDiscarded || isReadOnly}
                              onClick={() => handlePariChange(player.id, card.id)}
                              className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors cursor-pointer active:scale-95 duration-150 ${
                                isDiscarded
                                  ? "bg-stone-100 text-stone-400 dark:bg-stone-900/30 dark:text-stone-600 cursor-not-allowed border border-dashed border-outline-variant"
                                  : isReadOnly
                                  ? isSelected
                                    ? "bg-primary/40 text-on-primary select-none opacity-60 font-black cursor-default"
                                    : "bg-surface-container-high/30 text-on-surface/40 select-none cursor-default"
                                  : isSelected
                                  ? "bg-primary text-on-primary shadow-sm font-black border-2 border-primary"
                                  : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant"
                              }`}
                            >
                              {isSelected ? "ACTIF ✓" : isDiscarded ? "Écartée" : "Choisir"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Contract detail banner */}
                  {activePariCard && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs bg-surface-container-low dark:bg-stone-900/40 p-2.5 rounded-xl border border-outline-variant/60">
                      <span className="font-extrabold uppercase text-[10px] text-primary whitespace-nowrap mt-0.5">Contrat :</span>
                      <span className="text-on-surface-variant font-medium">
                        {activePariCard.colorName} — Gagnant si exactement{" "}
                        {activePariCard.bets.map((b) => (
                          <strong key={b.label} className="text-primary font-black ml-1 whitespace-nowrap">
                            {b.label} ({b.points} pts)
                          </strong>
                        )).reduce((prev, curr) => [prev, " ou ", curr])}.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => setActivePart(2)}
              className="w-full inline-flex items-center justify-center p-4 sm:p-5 font-headline-sm text-sm sm:text-base bg-secondary text-on-secondary hover:bg-secondary/95 rounded-xl hand-drawn-border font-black transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
            >
              <span>Saisir les Plis & Chouines</span>
              <span className="ml-2">🃏 →</span>
            </button>
          </div>
        </div>
      ) : (
        /* PARTIE 2 : SAISIE DES PLIS & DES CHOUINES AVEC BANDEAU INDIVIDUEL */
        <div className="space-y-4">
          {/* Accordion Roster Checklist */}
          <div className="space-y-4">
            {players.map((player, idx) => {
              const isPlayerExpanded = !!expandedPlayers[player.id];
              const valides = player.parissValides || [];
              const activePariId = selectedPari[player.id];
              const activePariCard = PARI_CARDS.find((c) => c.id === activePariId);
              const currentPlis = plisCount[player.id];
              const currentFlipping = activeFlippingChouines[player.id] || 0;
              const currentPoints = activePointsChouines[player.id] || 0;

              // Real-time round math
              const matchedBet = checkPariMatch(activePariId, currentPlis);
              const pariPoints = matchedBet ? matchedBet.points : 0;
              const isPariSuccess = matchedBet !== null;
              const pointsChouine = currentPoints;
              const totalPointsRound = pariPoints + pointsChouine;

              const playerSections = expandedSections[player.id] || { pari: true, plis: true, chouines: true };

              const colorPreset = getPlayerColorPreset(player.color, idx);

              return (
                <div
                  key={player.id}
                  className={`hand-drawn-border rounded-2xl overflow-hidden transition-all duration-300 shadow bg-surface-bright dark:bg-surface-container-high/10 relative pl-3.5 ${
                    isPlayerExpanded ? "ring-2 ring-primary/40 shadow-lg border-primary" : "border-outline-variant hover:border-outline"
                  }`}
                >
                  {/* Bandeau vertical de rappel de la couleur du joueur */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-3 transition-all duration-200 ${colorPreset.bgClass}`} 
                    title={`Couleur du joueur : ${colorPreset.name}`}
                  ></div>

                  {/* Player Header - Accordion Toggle Button */}
                  <button
                    type="button"
                    onClick={() => togglePlayerExpanded(player.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-surface-container/30 transition-colors select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          referrerPolicy="no-referrer"
                          className={`w-12 h-12 rounded-full object-cover border-2 ${colorPreset.borderClass}`}
                        />
                        {valides.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full text-[9px] font-extrabold h-4.5 w-4.5 flex items-center justify-center border-1.5 border-white dark:border-stone-900">
                            {valides.length}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-headline-sm text-base text-primary dark:text-primary-fixed-dim font-black leading-tight flex items-center gap-1.5">
                            {player.name}
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${colorPreset.bgClass}`} title={`Couleur : ${colorPreset.name}`}></span>
                          </h3>

                          {/* 1. Chosen Pari Contract clearly visible on the individual banner row as requested */}
                          {activePariCard && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white bg-gradient-to-br ${activePariCard.color} border border-black/10 shadow-xs uppercase tracking-wider`}>
                              🎴 {activePariCard.colorName}
                            </span>
                          )}

                          {/* Short pill for success */}
                          {isPariSuccess && (
                            <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase leading-none border border-green-500/10">
                              🎯 Pari Réussi
                            </span>
                          )}
                        </div>
                        
                        {/* Compact dynamic info representation when collapsed */}
                        <div className="text-xs text-on-surface-variant font-medium mt-1 inline-flex items-center gap-2 flex-wrap">
                          <span>Cumul: <b>{player.scoreActuel} pts</b></span>
                          <span>•</span>
                          <span>Plis: <b>{currentPlis}</b></span>
                          {currentPoints > 0 && (
                            <>
                              <span>•</span>
                              <span>Chouine: <b className="text-green-600">+{currentPoints}p</b></span>
                            </>
                          )}
                          {currentFlipping > 0 && (
                            <>
                              <span>•</span>
                              <span>Rotations: <b className="text-amber-500">{currentFlipping}</b></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Score circle */}
                      <div className="bg-surface-container-high dark:bg-stone-900/60 h-10 w-16 rounded-xl flex flex-col justify-center items-center border border-outline-variant font-mono">
                        <span className="text-[8px] leading-tight text-outline uppercase font-sans font-bold">Simul.</span>
                        <span className="text-sm font-black text-primary dark:text-primary-fixed-dim leading-none">+{totalPointsRound} pts</span>
                      </div>

                      {isPlayerExpanded ? (
                        <ChevronUp className="w-5 h-5 text-on-surface-variant shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-on-surface-variant shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Collapsed/Expanded Content container */}
                  <AnimatePresence initial={false}>
                    {isPlayerExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="border-t border-outline-variant overflow-hidden"
                      >
                        <div className="p-4 sm:p-6 bg-surface-container-lowest/50 dark:bg-[#100e0b]/40 space-y-6">
                          
                          {/* SECTION 2 (renamed 1 for UX): PLIS REMPORTÉS */}
                          <div className="bg-surface-bright dark:bg-stone-900/10 rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => toggleSection(player.id, "plis")}
                              className="w-full px-4 py-3 bg-surface-container-low dark:bg-stone-900/40 flex justify-between items-center text-left font-black text-xs sm:text-sm text-primary dark:text-primary-fixed-dim border-b border-outline-variant cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <span>🃏</span>
                                <span>1. PLIS REMPORTÉS</span>
                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider ml-2 bg-on-surface-variant/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                                  {currentPlis} {currentPlis > 1 ? "plis" : "pli"}
                                </span>
                              </div>
                              {playerSections.plis ? (
                                <ChevronUp className="w-4 h-4 text-on-surface-variant shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />
                              )}
                            </button>

                            <AnimatePresence initial={false}>
                              {playerSections.plis && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4">
                                    <span className="text-[11px] text-on-surface-variant font-medium block mb-2">
                                      Sélectionnez le nombre exact de plis remportés au cours des 7 plis de la manche :
                                    </span>

                                    {/* Selection row */}
                                    <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-1">
                                      {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
                                        const isSelected = currentPlis === num;
                                        const isSuccessFold = activePariCard ? checkPariMatch(activePariId, num) !== null : false;

                                        return (
                                          <button
                                            type="button"
                                            key={num}
                                            disabled={isReadOnly}
                                            onClick={() => handlePlisSelect(player.id, num)}
                                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full font-headline-sm text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border-2 ${
                                              isSelected
                                                ? isSuccessFold
                                                  ? "bg-green-600 text-white border-green-700 font-bold scale-[1.08] shadow"
                                                  : "bg-primary text-on-primary border-primary font-bold scale-[1.08] shadow"
                                                : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant font-medium"
                                            }`}
                                            title={isSuccessFold ? "Ce pli valide le Pari et rapporte des points !" : `${num} plis`}
                                          >
                                            {num}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Live message banner */}
                                    <div className="mt-2.5">
                                      {isPariSuccess ? (
                                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-bold bg-green-500/10 p-2 rounded-lg border border-green-500/15">
                                          <Sparkles className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                          <span>
                                            Pari RÉUSSI ! Le contrat est rempli (+{pariPoints} pts). La carte sera écartée à la validation.
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/15">
                                          <Frown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                          <span>
                                            Pari échoué (0 pt). Le joueur conserve activement sa carte {activePariCard?.colorName}.
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* SECTION 3 (renamed 2 for UX): LES CHOUINES DISSOCIEES */}
                          <div className="bg-surface-bright dark:bg-stone-900/10 rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => toggleSection(player.id, "chouines")}
                              className="w-full px-4 py-3 bg-surface-container-low dark:bg-stone-900/40 flex justify-between items-center text-left font-black text-xs sm:text-sm text-primary dark:text-primary-fixed-dim border-b border-outline-variant cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <span>😢</span>
                                <span>2. GESTION DES CHOUINES & RÂLAGES</span>
                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider ml-2 bg-on-surface-variant/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                                  Râlages: {currentFlipping} | Points: {currentPoints}
                                </span>
                              </div>
                              {playerSections.chouines ? (
                                <ChevronUp className="w-4 h-4 text-on-surface-variant shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />
                              )}
                            </button>

                            <AnimatePresence initial={false}>
                              {playerSections.chouines && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 space-y-3">
                                    
                                    {/* A. Chouine tactique */}
                                    <div className="flex flex-col gap-2 bg-surface-container-low dark:bg-stone-900/40 p-3 rounded-xl border border-outline-variant/60">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[11px] font-black text-primary uppercase tracking-wide">
                                                A. Chouine Tactique (0 pt)
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => toggleHelpOpen(player.id, "tactique")}
                                                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-outline hover:text-primary transition-colors cursor-pointer"
                                                title="Cliquez pour afficher les règles"
                                              >
                                                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                                              </button>
                                            </div>
                                            <p className="text-[10px] text-on-surface-variant mt-0.5 font-semibold">
                                              Retourner une carte contre son propre jeu.
                                            </p>
                                          </div>
                                        </div>

                                        {/* Counters */}
                                        <div className="flex items-center shrink-0 bg-surface-bright dark:bg-stone-900 border border-outline-variant rounded-xl overflow-hidden shadow-xs">
                                          <button
                                            type="button"
                                            onClick={() => handleDecrementFlipping(player.id)}
                                            disabled={currentFlipping === 0 || isReadOnly}
                                            className={`px-2 py-1.5 transition-all border-r border-outline-variant flex items-center justify-center ${
                                              isReadOnly
                                                ? "opacity-25 cursor-default text-stone-400"
                                                : currentFlipping === 0
                                                ? "opacity-25 cursor-not-allowed text-stone-400"
                                                : "text-red-500 hover:bg-red-500/10 active:scale-90 cursor-pointer"
                                            }`}
                                          >
                                            <Minus className="w-3 h-3 font-bold" />
                                          </button>

                                          <div className="px-2.5 py-1 flex flex-col items-center justify-center select-none min-w-[2.5rem]">
                                            <span className="font-headline-sm text-xs font-black text-on-surface">
                                              {currentFlipping}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-outline-variant leading-none">
                                              fois
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleIncrementFlipping(player.id)}
                                            disabled={isReadOnly}
                                            className={`px-2 py-1.5 transition-all text-green-505 border-l border-outline-variant flex items-center justify-center ${
                                              isReadOnly
                                                ? "opacity-25 cursor-default"
                                                : "text-green-500 hover:bg-green-500/10 active:scale-90 cursor-pointer"
                                            }`}
                                          >
                                            <Plus className="w-3 h-3 font-bold" />
                                          </button>
                                        </div>
                                      </div>

                                      <AnimatePresence>
                                        {helpOpen[player.id]?.tactique && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="bg-background dark:bg-stone-950 p-2.5 rounded-lg text-[10px] leading-relaxed text-on-surface-variant font-semibold border border-outline-variant/50 overflow-hidden"
                                          >
                                            💡 Un joueur râle pour qu'on lui remplace des cartes par tactique. Cela rapporte <strong>0 point de manche</strong> mais est enregistré pour couronner le râleur de la partie dans le tableau final !
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* B. Chouine Bonus */}
                                    <div className="flex flex-col gap-2 bg-primary/5 dark:bg-primary-container/10 p-3 rounded-xl border border-primary/10">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[11px] font-black text-secondary dark:text-secondary-fixed-dim uppercase tracking-wide">
                                                B. Chouine Bonus (+1 pt)
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => toggleHelpOpen(player.id, "bonus")}
                                                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-outline hover:text-primary transition-colors cursor-pointer"
                                                title="Cliquez pour afficher les règles"
                                              >
                                                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                                              </button>
                                            </div>
                                            <p className="text-[10px] text-on-surface-variant mt-0.5 font-semibold">
                                              Bonus de carte gagnante de la réserve.
                                            </p>
                                          </div>
                                        </div>

                                        {/* Counters */}
                                        <div className="flex items-center shrink-0 bg-surface-bright dark:bg-stone-900 border border-outline-variant rounded-xl overflow-hidden shadow-xs">
                                          <button
                                            type="button"
                                            onClick={() => handleDecrementPoints(player.id)}
                                            disabled={currentPoints === 0 || isReadOnly}
                                            className={`px-2 py-1.5 transition-all border-r border-outline-variant flex items-center justify-center ${
                                              isReadOnly
                                                ? "opacity-25 cursor-default text-stone-400"
                                                : currentPoints === 0
                                                ? "opacity-25 cursor-not-allowed text-stone-400"
                                                : "text-red-500 hover:bg-red-500/10 active:scale-90 cursor-pointer"
                                            }`}
                                          >
                                            <Minus className="w-3 h-3 font-bold" />
                                          </button>

                                          <div className="px-2.5 py-1 flex flex-col items-center justify-center select-none min-w-[2.5rem]">
                                            <span className="font-headline-sm text-xs font-black text-secondary dark:text-secondary-fixed-dim">
                                              +{currentPoints}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-green-500 leading-none">
                                              pt{currentPoints > 1 ? "s" : ""}
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleIncrementPoints(player.id)}
                                            disabled={isReadOnly}
                                            className={`px-2 py-1.5 transition-all text-green-500 border-l border-outline-variant flex items-center justify-center ${
                                              isReadOnly
                                                ? "opacity-25 cursor-default"
                                                : "hover:bg-green-500/10 active:scale-90 cursor-pointer"
                                            }`}
                                          >
                                            <Plus className="w-3 h-3 font-bold" />
                                          </button>
                                        </div>
                                      </div>

                                      <AnimatePresence>
                                        {helpOpen[player.id]?.bonus && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="bg-background dark:bg-stone-950 p-2.5 rounded-lg text-[10px] leading-relaxed text-on-surface-variant font-semibold border border-outline-variant/50 overflow-hidden"
                                          >
                                            💡 Un joueur fait une annonce pour récupérer de la réserve des points supplémentaires. Chaque enregistrement accorde immédiatement <strong>+1 point bonus</strong> sur le score total de la manche.
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Validate Button or Spectator Wait banner */}
          <div className="mt-8 mb-6 text-center">
            {isReadOnly ? (
              <div className="hand-drawn-border border-primary bg-primary/5 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3">
                <span className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></span>
                <div className="text-sm">
                  <p className="font-sans font-black text-primary dark:text-primary-fixed-dim uppercase tracking-wider">Mode Spectateur Actif 👑</p>
                  <p className="text-xs text-on-surface-variant italic mt-1 max-w-sm">
                    En attente que le Maître du Jeu saisisse et valide les scores de la Manche {mancheActuelle}...
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="group relative w-full inline-flex items-center justify-center px-12 py-5 font-headline-sm text-headline-sm bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container hand-drawn-border rounded-xl transition-all hover:scale-[1.02] active:scale-95 hover:-rotate-1 cursor-pointer shadow-lg"
              >
                VALIDER LA MANCHE
                <CheckCircle className="ml-2.5 w-6 h-6 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info Reminder Box */}
      <div className="hand-drawn-border border-tertiary bg-tertiary-fixed-dim/5 p-4 rounded-lg italic text-on-surface text-center rotate-1 relative transition-colors">
        <Info className="w-5 h-5 absolute -top-3 -left-3 bg-background p-0.5 text-tertiary rounded-full scale-110" />
        <p className="font-body-md text-xs sm:text-sm">
          💡 Règle officielle : Si votre nombre de plis gagnés n’égale aucun des paris de votre carte Pari active, vous la conservez pour la rejouer. Si le pari est réussi, elle est défaussée définitivement !
        </p>
      </div>
    </div>
  );
}
