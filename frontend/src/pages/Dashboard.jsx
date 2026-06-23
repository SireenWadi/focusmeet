/**
 * Dashboard.jsx — Protected user dashboard
 * Professional dark image background
 */
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

function fmt(ms)     { return new Date(ms).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }); }
function fmtT(ms)    { return new Date(ms).toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" }); }
function fmtDur(ms)  { const s=Math.floor((ms||0)/1000); return `${Math.floor(s/60)}m ${s%60}s`; }
function docCode(id, ts) {
  const d=new Date(ts); const base=(id||"ROOM").replace(/[^A-Z0-9]/gi,"").toUpperCase().slice(0,6);
  return `FM-${base}-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
}

export default function Dashboard({ onStart, onHome }) {
  const { user, token, logout } = useAuth();
  const [meetings,   setMeetings]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState("");
  const [activeM,    setActiveM]   = useState(null);
  const [aiLoading,  setAiLoading] = useState(false);
  const [aiResults,  setAiResults] = useState({});
  const [upgrading,  setUpgrading] = useState(false);
  const [calModal,   setCalModal]  = useState(null);
  const [calLinks,   setCalLinks]  = useState(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/dashboard`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(d => setMeetings(d.meetings || []))
      .catch(e => setError("Could not load dashboard: " + e))
      .finally(() => setLoading(false));
  }, [token]);

  const generateAI = useCallback(async (m) => {
    const notes = m.notes || localStorage.getItem(`fm_notes_${m.roomId}`) || "";
    if (!notes.trim()) return;
    setAiLoading(true);
    try {
      const r = await fetch(`${API}/api/ai/summary`,{
        method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body: JSON.stringify({ notes, roomName:m.roomName, duration: Math.floor((m.leftAt-m.joinedAt)/1000) }),
      });
      const d = await r.json();
      setAiResults(p => ({ ...p, [m.roomId]: r.ok ? d.summary : "⚠️ " + d.error }));
    } catch { setAiResults(p => ({ ...p, [m.roomId]: "⚠️ Network error" })); }
    finally { setAiLoading(false); }
  }, [token]);

  const handleUpgrade = useCallback(async () => {
    setUpgrading(true);
    try {
      const r = await fetch(`${API}/api/stripe/checkout`,{ method:"POST", headers:{ Authorization:`Bearer ${token}` } });
      const d = await r.json();
      if (r.ok && d.url) window.open(d.url,"_blank");
      else alert(d.error || "Add STRIPE_SECRET_KEY to backend .env to enable billing.");
    } catch { alert("Network error"); }
    finally { setUpgrading(false); }
  }, [token]);

  const handleCalendar = useCallback(async (m) => {
    setCalModal(m); setCalLinks(null);
    try {
      const r = await fetch(`${API}/api/calendar/link`,{
        method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body: JSON.stringify({ roomId:m.roomId, roomName:m.roomName, startTime:Date.now()+3600000, durationMin:25 }),
      });
      const d = await r.json();
      if (r.ok) setCalLinks(d);
    } catch {}
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#030507"}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"/>
        <p className="text-white/28 text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{background:"#030507"}}>
      {/* ── Professional dark background ── */}
      {/* Asset: dashboard-bg.jpg — dark geometric/grid tech pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage:"url('/assets/images/dashboard-bg.jpg')",
          backgroundSize:"cover", backgroundPosition:"center", opacity:0.10,
        }}/>
        <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,rgba(3,5,7,0.85) 0%,rgba(3,5,7,0.65) 50%,rgba(3,5,7,0.90) 100%)" }}/>
        {/* Subtle ambient orbs */}
        <div className="absolute rounded-full" style={{width:700,height:500,top:"-5%",left:"30%",background:"radial-gradient(ellipse,rgba(99,102,241,0.09) 0%,transparent 70%)",filter:"blur(80px)"}}/>
        <div className="absolute rounded-full" style={{width:400,height:400,bottom:"10%",right:"10%",background:"radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 70%)",filter:"blur(60px)"}}/>
      </div>

      {/* ── Sticky navbar ── */}
      <header className="relative z-10 sticky top-0"
        style={{background:"rgba(3,5,7,0.88)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"rgba(99,102,241,0.18)",border:"1px solid rgba(99,102,241,0.35)"}}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 2l7 4-7 4-7-4 7-4z" fill="rgba(165,180,252,0.25)" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 10l7 4 7-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <span className="font-bold text-white tracking-tight">FocusMeet</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onStart}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2"
              style={{background:"linear-gradient(135deg,#6366f1,#4f46e5)",boxShadow:"0 0 18px rgba(99,102,241,0.30)"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              New meeting
            </button>
            <button onClick={logout} className="text-sm text-white/32 hover:text-white/62 transition-colors px-3 py-2">Sign out</button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* User header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.65}}
          className="flex items-start justify-between gap-6 mb-10 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{background:"rgba(99,102,241,0.18)",border:"1px solid rgba(99,102,241,0.30)",color:"#a5b4fc"}}>
              {(user?.name||"?").slice(0,2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-0.5" style={{letterSpacing:"-0.03em"}}>{user?.name || "Dashboard"}</h1>
              <p className="text-white/38 text-sm">{user?.email || "Guest account"}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={user?.plan==="pro"
                    ?{background:"rgba(99,102,241,0.22)",color:"#a5b4fc",border:"1px solid rgba(99,102,241,0.35)"}
                    :{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.38)",border:"1px solid rgba(255,255,255,0.10)"}}>
                  {user?.plan==="pro"?"⭐ Pro":"Free plan"}
                </span>
                <span className="text-white/22 text-xs">{meetings.length} meetings recorded</span>
              </div>
            </div>
          </div>
          {user?.plan !== "pro" && (
            <button onClick={handleUpgrade} disabled={upgrading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-55"
              style={{background:"linear-gradient(135deg,#6366f1,#4338ca)",boxShadow:"0 0 20px rgba(99,102,241,0.30)"}}>
              {upgrading ? <Spinner/> : "⭐"}
              {upgrading ? "Redirecting…" : "Upgrade to Pro — $12/mo"}
            </button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.55,delay:0.1}}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label:"Total meetings",  value: meetings.length },
            { label:"This month",      value: meetings.filter(m => m.joinedAt > Date.now()-30*86400000).length },
            { label:"Plan",            value: user?.plan==="pro" ? "Pro ⭐" : "Free" },
            { label:"Member since",    value: user?.createdAt ? fmt(user.createdAt) : "Today" },
          ].map((s,i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center">
              <div className="text-2xl font-bold text-white mb-1" style={{letterSpacing:"-0.04em"}}>{s.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/25">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Meeting history */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.55,delay:0.15}}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white" style={{letterSpacing:"-0.025em"}}>Meeting history</h2>
            {error && <p className="text-red-400/60 text-xs">{error}</p>}
          </div>

          {meetings.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-white/38 font-medium mb-2">No meetings yet</div>
              <p className="text-white/22 text-sm mb-6">Start your first meeting and it will appear here.</p>
              <button onClick={onStart}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white"
                style={{background:"linear-gradient(135deg,#6366f1,#4f46e5)",boxShadow:"0 0 18px rgba(99,102,241,0.28)"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start first meeting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((m, i) => {
                const code = docCode(m.roomId, m.joinedAt);
                const notes = m.notes || localStorage.getItem(`fm_notes_${m.roomId}`) || "";
                return (
                  <motion.div key={m.roomId} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:i*0.05}}>
                    <div className="glass rounded-2xl overflow-hidden card-hover">
                      {/* Row header */}
                      <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/[0.018] transition-colors"
                        onClick={() => setActiveM(activeM===m.roomId?null:m.roomId)}>
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{background:"rgba(99,102,241,0.13)",border:"1px solid rgba(99,102,241,0.24)"}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-white/85 text-sm truncate">{m.roomName||"Meeting"}</span>
                            <span className="text-[9px] font-bold text-white/28 font-mono hidden sm:block">{code}</span>
                          </div>
                          <div className="text-xs text-white/28 flex items-center gap-3">
                            <span>{fmt(m.joinedAt)} · {fmtT(m.joinedAt)}</span>
                            {m.leftAt && <span>· {fmtDur(m.leftAt-m.joinedAt)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={e=>{e.stopPropagation();handleCalendar(m);}}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors text-white/38 hover:text-white/65"
                            style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                            📅
                          </button>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round"
                            className={`transition-transform duration-200 ${activeM===m.roomId?"rotate-180":""}`}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {activeM === m.roomId && (
                          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}}
                            className="overflow-hidden">
                            <div className="px-6 pb-5" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                              <div className="pt-4 flex items-center justify-between mb-2">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/22">Notes · {code}</div>
                                {notes && (
                                  <button onClick={()=>generateAI(m)} disabled={aiLoading}
                                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                                    style={{background:"rgba(99,102,241,0.16)",border:"1px solid rgba(99,102,241,0.28)",color:"#a5b4fc"}}>
                                    {aiLoading?"✨ Generating…":"✨ AI Summary"}
                                  </button>
                                )}
                              </div>
                              {notes
                                ? <pre className="text-sm text-white/48 leading-relaxed whitespace-pre-wrap mb-4 font-sans">{notes}</pre>
                                : <p className="text-white/20 text-xs mb-4 italic">No notes recorded for this session.</p>
                              }
                              {aiResults[m.roomId] && (
                                <div className="p-3 rounded-xl text-xs text-white/50 leading-relaxed whitespace-pre-wrap"
                                  style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.13)"}}>
                                  {aiResults[m.roomId]}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Calendar modal */}
      <AnimatePresence>
        {calModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{background:"rgba(0,0,0,0.78)",backdropFilter:"blur(12px)"}}>
            <motion.div initial={{scale:0.92,y:24}} animate={{scale:1,y:0}} exit={{scale:0.92,y:24}}
              className="rounded-2xl p-8 max-w-sm w-full"
              style={{background:"rgba(10,12,24,0.97)",border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 32px 80px rgba(0,0,0,0.75)"}}>
              <h3 className="text-base font-bold text-white mb-1">Schedule a follow-up</h3>
              <p className="text-white/35 text-sm mb-6">Add <strong className="text-white/60">{calModal.roomName}</strong> to your calendar</p>
              {calLinks ? (
                <div className="space-y-2.5">
                  <a href={calLinks.google} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:scale-[1.02] transition-transform"
                    style={{background:"rgba(66,133,244,0.18)",border:"1px solid rgba(66,133,244,0.30)"}}>
                    📅 Add to Google Calendar
                  </a>
                  <a href={calLinks.outlook} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white hover:scale-[1.02] transition-transform"
                    style={{background:"rgba(0,120,212,0.18)",border:"1px solid rgba(0,120,212,0.30)"}}>
                    📆 Add to Outlook
                  </a>
                  <div className="mt-2 px-3 py-2 rounded-lg text-[10px] text-white/28 font-mono break-all"
                    style={{background:"rgba(255,255,255,0.03)"}}>
                    {calLinks.roomUrl}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 text-white/30 text-sm">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"/>
                  Generating links…
                </div>
              )}
              <button onClick={()=>{setCalModal(null);setCalLinks(null);}}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold text-white/45 hover:text-white/70 transition-colors"
                style={{background:"rgba(255,255,255,0.05)"}}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Spinner = () => <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
