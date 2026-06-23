/**
 * FocusMeet — Production Backend Server v2.0
 * Express + Socket.io + OpenAI + Stripe + JWT Auth
 */
require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const { v4: uuid } = require("uuid");
const jwt        = require("jsonwebtoken");

const app    = express();
const server = http.createServer(app);

const CLIENT_URL  = process.env.CLIENT_URL || "http://localhost:3000";
const JWT_SECRET  = process.env.JWT_SECRET  || "focusmeet-dev-secret-change-in-prod";
const PORT        = process.env.PORT         || 4000;

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET","POST"], credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Stripe webhook needs raw body — must come BEFORE express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "2mb" }));

// ─── In-Memory Stores ─────────────────────────────────────────────────────────
// rooms: Map<roomId, RoomState>
const rooms = new Map();
// users: Map<userId, UserRecord>  (simulates DB for demo)
const users = new Map();
// meetings history: Map<userId, MeetingRecord[]>
const meetingHistory = new Map();

// ─── Room helpers ─────────────────────────────────────────────────────────────
const COLORS = ["#6366f1","#06b6d4","#8b5cf6","#10b981","#f59e0b","#ec4899","#ef4444","#3b82f6"];

function getRoom(roomId) {
  if (!rooms.has(roomId)) return null;
  return rooms.get(roomId);
}

function createRoom(roomId, name, duration) {
  const room = {
    id: roomId,
    name,
    duration,
    createdAt: Date.now(),
    notes: "",
    agenda: [
      { id: uuid(), text: "Opening & context",       done: false },
      { id: uuid(), text: "Main discussion",          done: false },
      { id: uuid(), text: "Action items & owners",   done: false },
    ],
    whiteboard: [],          // array of draw strokes
    participants: new Map(), // socketId → participant
    timerStartedAt: null,
    timerPaused: false,
    timerElapsed: 0,
    _timerInterval: null,
    recording: false,
  };
  rooms.set(roomId, room);
  return room;
}

function roomPublicState(room) {
  return {
    id:           room.id,
    name:         room.name,
    duration:     room.duration,
    createdAt:    room.createdAt,
    notes:        room.notes,
    agenda:       room.agenda,
    whiteboard:   room.whiteboard,
    recording:    room.recording,
    participantCount: room.participants.size,
  };
}

function broadcastParticipants(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("participants:update", Array.from(room.participants.values()));
}

function broadcastTimer(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const total    = room.duration * 60;
  let   elapsed  = room.timerElapsed;
  if (room.timerStartedAt && !room.timerPaused) {
    elapsed += Math.floor((Date.now() - room.timerStartedAt) / 1000);
  }
  const remaining = Math.max(0, total - elapsed);
  io.to(roomId).emit("timer:state", {
    remaining,
    total,
    running: !!(room.timerStartedAt && !room.timerPaused),
    elapsed,
  });
}

function startTimerInterval(room) {
  if (room._timerInterval) return;
  room._timerInterval = setInterval(() => {
    if (!rooms.has(room.id)) { clearInterval(room._timerInterval); return; }
    const r        = rooms.get(room.id);
    if (!r.timerStartedAt || r.timerPaused) return;
    const total    = r.duration * 60;
    const elapsed  = r.timerElapsed + Math.floor((Date.now() - r.timerStartedAt) / 1000);
    const remaining = Math.max(0, total - elapsed);
    io.to(room.id).emit("timer:tick", { remaining, total });
    if (remaining <= 0) {
      clearInterval(r._timerInterval);
      r._timerInterval = null;
      r.timerStartedAt = null;
      io.to(room.id).emit("timer:ended");
    }
  }, 1000);
}

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── REST API ─────────────────────────────────────────────────────────────────

/* Health */
app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

/* ── Auth ── */
// Demo Google OAuth simulation — in production wire up real Google OAuth
app.post("/api/auth/google", (req, res) => {
  const { credential, name, email, picture } = req.body;
  if (!email || !name) return res.status(400).json({ error: "Missing fields" });
  let userId = email; // use email as stable ID
  if (!users.has(userId)) {
    users.set(userId, { id: userId, name, email, picture: picture || "", plan: "free", createdAt: Date.now() });
  }
  const user  = users.get(userId);
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, plan: user.plan }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, picture: user.picture, plan: user.plan } });
});

app.post("/api/auth/guest", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Name must be at least 2 characters" });
  const guestId = "guest_" + uuid().slice(0,8);
  const token   = jwt.sign({ id: guestId, name: name.trim(), email: null, plan: "guest" }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: guestId, name: name.trim(), email: null, plan: "guest" } });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = users.get(req.user.id) || req.user;
  res.json({ user });
});

