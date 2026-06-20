import { useState, useEffect } from "react";
import { Player, Game, HistoriquePartie, Theme } from "./types";
import TopAppBar from "./components/TopAppBar";
import BottomNavBar from "./components/BottomNavBar";
import JoueursView from "./components/JoueursView";
import PartieView from "./components/PartieView";
import ScoresView from "./components/ScoresView";
import SettingsDialog from "./components/SettingsDialog";

// Les fameux avatars originaux des Chouineurs maquettés !
const DEFAULT_PLAYERS: Player[] = [
  {
    id: "gaston-1",
    name: "Gaston",
    subtitle: "Râleur professionnel breveté d'État.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGY42fDNuQddskreOTIgO7_XPft3cj97rlzHtVS0y02gB3CxMbr98Epq5Epa87QPf0TtCDloxMPHAa_d2C2LYdFGf10Itl5BXetv_JDzCPaBR-U3ZC4C5nLnSFFV7NwpaxkWl0DwcpiZvWAqm9eEUavpvx2GsWGvFD7wYGehn-j29ggvIoIfqHenKPEFNag2bwPazWP85fVCJNQ_UOQB6D4qKkZ_P6dBgyVIX0tZOgUysoCMt9MPyW7yXrgfNxQguXX-YlB_-xTs",
    scoreActuel: 11,
    scoresParManche: [11],
    chouinages: 1,
    chouinagesParManche: [0], // 0 whine of card rotation
    chouinesPointsParManche: [1], // 1 point card whine
    plisParManche: [4],
    parisParManche: ["violet"],
    parissValides: ["violet"],
    color: "amber"
  },
  {
    id: "simone-2",
    name: "Simone",
    subtitle: "Aime vivement contester l'atout noir.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnk8Ha798S8MA_B7ljt0VskTJn9n76Foh8XMAR3sIdvSTtGLnUKfoAzCnQwIfzokrcTyRFgA96mpFnW-YYwjfCePGIqXhHHZEbTPDLaBuDF_uhzojcItf6n7Vcrferi6Vb7YFy76hfZ5_QLXwzRpmUGdHM3XN0q2YkY1nuxOOFvgN3fnEZxF_fyI5l9oHmym8EMcPMXwmhWaNcPvsHgNcGWfsOpFk6sSApmsPU6OJSj3PzaWMDWBw8WtKQohJI-a_BLYMABIXJQIE",
    scoreActuel: 8,
    scoresParManche: [8],
    chouinages: 0,
    chouinagesParManche: [0],
    chouinesPointsParManche: [0],
    plisParManche: [1],
    parisParManche: ["verte"],
    parissValides: ["verte"],
    color: "blue"
  },
  {
    id: "balthazar-3",
    name: "Balthazar",
    subtitle: "Chouine même en menant largement au score.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpOSNS863E9dVIAc_SuQxjIr1kZBqheibyx5k67M5IvxaXzQx7nEFI0bTXUx5XuBXbyBb31l_xqE5-J7NUeC3oJjNpIthXuKlqvCpCgdFG4Ev2FnjFDGHAjXPHp1Yv_sds1UfUJQvONHK9UDKalagzE2Zvt2dcTerGh7YC58q6YHydxaXvxHUsXYW_CM8X7_6L7yF3kzGXfgxeNOWSVbbfO_8aYyVpNIHRebjiZr9jfBgxW8moSvM9SIW4lKPcCyxsBzu_xmoZB2Q",
    scoreActuel: 11,
    scoresParManche: [11],
    chouinages: 2,
    chouinagesParManche: [0],
    chouinesPointsParManche: [2],
    plisParManche: [3],
    parisParManche: ["bleu"],
    parissValides: ["bleu"],
    color: "emerald"
  }
];

