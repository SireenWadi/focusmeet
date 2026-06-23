<div align="center">

<img src="https://img.shields.io/badge/FocusMeet-Premium%20SaaS-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMkwzIDZ2OGw3IDQgNy00VjZMMTAgMnoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEwIDJsNyA0LTcgNC03LTQgNy00eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zIDEwbDcgNCA3LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=" alt="FocusMeet"/>

# FocusMeet

### The premium micro-meeting platform for focused teams

*Structured agendas · Live shared notes · Hard time limits · Real-time collaboration*

<br/>

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10-FF0055?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

[**Live Demo**](https://focusmeet.app) · [**Documentation**](#-documentation) · [**Report Bug**](https://github.com/yourusername/focusmeet/issues) · [**Request Feature**](https://github.com/yourusername/focusmeet/issues)

<br/>

![FocusMeet Hero Screenshot](https://placehold.co/1200x600/030507/a5b4fc?text=FocusMeet+Screenshot&font=inter)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Asset Catalog](#-asset-catalog)
- [API Reference](#-api-reference)
- [Socket.io Events](#-socketio-events)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**FocusMeet** is a production-grade, full-stack SaaS micro-meeting platform engineered for small teams who value their time. It combines real-time video communication, collaborative tools, and AI-powered summaries into a single distraction-free interface.

> Built as a commercial product — not a demo. Every feature is functional, production-ready, and designed to a premium standard.

### Why FocusMeet?

| Problem | FocusMeet Solution |
|---|---|
| Meetings run over time | Hard countdown timer synced across all participants |
| No clear outcomes | Shared live notes captured and exported automatically |
| Context lost after calls | AI-powered meeting summaries with unique document codes |
| Scattered tools | Integrated whiteboard, chat, and screen recording in one place |
| Setup friction | Room created in under 5 seconds — no downloads needed |

---

## ✨ Features

### 🎥 Core Meeting Experience
- **Real-time video** via native `getUserMedia` API — no plugins required
- **Grid & Spotlight layouts** that fluidly fill available space on toggle
- **Floating Dock** — auto-hides after 4 seconds of inactivity, springs back on mouse movement
- **Up to 5 participants** per room for focused micro-meetings
- **Participant presence** — join/leave events with live status indicators

### 📝 Collaboration Tools
- **Live Shared Notes** — real-time sync via WebSockets with localStorage persistence
- **Collaborative Whiteboard** — pen, eraser, line, rectangle, ellipse tools with 12-color palette and undo/redo
- **Quick Agenda** — checklist items synced across all participants
- **In-meeting Chat** — with system join/leave messages

### ⏱️ Time Management
- **Server-synced countdown timer** — all participants see the same time regardless of join order
- **Visual progress ring** — color shifts green → amber → red as time runs low
- **Auto-end** when timer reaches zero with graceful session close

### 🤖 AI & Summaries
- **AI Meeting Summary** — powered by OpenAI GPT-4o-mini, generated from shared notes
- **Structured export** — unique document code (`FM-ROOMID-YYMMDD`) per session
- **Editable notes** in the summary view before download
- **One-click download** as `.txt` with full participant list and timestamps

### 🔐 Authentication & Dashboard
- **JWT authentication** — guest access (no signup) or persistent account
- **Google Sign-In** integration
- **User dashboard** — meeting history, past notes, AI summaries, plan status
- **Calendar integration** — generate Google Calendar & Outlook invite links

### 💳 Billing
- **Stripe Checkout** — Pro plan subscription with webhook support
- **Plan gating** — Free / Pro tiers with feature differences
- **Upgrade flow** — in-app upgrade button redirects to Stripe-hosted checkout

### 📹 Recording
- **Screen recording** via `MediaRecorder` API — captures full screen with audio
- **Webcam audio mixing** — blends microphone with screen audio
- **In-browser download** — `.webm` file saved directly after session

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 4.4 | Build tool & dev server |
| Tailwind CSS | 3.3 | Utility-first styling |
| Framer Motion | 10 | Animations & transitions |
| Socket.io Client | 4.7 | Real-time communication |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 4.18 | HTTP server |
| Socket.io | 4.7 | WebSockets |
| jsonwebtoken | 9 | JWT authentication |
| OpenAI SDK | 4.20 | AI summaries |
| Stripe | 14 | Payment processing |
| uuid | 9 | Room ID generation |

### Design System
- **Glassmorphism** — `backdrop-filter: blur()` with layered translucent surfaces
- **3-layer hero parallax** — background video + floating 3D mesh PNG + glass card
- **Dark palette** — `#030507` base with indigo accent (`#6366f1`) and cyan secondary (`#06b6d4`)
- **Typography** — Inter (body) + DM Sans (display headings)

---

## 📁 Project Structure

```
focusmeet/
│
├── backend/                          # Node.js + Express server
│   ├── server.js                     # Main server — Socket.io, REST API, auth, AI, Stripe
│   ├── package.json
│   ├── .env.example                  # Environment variable template
│   └── Dockerfile
│
├── frontend/                         # React + Vite application
│   ├── index.html
│   ├── vite.config.js                # Dev proxy to backend
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── nginx.conf                    # Production nginx config for SPA
│   ├── Dockerfile
│   │
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Root router + global state
│       │
│       ├── context/
│       │   ├── SocketContext.jsx     # Socket.io singleton provider
│       │   └── AuthContext.jsx       # JWT auth state (guest + Google)
│       │
│       ├── hooks/
│       │   ├── useWebcam.js          # navigator.mediaDevices.getUserMedia
│       │   ├── useRoomTimer.js       # Server-synced countdown
│       │   └── useScreenRecorder.js  # MediaRecorder screen capture
│       │
│       ├── components/
│       │   ├── Navbar.jsx            # Sticky nav with smooth scroll + auth state
│       │   ├── HeroSection.jsx       # 3-layer cinematic hero + parallax
│       │   ├── FeaturesSection.jsx   # Feature cards grid
│       │   ├── HowItWorksSection.jsx # Numbered step flow
│       │   ├── PricingSection.jsx    # Monthly/annual pricing toggle
│       │   ├── CreateRoom.jsx        # Create/join room with validation
│       │   ├── MeetingRoom.jsx       # Main meeting interface + floating dock
│       │   ├── Sidebar.jsx           # Notes, chat, timer, agenda, AI panel
│       │   ├── Whiteboard.jsx        # Collaborative canvas (5 tools, 12 colors)
│       │   ├── SummaryPage.jsx       # Post-meeting summary + export
│       │   └── Footer.jsx
│       │
│       ├── pages/
│       │   ├── LandingPage.jsx       # Full marketing landing page
│       │   └── Dashboard.jsx         # Protected user dashboard
│       │
│       └── assets/
│           └── css/
│               └── globals.css       # Glassmorphism utilities + Tailwind base
│
├── docker-compose.yml                # Full-stack Docker setup
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **npm** 9+ (included with Node.js)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/focusmeet.git
cd focusmeet
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment

```bash
# Copy the example env file
cd ../backend
cp .env.example .env
```

Edit `backend/.env` with your values (see [Environment Variables](#-environment-variables)).

Create `frontend/.env`:
```bash
echo "VITE_SOCKET_URL=http://localhost:4000" > frontend/.env
```

### 4. Run the development servers

Open **two terminal windows**:

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# ✅ Server running on http://localhost:4000

# Terminal 2 — Frontend
cd frontend && npm run dev
# ✅ App running on http://localhost:3000
```

### 5. Open in browser

Navigate to **[http://localhost:3000](http://localhost:3000)**

> The app works fully without any optional API keys (OpenAI, Stripe). AI summaries fall back to a structured plain-text format, and billing shows a configuration message.

---

## 🔑 Environment Variables

### `backend/.env`

```env
# ── Required ──────────────────────────────────────────────────────────────────
PORT=4000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-minimum-64-character-random-secret-key-change-in-production

# ── AI Summaries (optional) ───────────────────────────────────────────────────
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# ── Stripe Billing (optional) ─────────────────────────────────────────────────
# Get from: https://dashboard.stripe.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# ── Production only ───────────────────────────────────────────────────────────
NODE_ENV=production
```

### `frontend/.env`

```env
VITE_SOCKET_URL=http://localhost:4000
# In production:
# VITE_SOCKET_URL=https://api.yourdomain.com
```

---

## 🖼️ Asset Catalog

Place all media files in `frontend/public/assets/`. The application runs without them — they are decorative overlays.

### Videos

| Filename | Section | Description |
|---|---|---|
| `hero-bg-layer1.mp4` | Hero (Layer 1 background) | Dark abstract fluid / nebula, 4K, looping, no audio |
| `participant-loop-1.mp4` | Hero preview card (main tile) | Person at desk, natural expression, soft lighting, looping |
| `participant-loop-2.mp4` | Meeting room — Alex M. tile | Same style, different person |
| `participant-loop-3.mp4` | Meeting room — Jamie L. tile | Same style, different person |

**Source:** [Pexels Videos](https://pexels.com/videos) · [Mixkit](https://mixkit.co) · [Coverr](https://coverr.co)

### Images

| Filename | Section | Style Guide |
|---|---|---|
| `floating-mesh.png` | Hero (Layer 2 parallax) | Transparent PNG · 3D glowing crystal mesh · electric blue/indigo · no background |
| `features-bg.jpg` | Features section | Dark circuit board / geometric grid · deep navy · subtle glow lines |
| `how-it-works-bg.jpg` | How it works | Dark topographic contour lines · deep charcoal |
| `pricing-bg.jpg` | Pricing section | Black marble texture · subtle white veining · seamless |
| `create-room-bg.jpg` | Create / Join page | Dark bokeh depth-of-field · glowing orbs |
| `meeting-room-bg.jpg` | Active meeting room | Dark studio / server room · horizontal glow lines |
| `dashboard-bg.jpg` | User dashboard | Dark tech grid · glowing nodes · deep navy |
| `teams-bg.jpg` | "Teams that ship fast" | Dark blurred workspace / office · premium bokeh |
| `summary-bg.jpg` | Meeting summary page | Dark aurora gradient · emerald / indigo soft glow |

**Source:** [Unsplash](https://unsplash.com) (search terms above) · [Freepik](https://freepik.com) for the PNG mesh

### Textures

| Filename | Usage | How to generate |
|---|---|---|
| `noise.png` | Subtle grain overlay (3% opacity) | [fffuel.co/nnoise](https://fffuel.co/nnoise) · 200×200px · monochrome |

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Body | Response | Description |
|---|---|---|---|---|
| `POST` | `/auth/guest` | `{ name }` | `{ token, user }` | Sign in as guest (no account) |
| `POST` | `/auth/google` | `{ name, email, picture }` | `{ token, user }` | Sign in with Google credentials |
| `GET`  | `/auth/me` | — | `{ user }` | Get current authenticated user |

### Rooms

| Method | Endpoint | Body | Response | Description |
|---|---|---|---|---|
| `POST` | `/rooms` | `{ name, duration }` | `{ roomId, name, duration }` | Create a new meeting room |
| `GET`  | `/rooms/:roomId` | — | Room metadata | Fetch room details |

### Dashboard

| Method | Endpoint | Auth | Response | Description |
|---|---|---|---|---|
| `GET` | `/dashboard` | ✅ Bearer | `{ user, meetings[] }` | Get user profile + meeting history |

### AI

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/ai/summary` | ✅ Bearer | `{ notes, roomName, duration }` | `{ summary, model }` |

### Billing

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/stripe/checkout` | ✅ Bearer | Create Stripe Checkout session → returns `{ url }` |
| `POST` | `/stripe/webhook` | Stripe signature | Handle subscription events |

### Calendar

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/calendar/link` | ✅ Bearer | `{ roomId, roomName, startTime, durationMin }` | `{ google, outlook, roomUrl }` |

### Health

| Method | Endpoint | Response |
|---|---|---|
| `GET` | `/health` | `{ status: "ok", ts }` |

---

## 📨 Socket.io Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join:room` | `{ roomId, user }` | Join or create a room |
| `notes:update` | `{ roomId, notes }` | Broadcast note change to peers |
| `agenda:update` | `{ roomId, agenda }` | Sync agenda item state |
| `whiteboard:draw` | `{ roomId, stroke }` | Broadcast a draw stroke |
| `whiteboard:clear` | `{ roomId }` | Clear the entire canvas |
| `whiteboard:undo` | `{ roomId }` | Undo last stroke |
| `timer:start` | `{ roomId }` | Start the countdown |
| `timer:pause` | `{ roomId }` | Pause the countdown |
| `timer:reset` | `{ roomId }` | Reset to full duration |
| `media:state` | `{ roomId, muted, camOff }` | Broadcast mic/camera state |
| `recording:start` | `{ roomId }` | Notify peers recording started |
| `recording:stop` | `{ roomId }` | Notify peers recording stopped |
| `chat:message` | `{ roomId, message }` | Send a chat message |
| `webrtc:offer` | `{ to, offer }` | Forward WebRTC offer |
| `webrtc:answer` | `{ to, answer }` | Forward WebRTC answer |
| `webrtc:ice` | `{ to, candidate }` | Forward ICE candidate |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room:state` | `{ name, duration, notes, agenda, whiteboard }` | Full state snapshot on join |
| `notes:sync` | `string` | Live notes update from another user |
| `agenda:sync` | `AgendaItem[]` | Updated agenda state |
| `whiteboard:draw` | `Stroke` | Remote draw stroke |
| `whiteboard:clear` | — | Canvas cleared remotely |
| `whiteboard:undo` | — | Undo from remote user |
| `participants:update` | `Participant[]` | Current participant list |
| `timer:state` | `{ remaining, total, running }` | Full timer snapshot |
| `timer:tick` | `{ remaining, total }` | Every-second tick |
| `timer:ended` | — | Countdown reached zero |
| `media:state` | `{ userId, muted, camOff }` | Peer media toggle |
| `recording:state` | `{ recording }` | Recording status change |
| `chat:message` | `{ id, user, message, ts }` | Incoming message |
| `user:joined` | `User` | New participant joined |
| `user:left` | `User` | Participant disconnected |

---

## 🚢 Deployment

### Docker (recommended)

```bash
# Build and run the full stack
docker-compose up --build

# Services:
# Backend  → http://localhost:4000
# Frontend → http://localhost:3000
```

### Manual Production

```bash
# Build frontend
cd frontend && npm run build
# Output: frontend/dist/

# Start backend
cd backend && NODE_ENV=production node server.js
```

### Platform Recommendations

| Service | Recommended For |
|---|---|
| [Railway](https://railway.app) | Backend (Node.js + WebSocket support) |
| [Vercel](https://vercel.com) | Frontend (static build from `dist/`) |
| [Render](https://render.com) | Full-stack (both services) |
| [Fly.io](https://fly.io) | Backend with Docker |

### Production Checklist

- [ ] Set `JWT_SECRET` to a cryptographically random 64-character string
- [ ] Set `CLIENT_URL` to your frontend domain (e.g. `https://focusmeet.app`)
- [ ] Set `VITE_SOCKET_URL` to your backend domain
- [ ] Configure Stripe webhook endpoint: `POST /api/stripe/webhook`
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set `NODE_ENV=production`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation change
style:    Formatting (no logic change)
refactor: Code restructure (no feature/fix)
perf:     Performance improvement
chore:    Build, deps, tooling
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with precision for teams that value their time.**

[⭐ Star this repo](https://github.com/sireenwadi/focusmeet) if FocusMeet helped you ship faster.

<br/>

Made by [Sireen](https://github.com/Sireenwadi) · Powered by React, Node.js & Socket.io

</div>