/* ── Rooms ── */
app.post("/api/rooms", (req, res) => {
  const { name, duration = 25 } = req.body;
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Meeting name must be at least 2 characters" });
  if (![15,25,45,60].includes(Number(duration))) return res.status(400).json({ error: "Invalid duration" });
  const roomId = uuid().slice(0,8).toUpperCase();
  createRoom(roomId, name.trim(), Number(duration));
  res.json({ roomId, name: name.trim(), duration: Number(duration) });
});

app.get("/api/rooms/:roomId", (req, res) => {
  const room = getRoom(req.params.roomId.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(roomPublicState(room));
});

/* ── Dashboard (protected) ── */
app.get("/api/dashboard", authMiddleware, (req, res) => {
  const history = meetingHistory.get(req.user.id) || [];
  const user    = users.get(req.user.id) || req.user;
  res.json({ user, meetings: history.slice().reverse().slice(0, 20) });
});

/* ── AI Notes Summary ── */
app.post("/api/ai/summary", authMiddleware, async (req, res) => {
  const { notes, roomName, duration } = req.body;
  if (!notes || notes.trim().length < 10) {
    return res.status(400).json({ error: "Notes too short to summarize" });
  }

  if (!process.env.OPENAI_API_KEY) {
    // Fallback structured summary without OpenAI
    const lines   = notes.split("\n").filter(l => l.trim());
    const actions = lines.filter(l => /^→|^-|action|todo/i.test(l));
    return res.json({
      summary: `## Meeting: ${roomName}\n**Duration:** ${Math.floor(duration/60)}m ${duration%60}s\n\n### Key Points\n${lines.slice(0,5).map(l=>`- ${l}`).join("\n")}\n\n### Action Items\n${actions.length ? actions.map(l=>`- ${l}`).join("\n") : "- No explicit action items recorded."}`,
      model: "fallback",
    });
  }

  try {
    const { OpenAI } = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      messages: [
        { role: "system", content: "You are a professional meeting assistant. Generate a concise, structured markdown summary." },
        { role: "user",   content: `Meeting: ${roomName}\nDuration: ${Math.floor(duration/60)}m\n\nNotes:\n${notes}\n\nGenerate: title, key discussion points (bullet list), decisions made, action items with owners. Use markdown.` },
      ],
    });
    res.json({ summary: completion.choices[0].message.content, model: "gpt-4o-mini" });
  } catch (err) {
    res.status(500).json({ error: "AI summary failed: " + err.message });
  }
});

/* ── Stripe Billing ── */
app.post("/api/stripe/checkout", authMiddleware, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe not configured" });
  }
  try {
    const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${CLIENT_URL}/dashboard?upgraded=true`,
      cancel_url:  `${CLIENT_URL}/?cancelled=true`,
      client_reference_id: req.user.id,
      customer_email: req.user.email || undefined,
      metadata: { userId: req.user.id },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.json({ received: true });
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const event  = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      const userId = event.data.object.metadata?.userId;
      if (userId && users.has(userId)) {
        users.get(userId).plan = "pro";
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send("Webhook error: " + err.message);
  }
});

/* ── Calendar Link Generator ── */
app.post("/api/calendar/link", authMiddleware, (req, res) => {
  const { roomId, roomName, startTime, durationMin = 25 } = req.body;
  const start = new Date(startTime || Date.now());
  const end   = new Date(start.getTime() + durationMin * 60000);
  const fmt   = d => d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  const roomUrl = `${CLIENT_URL}/room/${roomId}`;
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent("FocusMeet: " + roomName)}`
    + `&dates=${fmt(start)}/${fmt(end)}`
    + `&details=${encodeURIComponent("Join at: " + roomUrl)}`
    + `&location=${encodeURIComponent(roomUrl)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent("FocusMeet: "+roomName)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent("Join at: "+roomUrl)}`;
  res.json({ google: googleUrl, outlook: outlookUrl, roomUrl });
});

