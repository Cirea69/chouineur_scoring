import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Room {
  code: string;
  state: any;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for rooms
const rooms: Record<string, Room> = {};

// Keep track of connected SSE clients per room code
const clients: Record<string, express.Response[]> = {};

// Helper to broadcast changes to all SSE clients in a room
function broadcastToRoom(code: string, data: any) {
  const formattedCode = code.toUpperCase();
  const roomClients = clients[formattedCode] || [];
  const payload = JSON.stringify(data);
  
  // Clean up stale client connections in the process
  const activeClients: express.Response[] = [];
  
  for (const res of roomClients) {
    try {
      res.write(`data: ${payload}\n\n`);
      activeClients.push(res);
    } catch (e) {
      // client disconnected
    }
  }
  clients[formattedCode] = activeClients;
}

// 1. Check if a room exists
app.get("/api/rooms/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: `Le salon ${code} n'existe pas.` });
  }
  res.json(room);
});

// 2. Create or initialize a room
app.post("/api/rooms", (req, res) => {
  const { code, state } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code du salon requis." });
  }
  const formattedCode = code.toUpperCase();
  rooms[formattedCode] = {
    code: formattedCode,
    state: state || {}
  };
  res.json(rooms[formattedCode]);
});

// 3. Update room state (Write by Host/GM)
app.post("/api/rooms/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const { state } = req.body;
  
  if (!rooms[code]) {
    rooms[code] = { code, state: state || {} };
  } else {
    rooms[code].state = state || rooms[code].state;
  }
  
  // Broadcast update to all clients subscribed to this room
  broadcastToRoom(code, rooms[code].state);
  res.json({ success: true, room: rooms[code] });
});

// 4. Join a room (Atomic additions to users)
app.post("/api/rooms/:code/join", (req, res) => {
  const code = req.params.code.toUpperCase();
  const { player } = req.body;
  
  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: `Le salon ${code} n'existe pas.` });
  }

  if (!player || !player.id) {
    return res.status(400).json({ error: "Joueur invalide." });
  }

  // Ensure room state exists and has players array
  if (!room.state) {
    room.state = {};
  }
  if (!room.state.players) {
    room.state.players = [];
  }

  // Add player without duplicates (analogous to arrayUnion)
  const playerExists = room.state.players.some((p: any) => p.id === player.id);
  if (!playerExists) {
    room.state.players.push(player);
    // Broadcast active join in real-time
    broadcastToRoom(code, room.state);
  }

  res.json({ success: true, state: room.state });
});

// 5. Server-Sent Events (SSE) stream for real-time subscription
app.get("/api/rooms/:code/stream", (req, res) => {
  const code = req.params.code.toUpperCase();
  
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.flushHeaders();

  // Add client to active list
  if (!clients[code]) {
    clients[code] = [];
  }
  clients[code].push(res);

  // Send current state immediately on connection, if it exists
  const room = rooms[code];
  if (room && room.state) {
    res.write(`data: ${JSON.stringify(room.state)}\n\n`);
  }

  // Periodic heartbeat ping to keep connection alive behind reverse proxies / nginx
  const pingInterval = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch (e) {
      clearInterval(pingInterval);
    }
  }, 15000);

  // Handle client disconnect
  req.on("close", () => {
    clearInterval(pingInterval);
    clients[code] = (clients[code] || []).filter(client => client !== res);
  });
});

// 6. Vite Integration and serving static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
