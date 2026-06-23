/**
 * Sidebar.jsx — Production panel
 * Notes: persisted in ref + localStorage, exported on demand
 * Timer: server-synced circular progress
 * Chat, Agenda, AI Summary, People tabs
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomTimer } from "../hooks/useRoomTimer";

const TABS = ["Notes","Chat","People"];
const API  = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

// Stable storage key for notes per room
const notesKey = (roomId) => `fm_notes_${roomId}`;

export default function Sidebar({ socket, roomId, roomName, duration, user, onNotesChange }) {
  const [tab,          setTab]          = useState("Notes");
  const [notes,        setNotesState]   = useState(() => {
    try { return localStorage.getItem(notesKey(roomId)) || ""; } catch { return ""; }
  });
  const [agenda,       setAgenda]       = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messages,     setMessages]     = useState([]);
  const [chatInput,    setChatInput]    = useState("");
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiSummary,    setAiSummary]    = useState("");

  // notesRef always holds the latest value — used for export without stale closure
  const notesRef   = useRef(notes);
  const textareaRef = useRef(null);
  const chatEndRef  = useRef(null);
  const timer = useRoomTimer(socket, roomId);

  // Keep notesRef in sync + persist to localStorage
  const setNotes = useCallback((val) => {
    notesRef.current = val;
    setNotesState(val);
    onNotesChange?.(val);         // notify parent (MeetingRoom) for summary export
    try { localStorage.setItem(notesKey(roomId), val); } catch {}
  }, [roomId, onNotesChange]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("room:state", (s) => {
      // Merge: prefer local notes if longer (user typed more)
      const serverNotes = s.notes || "";
      const localNotes  = notesRef.current;
      const merged = localNotes.length >= serverNotes.length ? localNotes : serverNotes;
      setNotes(merged);
      setAgenda(s.agenda || []);
    });

    socket.on("notes:sync", (incoming) => {
      // Only update from remote if textarea is NOT focused
      if (document.activeElement !== textareaRef.current) {
        if (incoming.length > notesRef.current.length) setNotes(incoming);
        else setNotesState(incoming); // visual only update
      }
    });

    socket.on("agenda:sync",         setAgenda);
    socket.on("participants:update",  setParticipants);
    socket.on("chat:message", (m)  => setMessages(p => [...p, m]));
    socket.on("user:joined",  (u)  => setMessages(p => [...p, { id:Date.now(), system:true, message:`${u.name} joined` }]));
    socket.on("user:left",    (u)  => setMessages(p => [...p, { id:Date.now(), system:true, message:`${u.name} left` }]));

    return () => {
      ["room:state","notes:sync","agenda:sync","participants:update","chat:message","user:joined","user:left"]
        .forEach(e => socket.off(e));
    };
  }, [socket, setNotes]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  // Notes change handler — debounced emit
  const emitTimer = useRef(null);
  const handleNotesChange = useCallback((e) => {
    const val = e.target.value;
    setNotes(val);
    clearTimeout(emitTimer.current);
    emitTimer.current = setTimeout(() => {
      socket?.emit("notes:update", { roomId, notes: val });
    }, 300);
  }, [socket, roomId, setNotes]);

  // Agenda toggle
  const toggleAgenda = useCallback((id) => {
    setAgenda(prev => {
      const next = prev.map(i => i.id === id ? { ...i, done: !i.done } : i);
      socket?.emit("agenda:update", { roomId, agenda: next });
      return next;
    });
  }, [socket, roomId]);

  // Chat send
  const sendChat = useCallback(() => {
    const m = chatInput.trim();
    if (!m) return;
    socket?.emit("chat:message", { roomId, message: m });
    setChatInput("");
  }, [socket, roomId, chatInput]);

  // AI Summary
  const generateAI = useCallback(async () => {
    const currentNotes = notesRef.current;
    if (!currentNotes.trim() || aiLoading) return;
    setAiLoading(true); setAiSummary("");
    try {
      const token = localStorage.getItem("fm_token");
      const r = await fetch(`${API}/api/ai/summary`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ notes: currentNotes, roomName, duration: timer.total }),
      });
      const d = await r.json();
      setAiSummary(r.ok ? d.summary : "⚠️ " + (d.error || "AI failed"));
    } catch { setAiSummary("⚠️ Network error"); }
    finally { setAiLoading(false); }
  }, [roomName, timer.total, aiLoading]);

  // Expose getCurrentNotes to parent via ref trick
  useEffect(() => {
    if (socket) socket._getCurrentNotes = () => notesRef.current;
  }, [socket]);

  const tc   = timer.pct > 0.5 ? "#22c55e" : timer.pct > 0.25 ? "#f59e0b" : "#ef4444";
  const circ = 2 * Math.PI * 27;

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        background:"rgba(3,5,7,0.82)",
        backdropFilter:"blur(28px) saturate(180%)",
        WebkitBackdropFilter:"blur(28px) saturate(180%)",
        borderLeft:"1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Timer ── */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-3">Session timer</div>
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
              <circle cx="32" cy="32" r="27" fill="none" stroke={tc} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - timer.pct)}
                style={{ transition:"stroke-dashoffset 1s linear, stroke 0.5s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black tabular-nums" style={{ color:tc }}>
                {timer.fmt(timer.remaining)}
              </span>
            </div>
          </div>
          {/* Text + controls */}
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold mb-0.5 tabular-nums" style={{ color:tc, letterSpacing:"-0.04em", textShadow:`0 0 20px ${tc}60` }}>
              {timer.fmt(timer.remaining)}
            </div>
            <div className="text-[10px] text-white/25 mb-2 truncate">{roomName} · {duration}m</div>
            <div className="flex gap-2">
              {!timer.running
                ? <Pill onClick={timer.start}  color="#6366f1" label="▶ Start"/>
                : <Pill onClick={timer.pause}  color="#f59e0b" label="⏸ Pause"/>
              }
              <Pill onClick={timer.reset} color="rgba(255,255,255,0.15)" label="↺ Reset" dim/>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3.5 h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width:`${timer.pct*100}%`, background:tc, boxShadow:`0 0 8px ${tc}80` }}/>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200
              ${tab===t ? "text-white border-b-2 border-indigo-500" : "text-white/30 hover:text-white/55 border-b-2 border-transparent"}`}>
            {t}
            {t==="People" && participants.length > 0 && (
              <span className="ml-1 text-[8px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full">{participants.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <AnimatePresence mode="wait">

          {/* Notes tab */}
          {tab === "Notes" && (
            <motion.div key="notes" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}
              className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/25">Shared notes · synced</span>
                    <span className="text-[9px] text-white/20">{notes.length} chars</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    id="fm-shared-notes"
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder={"Type notes here — all participants see updates instantly.\n\nTip: use → for action items, ✓ for completed items"}
                    className="w-full h-44 text-sm text-white/78 placeholder-white/18 leading-relaxed resize-none outline-none rounded-xl p-3"
                    style={{
                      background:"rgba(255,255,255,0.04)",
                      border:"1px solid rgba(255,255,255,0.09)",
                      fontFamily:"inherit",
                      lineHeight:1.65,
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "rgba(99,102,241,0.50)";
                      e.target.style.boxShadow   = "0 0 0 3px rgba(99,102,241,0.10)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(255,255,255,0.09)";
                      e.target.style.boxShadow   = "none";
                      // Emit on blur to ensure sync
                      socket?.emit("notes:update", { roomId, notes: notesRef.current });
                    }}
                  />
                </div>

                {/* Agenda */}
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-3">Quick agenda</div>
                  <div className="space-y-2">
                    {agenda.map(item => (
                      <button key={item.id} onClick={() => toggleAgenda(item.id)}
                        className="w-full flex items-center gap-2.5 text-left group py-0.5">
                        <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                          style={{
                            background: item.done ? "#4f46e5" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${item.done ? "#6366f1" : "rgba(255,255,255,0.14)"}`,
                            boxShadow: item.done ? "0 0 8px rgba(99,102,241,0.40)" : "none",
                          }}>
                          {item.done && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm transition-colors duration-200 ${item.done ? "text-white/25 line-through" : "text-white/62 group-hover:text-white/82"}`}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Summary */}
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2">AI summary</div>
                  <button onClick={generateAI} disabled={aiLoading || !notes.trim()}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-35"
                    style={{ background:"rgba(99,102,241,0.16)", border:"1px solid rgba(99,102,241,0.28)", color:"#a5b4fc" }}>
                    {aiLoading ? "✨ Generating…" : "✨ Generate AI Notes Summary"}
                  </button>
                  {aiSummary && (
                    <div className="mt-3 p-3 rounded-xl text-xs text-white/50 leading-relaxed whitespace-pre-wrap"
                      style={{ background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.14)" }}>
                      {aiSummary}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat tab */}
          {tab === "Chat" && (
            <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}
              className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-white/18 text-xs text-center mt-10">No messages yet</p>}
                {messages.map(m => m.system
                  ? <div key={m.id} className="text-center text-[10px] text-white/20 py-1">{m.message}</div>
                  : (
                    <div key={m.id} className={`flex flex-col ${m.user?.id === socket?.id ? "items-end" : "items-start"}`}>
                      <span className="text-[9px] text-white/25 mb-1 px-1">{m.user?.name}</span>
                      <div className="max-w-[88%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                        style={{
                          background: m.user?.id === socket?.id ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${m.user?.id === socket?.id ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.08)"}`,
                          color:"rgba(255,255,255,0.80)",
                        }}>
                        {m.message}
                      </div>
                    </div>
                  )
                )}
                <div ref={chatEndRef}/>
              </div>
              <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Send a message…"
                  maxLength={500}
                  className="flex-1 py-2 px-3 rounded-xl text-xs text-white/75 placeholder-white/20 outline-none"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)" }}
                />
                <button onClick={sendChat}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors hover:bg-indigo-500/50"
                  style={{ background:"rgba(99,102,241,0.28)", border:"1px solid rgba(99,102,241,0.38)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* People tab */}
          {tab === "People" && (
            <motion.div key="people" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}
              className="flex-1 overflow-y-auto p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-4">
                {participants.length} participant{participants.length !== 1 ? "s" : ""} · live
              </div>
              <div className="space-y-2.5">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background:"rgba(255,255,255,0.04)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background:`${p.color}25`, color:p.color, border:`1px solid ${p.color}40` }}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white/75 font-medium truncate">
                        {p.name}
                        {p.id === socket?.id && <span className="ml-1.5 text-[8px] text-indigo-300 font-bold">you</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.muted   && <span className="text-[9px] text-red-400/65">🔇 Muted</span>}
                        {p.camOff  && <span className="text-[9px] text-white/28">📷 Off</span>}
                        {!p.muted && !p.camOff && <span className="text-[9px] text-emerald-400/65">● Active</span>}
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"/>
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-white/18 text-xs text-center mt-6">Waiting for participants…</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

function Pill({ onClick, color, label, dim }) {
  return (
    <button onClick={onClick}
      className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-150"
      style={{ background:`${color}25`, color: dim ? "rgba(255,255,255,0.35)" : color, border:`1px solid ${color}40` }}>
      {label}
    </button>
  );
}