const LOBBY_SIM_PLAYERS: Player[] = [
  {
    id: "dede-4",
    name: "Dédé",
    subtitle: "Prétend que les cartes noires portent la guigne.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ3HDElYtzKIsx0bx5ytEK53j4DreEHwQS9Tb_XcgbjVlRsLXrDIkckxyvVzrhNw8_7csiOBH0O8m5_ZstNycIXxdeT4pOYYIAmmh24FLbw_NLKZxTzGmquaMx0lxUq_jiE5EqiipT2ZAEBRna8qQo_viR8CCENbD0ZsC26Lr_fZ97cCR4kMdesmcJhb9k2SYQR112T3iUaPjbty42W_27O6Ke0xyuhXdRQ9TRghpr0AYQrEPzM08eUN6TquSnGde4Imyo6i9BT4c",
    scoreActuel: 0,
    scoresParManche: [],
    chouinages: 0,
    chouinagesParManche: [],
    chouinesPointsParManche: [],
    plisParManche: [],
    parisParManche: [],
    parissValides: [],
    color: "rose"
  },
  {
    id: "decker-5",
    name: "Reine Decker",
    subtitle: "Exige que les pions soient alignés parfaitement.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpd7v3Tj_4ilCSfRdW_SLvBDfUrcDZVcObXfRm-CvoSgpKV5JybL8pPPFZN6tHSemVQWGIMXd17fcWgWQo-3Y3UZnnmjxXJ_qaBRSIwhr6NT3KK7CMwta9nd_8ppbnPGhAs9vt3Y8NTIW8JnSpK2cW4Hmyd_KIizs_hBRU-uWjbACVQ-Zk2Fbj-zU-lImkyKc8BozqP0GvSepSyg9hsZB90onKf5hOWeGN7kHdVT8EPHXJKsL8MI7NCNz-MkVzVJGbmzohmU-CBkk",
    scoreActuel: 0,
    scoresParManche: [],
    chouinages: 0,
    chouinagesParManche: [],
    chouinesPointsParManche: [],
    plisParManche: [],
    parisParManche: [],
    parissValides: [],
    color: "purple"
  }
];

