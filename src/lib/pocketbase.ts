import PocketBase from 'pocketbase';

export interface PlayerState {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  scoreActuel: number;
  scoresParManche: number[];
  chouinages: number;
  chouinagesParManche?: number[];
  chouinesPointsParManche?: number[];
  plisParManche?: number[];
  parisParManche?: string[];
  parissValides?: string[];
  color?: string;
}

export interface GameState {
  players: PlayerState[];
  mancheActuelle: number;
  gameStatus: "saisie" | "termine";
  currentTab: "players" | "game" | "scores";
  hostId: string;
  updatedAt?: number;
}

// In AI Studio / Cloud Run, PocketBase is typically reverse proxied on the same origin / port or via VITE_POCKETBASE_URL.
// We use the pocketbase.cireaserveur.familyds.com server domain provided by the user as the default fallback.
export const getPocketBaseUrl = (): string => {
  return localStorage.getItem("pocketbase_url") || (import.meta as any).env?.VITE_POCKETBASE_URL || "https://pocketbase.cireaserveur.familyds.com";
};

export const setPocketBaseUrl = (url: string): void => {
  let cleanedUrl = url.trim();
  if (cleanedUrl && !cleanedUrl.startsWith("http://") && !cleanedUrl.startsWith("https://")) {
    cleanedUrl = "https://" + cleanedUrl;
  }
  localStorage.setItem("pocketbase_url", cleanedUrl);
  client.baseUrl = cleanedUrl;
};

export const client = new PocketBase(getPocketBaseUrl());

export const pb = {
  /**
   * Checks if a room/salon exists on the Pocketbase.
   * Returns its state if it exists, or throws an error.
   */
  getRoom: async (code: string): Promise<GameState> => {
    try {
      const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${code.toUpperCase()}"`);
      return record.state as GameState;
    } catch (err: any) {
      throw new Error(`Le salon ${code.toUpperCase()} n'existe pas ou est indisponible.`);
    }
  },

  /**
   * Host creates or resets a room.
   */
  createRoom: async (code: string, initialState: GameState): Promise<void> => {
    const formattedCode = code.toUpperCase();
    try {
      // Check if already exists
      let record;
      try {
        record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
      } catch (e) {
        // Doesn't exist, we will create it
      }

      if (record) {
        // Reset existing room record
        await client.collection('rooms_chouineur').update(record.id, {
          state: initialState
        });
      } else {
        // Create new room record
        await client.collection('rooms_chouineur').create({
          code: formattedCode,
          state: initialState
        });
      }
    } catch (err: any) {
      throw new Error(`Échec de la création du salon : ${err.message || err}`);
    }
  },

  /**
   * Save the global state (Host writes).
   */
  saveRoomState: async (code: string, state: GameState): Promise<void> => {
    const formattedCode = code.toUpperCase();
    try {
      const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
      await client.collection('rooms_chouineur').update(record.id, { state });
    } catch (err: any) {
      throw new Error(`Erreur lors de la mise à jour (PocketBase) : ${err.message || err}`);
    }
  },

  /**
   * Join a room (joins the player to the list if not already present).
   */
  joinRoom: async (code: string, player: PlayerState): Promise<GameState> => {
    const formattedCode = code.toUpperCase();
    try {
      const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
      const state = record.state as GameState;
      
      if (!state.players) {
        state.players = [];
      }
      
      const exists = state.players.some((p: any) => p.id === player.id);
      if (!exists) {
        // Validation logic for guests joining
        const isGameInProgress = (state.mancheActuelle && state.mancheActuelle > 1) || state.currentTab !== "players";
        const isLobbyFull = state.players.length >= 5;

        if (isGameInProgress || isLobbyFull) {
          // If the game has started or lobby is full, connect as spectator
          (state as any).isSpectatorOnly = true;
          (state as any).spectatorReason = isGameInProgress ? "game_in_progress" : "lobby_full";
        } else {
          state.players.push(player);
          await client.collection('rooms_chouineur').update(record.id, { state });
        }
      }
      return state;
    } catch (err: any) {
      throw new Error(`Impossible de rejoindre le salon : ${err.message || err}`);
    }
  },

  /**
   * Subscribe to real-time snapshot modifications of the room document list using real PocketBase subscription.
   * Returns a cleanup function to unsubscribe.
   */
  onSnapshot: (code: string, callback: (data: GameState) => void): (() => void) => {
    const formattedCode = code.toUpperCase();
    let isCancelled = false;

    // Fetch initial state
    const fetchInitial = async () => {
      try {
        const record = await client.collection('rooms_chouineur').getFirstListItem(`code="${formattedCode}"`);
        if (record && record.state && !isCancelled) {
          callback(record.state as GameState);
        }
      } catch (e) {
        // Not found or not created yet
      }
    };
    fetchInitial();

    // Subscribe to updates using PocketBase collection real-time channel
    const subscribeToCollection = async () => {
      try {
        await client.collection('rooms_chouineur').subscribe('*', (e) => {
          if (isCancelled) return;
          if (e.record && e.record.code === formattedCode && e.record.state) {
            callback(e.record.state as GameState);
          }
        });
      } catch (err) {
        console.warn("Échec de la souscription temps-réel PocketBase, nouvelle tentative...", err);
        if (!isCancelled) {
          setTimeout(subscribeToCollection, 3000);
        }
      }
    };

    subscribeToCollection();

    return () => {
      isCancelled = true;
      client.collection('rooms_chouineur').unsubscribe('*').catch(() => {});
    };
  }
};