// ─── Socket.io Events ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  let currentRoomId = null;
  let currentUser   = null;

  // ── join:room
  socket.on("join:room", ({ roomId, user }) => {
    const id = (roomId || "").toUpperCase();
    if (!id) return;
    currentRoomId = id;
    let room = getRoom(id);
    if (!room) room = createRoom(id, "Meeting Room", 25);

    const colorIdx = room.participants.size % COLORS.length;
    currentUser = {
      id:        socket.id,
      userId:    user?.id    || socket.id,
      name:      (user?.name || "Guest").trim().slice(0,40),
      initials:  (user?.name || "G").trim().slice(0,2).toUpperCase(),
      color:     COLORS[colorIdx],
      joinedAt:  Date.now(),
      muted:     false,
      camOff:    false,
    };
    room.participants.set(socket.id, currentUser);
    socket.join(id);

    // Send full room state to new joiner
    socket.emit("room:state", {
      name:       room.name,
      duration:   room.duration,
      notes:      room.notes,
      agenda:     room.agenda,
      whiteboard: room.whiteboard,
      recording:  room.recording,
    });
    broadcastParticipants(id);
    broadcastTimer(id);
    socket.to(id).emit("user:joined", currentUser);
  });

  // ── WebRTC signaling
  socket.on("webrtc:offer",     ({ to, offer })     => io.to(to).emit("webrtc:offer",     { from: socket.id, offer }));
  socket.on("webrtc:answer",    ({ to, answer })    => io.to(to).emit("webrtc:answer",    { from: socket.id, answer }));
  socket.on("webrtc:ice",       ({ to, candidate }) => io.to(to).emit("webrtc:ice",       { from: socket.id, candidate }));

  // ── Notes
  socket.on("notes:update", ({ roomId, notes }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.notes = (notes || "").slice(0, 20000);
    socket.to(roomId).emit("notes:sync", room.notes);
  });

  // ── Agenda
  socket.on("agenda:update", ({ roomId, agenda }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.agenda = agenda;
    socket.to(roomId).emit("agenda:sync", agenda);
  });

  // ── Whiteboard
  socket.on("whiteboard:draw", ({ roomId, stroke }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.whiteboard.push(stroke);
    if (room.whiteboard.length > 5000) room.whiteboard.splice(0, 1000); // cap
    socket.to(roomId).emit("whiteboard:draw", stroke);
  });
  socket.on("whiteboard:clear", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.whiteboard = [];
    io.to(roomId).emit("whiteboard:clear");
  });
  socket.on("whiteboard:undo", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room || !room.whiteboard.length) return;
    room.whiteboard.pop();
    io.to(roomId).emit("whiteboard:undo");
  });

  // ── Timer
  socket.on("timer:start", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room || (room.timerStartedAt && !room.timerPaused)) return;
    room.timerStartedAt = Date.now();
    room.timerPaused    = false;
    startTimerInterval(room);
    broadcastTimer(roomId);
  });
  socket.on("timer:pause", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room || !room.timerStartedAt || room.timerPaused) return;
    room.timerElapsed  += Math.floor((Date.now() - room.timerStartedAt) / 1000);
    room.timerStartedAt = null;
    room.timerPaused    = true;
    broadcastTimer(roomId);
  });
  socket.on("timer:reset", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;
    if (room._timerInterval) { clearInterval(room._timerInterval); room._timerInterval = null; }
    room.timerStartedAt = null;
    room.timerPaused    = false;
    room.timerElapsed   = 0;
    broadcastTimer(roomId);
  });

  // ── Media state sync (mute/cam toggle broadcast)
  socket.on("media:state", ({ roomId, muted, camOff }) => {
    const room = getRoom(roomId);
    if (!room || !currentUser) return;
    currentUser.muted  = muted;
    currentUser.camOff = camOff;
    room.participants.set(socket.id, currentUser);
    socket.to(roomId).emit("media:state", { userId: socket.id, muted, camOff });
    broadcastParticipants(roomId);
  });

  // ── Recording state
  socket.on("recording:start", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.recording = true;
    io.to(roomId).emit("recording:state", { recording: true });
  });
  socket.on("recording:stop", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.recording = false;
    io.to(roomId).emit("recording:state", { recording: false });
  });

  // ── Chat
  socket.on("chat:message", ({ roomId, message }) => {
    if (!currentUser || !message?.trim()) return;
    io.to(roomId).emit("chat:message", {
      id:      uuid(),
      user:    { ...currentUser },
      message: message.trim().slice(0, 1000),
      ts:      Date.now(),
    });
  });

  // ── Disconnect
  socket.on("disconnect", () => {
    if (!currentRoomId) return;
    const room = getRoom(currentRoomId);
    if (!room) return;
    room.participants.delete(socket.id);
    broadcastParticipants(currentRoomId);
    if (currentUser) {
      socket.to(currentRoomId).emit("user:left", currentUser);
      // Save to history if authenticated
      if (currentUser.userId && !currentUser.userId.startsWith("guest_")) {
        const hist = meetingHistory.get(currentUser.userId) || [];
        const existing = hist.find(m => m.roomId === currentRoomId);
        if (!existing) {
          hist.push({ roomId: currentRoomId, roomName: room.name, joinedAt: currentUser.joinedAt, leftAt: Date.now() });
          meetingHistory.set(currentUser.userId, hist);
        }
      }
    }
    if (room.participants.size === 0) {
      setTimeout(() => {
        const r = rooms.get(currentRoomId);
        if (r && r.participants.size === 0) {
          if (r._timerInterval) clearInterval(r._timerInterval);
          rooms.delete(currentRoomId);
        }
      }, 30 * 60 * 1000);
    }
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 FocusMeet server  →  http://localhost:${PORT}`);
  console.log(`   Socket.io         →  ws://localhost:${PORT}`);
  console.log(`   Environment       →  ${process.env.NODE_ENV || "development"}\n`);
});