export default function App() {
  // 1. Initialiser le thème
  const [theme, setTheme] = useState<Theme>(() => {
    const cached = localStorage.getItem("chouine_theme");
    return (cached as Theme) || "light";
  });

  // 2. Initialiser les joueurs
  const [players, setPlayers] = useState<Player[]>(() => {
    const cached = localStorage.getItem("chouine_players");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Échec du chargement des joueurs", e);
      }
    }
    return DEFAULT_PLAYERS;
  });

  // 3. Initialiser les paramètres de jeu (fixé à 4 manches selon les règles de Chouine)
  const [maxRounds] = useState<number>(4);

  const [mancheActuelle, setMancheActuelle] = useState<number>(() => {
    const cached = localStorage.getItem("chouine_manche_actuelle");
    return cached ? parseInt(cached, 10) : 2; // Commencer à la manche 2 pour correspondre à "Manche 2" de la maquette d'origine !
  });

  const [gameStatus, setGameStatus] = useState<"saisie" | "termine">(() => {
    const cached = localStorage.getItem("chouine_game_status");
    return (cached as "saisie" | "termine") || "saisie";
  });

  // 4. Initialiser l'historique
  const [historique, setHistorique] = useState<HistoriquePartie[]>(() => {
    const cached = localStorage.getItem("chouine_historique");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "hist-1",
        date: "Hier",
        gagnant: { name: "Balthazar", score: 68 },
        perdants: [
          { name: "Gaston", score: 45 },
          { name: "Simone", score: 32 }
        ]
      }
    ];
  });

  // 5. Interface UI active et dialogs
  const [currentTab, setCurrentTab] = useState<"players" | "game" | "scores" > (() => {
    const cachedPlayers = localStorage.getItem("chouine_players");
    if (cachedPlayers) {
      try {
        const parsed = JSON.parse(cachedPlayers);
        if (parsed && Array.isArray(parsed) && parsed.length >= 3 && parsed.length <= 5) {
          return "game";
        }
      } catch (e) {
        // ignorer
      }
    }
    return "players";
  });

  const handleTabChange = (tab: "players" | "game" | "scores") => {
    if (tab === "game" || tab === "scores") {
      if (players.length < 3) {
        alert("La Chouine se joue à 3 joueurs minimum. Veuillez configurer au moins 3 joueurs !");
        return;
      }
      if (players.length > 5) {
        alert("La Chouine se joue à 5 joueurs maximum. Veuillez configurer au maximum 5 joueurs !");
        return;
      }
    }
    setCurrentTab(tab);
  };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [multiplayerMode, setMultiplayerMode] = useState<"local" | "simulated">("local");

  // Synchroniser le thème avec la balise racine HTML et le body
  useEffect(() => {
    const rootEl = document.documentElement;
    const bodyEl = document.body;
    if (theme === "dark") {
      rootEl.classList.add("dark");
      bodyEl.classList.add("dark-mode-state");
    } else {
      rootEl.classList.remove("dark");
      bodyEl.classList.remove("dark-mode-state");
    }
    localStorage.setItem("chouine_theme", theme);
  }, [theme]);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem("chouine_players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("chouine_max_rounds", maxRounds.toString());
  }, [maxRounds]);

  useEffect(() => {
    localStorage.setItem("chouine_manche_actuelle", mancheActuelle.toString());
  }, [mancheActuelle]);

  useEffect(() => {
    localStorage.setItem("chouine_game_status", gameStatus);
  }, [gameStatus]);

  useEffect(() => {
    localStorage.setItem("chouine_historique", JSON.stringify(historique));
  }, [historique]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Actions d'écriture de la manche
  const handleValiderManche = (roundData: {
    [playerId: string]: {
      plis: number;
      pariCardId: string;
      chouinesFlipping: number; // Chouine pour retourner une carte (0 pt)
      chouinesPoints: number; // Chouine de réserve (+1 pt par carte)
      pariPoints: number;
      isPariSuccess: boolean;
      totalScore: number;
    }
  }) => {
    const nextPlayers = players.map((p) => {
      const pData = roundData[p.id] || {
        plis: 0,
        pariCardId: "",
        chouinesFlipping: 0,
        chouinesPoints: 0,
        pariPoints: 0,
        isPariSuccess: false,
        totalScore: 0
      };

      const newScoresParManche = [...p.scoresParManche, pData.totalScore];
      const sum = newScoresParManche.reduce((a, b) => a + b, 0);

      const newChouinagesParManche = [...(p.chouinagesParManche || []), pData.chouinesFlipping];
      const newChouinesPointsParManche = [...(p.chouinesPointsParManche || []), pData.chouinesPoints];
      const newPlisParManche = [...(p.plisParManche || []), pData.plis];
      const newParisParManche = [...(p.parisParManche || []), pData.pariCardId];
      
      const newParissValides = pData.isPariSuccess && pData.pariCardId
        ? [...(p.parissValides || []), pData.pariCardId]
        : (p.parissValides || []);

      return {
        ...p,
        scoresParManche: newScoresParManche,
        scoreActuel: sum,
        chouinages: (p.chouinages || 0) + (pData.chouinesFlipping + pData.chouinesPoints),
        chouinagesParManche: newChouinagesParManche,
        chouinesPointsParManche: newChouinesPointsParManche,
        plisParManche: newPlisParManche,
        parisParManche: newParisParManche,
        parissValides: newParissValides,
      };
    });

    setPlayers(nextPlayers);

    // Vérifier si la partie est terminée
    if (mancheActuelle >= maxRounds) {
      // Trier par ordre décroissant
      const sorted = [...nextPlayers].sort((a, b) => b.scoreActuel - a.scoreActuel);
      const winner = sorted[0];
      const losers = sorted.slice(1).map((lp) => ({ name: lp.name, score: lp.scoreActuel }));

      const newHistoryEntry: HistoriquePartie = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        gagnant: { name: winner.name, score: winner.scoreActuel },
        perdants: losers,
      };

      setHistorique((prev) => [newHistoryEntry, ...prev]);
      setGameStatus("termine");
      setMancheActuelle(maxRounds);
      setCurrentTab("scores"); // basculer directement vers le Podium final !
    } else {
      setMancheActuelle((prev) => prev + 1);
      setCurrentTab("scores"); // basculer vers les scores actuels du tour
    }
  };

  const handleResetGame = () => {
    const wiped = players.map((p) => ({
      ...p,
      scoreActuel: 0,
      scoresParManche: [],
      chouinages: 0,
      chouinagesParManche: [],
      chouinesPointsParManche: [],
      plisParManche: [],
      parisParManche: [],
      parissValides: []
    }));
    setPlayers(wiped);
    setMancheActuelle(1);
    setGameStatus("saisie");
    setCurrentTab("game");
  };

  const handleResetAll = () => {
    setPlayers(DEFAULT_PLAYERS);
    setMancheActuelle(1);
    setGameStatus("saisie");
    setHistorique([]);
    setCurrentTab("players");
  };

  // Simuler le lobby multijoueur virtuel
  const handleSimulateLobbyPlayers = () => {
    if (players.length >= 5) {
      alert("Le salon royal est plein ! (Maximum de 5 joueurs)");
      return;
    }
    // Essayer de rajouter Dédé ou Decker s'ils n'existent pas encore
    const currentIds = players.map((p) => p.id);
    const availableToInvite = LOBBY_SIM_PLAYERS.filter((p) => !currentIds.includes(p.id));

    if (availableToInvite.length > 0) {
      const inviteTarget = availableToInvite[0];
      setPlayers((prev) => [...prev, inviteTarget]);
    } else {
      // Si déjà invité, simuler des scores pour eux
      alert("Tous les chouineurs distants ont déjà rejoint le salon royal !");
    }
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistorique((prev) => prev.filter((entry) => entry.id !== id));
  };

  // Déterminer le titre du bandeau en haut dynamiquement
  const getRoundLabel = () => {
    if (currentTab === "players") return "Les Chouineurs";
    if (gameStatus === "termine") return "Sacre Royal";
    return `Manche ${mancheActuelle}`;
  };

  return (
    <div className="paper-texture min-h-screen text-on-background pb-32 flex flex-col justify-start select-none transition-colors duration-300">
      {/* 1. Header de navigation bar */}
      <TopAppBar
        roundName={getRoundLabel()}
        theme={theme}
        toggleTheme={toggleTheme}
        openSettings={() => setSettingsOpen(true)}
        multiplayerMode={multiplayerMode}
      />

      {/* 2. Conteneur principal fluide */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-6 pb-20 relative z-20">
        {currentTab === "players" && (
          <JoueursView
            players={players}
            onUpdatePlayers={setPlayers}
            onStartGame={() => handleTabChange("game")}
          />
        )}

        {currentTab === "game" && (
          <PartieView
            players={players}
            mancheActuelle={mancheActuelle}
            onValiderManche={handleValiderManche}
          />
        )}

        {currentTab === "scores" && (
          <ScoresView
            players={players}
            status={gameStatus}
            mancheActuelle={mancheActuelle}
            onResetGame={handleResetGame}
            historique={historique}
            onDeleteHistoryEntry={handleDeleteHistoryEntry}
            onBackToGame={() => handleTabChange("game")}
          />
        )}
      </main>

      {/* 3. Navigation bar du bas */}
      <BottomNavBar currentTab={currentTab} setCurrentTab={handleTabChange} />

      {/* 4. Overlay Dialogue options et paramètres */}
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxRounds={maxRounds}
        onUpdateMaxRounds={() => {}}
        multiplayerMode={multiplayerMode}
        onUpdateMultiplayerMode={setMultiplayerMode}
        onResetAll={handleResetAll}
        onSimulateLobbyPlayers={handleSimulateLobbyPlayers}
      />
    </div>
  );
}
