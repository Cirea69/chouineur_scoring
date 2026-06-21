var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var rooms = {};
var clients = {};
function broadcastToRoom(code, data) {
  const formattedCode = code.toUpperCase();
  const roomClients = clients[formattedCode] || [];
  const payload = JSON.stringify(data);
  const activeClients = [];
  for (const res of roomClients) {
    try {
      res.write(`data: ${payload}

`);
      activeClients.push(res);
    } catch (e) {
    }
  }
  clients[formattedCode] = activeClients;
}
app.get("/api/rooms/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: `Le salon ${code} n'existe pas.` });
  }
  res.json(room);
});
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
app.post("/api/rooms/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const { state } = req.body;
  if (!rooms[code]) {
    rooms[code] = { code, state: state || {} };
  } else {
    rooms[code].state = state || rooms[code].state;
  }
  broadcastToRoom(code, rooms[code].state);
  res.json({ success: true, room: rooms[code] });
});
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
  if (!room.state) {
    room.state = {};
  }
  if (!room.state.players) {
    room.state.players = [];
  }
  const playerExists = room.state.players.some((p) => p.id === player.id);
  if (!playerExists) {
    room.state.players.push(player);
    broadcastToRoom(code, room.state);
  }
  res.json({ success: true, state: room.state });
});
app.get("/api/rooms/:code/stream", (req, res) => {
  const code = req.params.code.toUpperCase();
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.flushHeaders();
  if (!clients[code]) {
    clients[code] = [];
  }
  clients[code].push(res);
  const room = rooms[code];
  if (room && room.state) {
    res.write(`data: ${JSON.stringify(room.state)}

`);
  }
  const pingInterval = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch (e) {
      clearInterval(pingInterval);
    }
  }, 15e3);
  req.on("close", () => {
    clearInterval(pingInterval);
    clients[code] = (clients[code] || []).filter((client) => client !== res);
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
