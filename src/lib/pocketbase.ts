/**
 * Client-side Pocketbase connection emulation.
 * Under the hood, this communicates in real-time with our full-stack Express server
 * using Server-Sent Events (SSE) for lightning-fast bidirectional replication.
 */

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
}

export const pb = {
  /**
   * Checks if a room/salon exists on the server.
   * Returns its state if it exists, or throws an error.
   */
  getRoom: async (code: string): Promise<GameState> => {
    const response = await fetch(`/api/rooms/${code.toUpperCase()}`);
    if (!response.ok) {
      throw new Error(`Le salon ${code.toUpperCase()} n'existe pas.`);
    }
    const data = await response.json();
    return data.state;
  },

  /**
   * Host creates or resets a room.
   */
  createRoom: async (code: string, initialState: GameState): Promise<void> => {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.toUpperCase(),
        state: initialState
      })
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la création du salon.");
    }
  },

  /**
   * Save the global state (Host writes).
   */
  saveRoomState: async (code: string, state: GameState): Promise<void> => {
    const response = await fetch(`/api/rooms/${code.toUpperCase()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state })
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du salon.");
    }
  },

  /**
   * Join a room (joins the player to the list if not already present, analogous to arrayUnion).
   */
  joinRoom: async (code: string, player: PlayerState): Promise<GameState> => {
    const response = await fetch(`/api/rooms/${code.toUpperCase()}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Impossible de rejoindre le salon.");
    }
    const data = await response.json();
    return data.state;
  },

  /**
   * Subscribe to real-time snapshot modifications of the room document list (SSE onSnapshot).
   * Returns a cleanup function to unsubscribe.
   */
  onSnapshot: (code: string, callback: (data: GameState) => void): (() => void) => {
    const formattedCode = code.toUpperCase();
    const eventSource = new EventSource(`/api/rooms/${formattedCode}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const state: GameState = JSON.parse(event.data);
        if (state) {
          callback(state);
        }
      } catch (err) {
        console.error("Erreur de traitement des données de flux réel-temps:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("Retrying real-time connection stream for room:", formattedCode);
    };

    return () => {
      eventSource.close();
    };
  }
};
