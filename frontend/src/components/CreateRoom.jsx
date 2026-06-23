import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
const DURATIONS = [
  { v:15, label:"15 min", sub:"Quick sync"  },
  { v:25, label:"25 min", sub:"Standard"    },
  { v:45, label:"45 min", sub:"Deep dive"   },
  { v:60, label:"60 min", sub:"Workshop"    },
];

// Validation helpers
function validateName(n)  { return n.trim().length >= 2 && n.trim().length <= 80 && /[a-zA-Z]/.test(n); }
function validateUser(n)  { return n.trim().length >= 2 && n.trim().length <= 40; }
function validateCode(c)  { return /^[A-Z0-9]{6,8}$/.test(c.trim()); }

export default function CreateRoom({ onRoomCreated, onRoomJoined, onDashboard }) {
  const { user, token, loginAsGuest, loginWithGoogle } = useAuth();
  const [tab,      setTab]      = useState("create");
  const [name,     setName]     = useState("");
  const [dur,      setDur]      = useState(25);
  const [userName, setUserName] = useState(user?.name || "");
  const [code,     setCode]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [authMode, setAuthMode] = useState(false); // show auth options
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = useCallback(() => {
    const e = {};
    if (!validateUser(userName)) e.userName = "Name must be at least 2 characters with letters.";
    if (tab === "create" && !validateName(name)) e.name = "Meeting name must be 2–80 characters and contain letters.";
    if (tab === "join"   && !validateCode(code)) e.code = "Enter a valid room code (6–8 uppercase characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [tab, name, userName, code]);

  const ensureAuth = useCallback(async () => {
    if (token) return true;
    // Auto login as guest
    try {
      if (!validateUser(userName)) { setErrors({ userName:"Enter your name first." }); return false; }
      await loginAsGuest(userName.trim());
      return true;
    } catch (err) {
      setErrors({ userName: err.message });
      return false;
    }
  }, [token, userName, loginAsGuest]);

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await ensureAuth();
    if (!ok) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("fm_token")}` },
        body: JSON.stringify({ name: name.trim(), duration: dur }),
      });
      const d = await r.json();
      if (!r.ok) { setErrors({ name: d.error }); return; }
      onRoomCreated?.({ roomId: d.roomId, roomName: d.name, duration: d.duration, user: { name: userName.trim(), id: d.userId } });
    } catch { setErrors({ name: "Network error. Is the backend running on port 4000?" }); }
    finally { setLoading(false); }
  }, [validate, ensureAuth, name, dur, userName, onRoomCreated]);

  const handleJoin = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await ensureAuth();
    if (!ok) return;
    const c = code.trim().toUpperCase();
    setLoading(true);
    try {
      // Verify room exists
      const r = await fetch(`${API}/api/rooms/${c}`);
      if (!r.ok) { setErrors({ code: "Room not found. Check the code and try again." }); setLoading(false); return; }
      const d = await r.json();
      onRoomJoined?.({ roomId: c, roomName: d.name, duration: d.duration, user: { name: userName.trim() } });
    } catch { setErrors({ code: "Network error." }); }
    finally { setLoading(false); }
  }, [validate, ensureAuth, code, userName, onRoomJoined]);

  const handleGoogleLogin = useCallback(async () => {
    // In production: use Google Identity Services SDK
    // For demo: simulate with a prompt
    setGoogleLoading(true);
    try {
      const email   = prompt("Demo: Enter your Google email");
      const gname   = prompt("Demo: Enter your name");
      if (!email || !gname) return;
      await loginWithGoogle({ name: gname, email, picture:"" });
      setUserName(gname);
    } catch (err) { setErrors({ userName: err.message }); }
    finally { setGoogleLoading(false); }
  }, [loginWithGoogle]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden" style={{background:"#030507"}}>
      <div className="absolute inset-0 z-0" style={{backgroundImage:"url('/assets/images/create-room-bg.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.16}}/>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute rounded-full" style={{width:700,height:700,top:"20%",left:"30%",transform:"translate(-50%,-50%)",background:"radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)",filter:"blur(90px)"}}/>
        <div className="absolute rounded-full" style={{width:400,height:400,bottom:"15%",right:"20%",background:"radial-gradient(circle,rgba(6,182,212,0.10) 0%,transparent 70%)",filter:"blur(60px)"}}/>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{background:"rgba(99,102,241,0.20)",border:"1px solid rgba(99,102,241,0.42)",boxShadow:"0 0 28px rgba(99,102,241,0.28)"}}>
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 2l7 4-7 4-7-4 7-4z" fill="rgba(165,180,252,0.30)" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 10l7 4 7-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div className="font-bold text-white text-xl tracking-tight">FocusMeet</div>
            <div className="text-[9px] text-indigo-400/50 font-bold tracking-widest uppercase">Premium</div>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.65,delay:0.1}}
          className="rounded-3xl p-8"
          style={{background:"rgba(255,255,255,0.055)",backdropFilter:"blur(40px) saturate(200%)",WebkitBackdropFilter:"blur(40px) saturate(200%)",border:"1px solid rgba(255,255,255,0.11)",boxShadow:"0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.10)"}}>

          {/* Auth row */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-[9px] font-black uppercase tracking-widest text-white/25">
              {user ? `Signed in as ${user.name}` : "Continue as guest or sign in"}
            </div>
            <div className="flex items-center gap-2">
              {user
                ? <button onClick={onDashboard} className="text-[10px] font-bold text-indigo-300 hover:text-indigo-200 transition-colors">Dashboard →</button>
                : <>
                    <button onClick={handleGoogleLogin} disabled={googleLoading}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
                      style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.65)"}}>
                      {googleLoading ? <Spinner/> : "G"} Google
                    </button>
                  </>
              }
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex p-1 rounded-2xl mb-7" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
            {["create","join"].map(t => (
              <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${tab===t?"text-white":"text-white/30 hover:text-white/55"}`}
                style={tab===t?{background:"rgba(99,102,241,0.22)",border:"1px solid rgba(99,102,241,0.38)",boxShadow:"0 0 16px rgba(99,102,241,0.18)"}:{}}>
                {t === "create" ? "▶  Start meeting" : "→  Join meeting"}
              </button>
            ))}
          </div>

          <form onSubmit={tab==="create" ? handleCreate : handleJoin} className="space-y-5" noValidate>
            <AnimatePresence mode="wait">
              {tab === "create" ? (
                <motion.div key="create" initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:12}} transition={{duration:0.18}} className="space-y-5">
                  <Field label="Meeting name" error={errors.name}>
                    <input value={name} onChange={e=>{setName(e.target.value);setErrors(p=>({...p,name:""}));}}
                      placeholder="e.g. Sprint planning, Design review…"
                      className={`input-glass ${errors.name?"border-red-500/50":""}`} maxLength={80}/>
                  </Field>
                  <Field label="Duration">
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {DURATIONS.map(d => (
                        <button type="button" key={d.v} onClick={() => setDur(d.v)}
                          className="py-3 rounded-xl text-center transition-all duration-200"
                          style={dur===d.v?{background:"rgba(99,102,241,0.20)",border:"1px solid rgba(99,102,241,0.45)",boxShadow:"0 0 12px rgba(99,102,241,0.18)"}:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                          <div className={`text-sm font-bold ${dur===d.v?"text-indigo-300":"text-white/55"}`}>{d.label}</div>
                          <div className="text-[9px] text-white/25 mt-0.5">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </Field>
                </motion.div>
              ) : (
                <motion.div key="join" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:0.18}}>
                  <Field label="Room code" error={errors.code}>
                    <input value={code} onChange={e=>{setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""));setErrors(p=>({...p,code:""}));}}
                      placeholder="ABC12345" maxLength={8}
                      className={`input-glass text-center text-xl font-bold tracking-[0.25em] ${errors.code?"border-red-500/50":""}`}/>
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {!user && (
              <Field label="Your display name" error={errors.userName}>
                <input value={userName} onChange={e=>{setUserName(e.target.value);setErrors(p=>({...p,userName:""}));}}
                  placeholder="How others will see you" maxLength={40}
                  className={`input-glass ${errors.userName?"border-red-500/50":""}`}/>
              </Field>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all duration-300 relative overflow-hidden"
              style={{background:"linear-gradient(135deg,#6366f1,#4f46e5,#4338ca)",boxShadow:"0 0 24px rgba(99,102,241,0.40),0 4px 20px rgba(0,0,0,0.40)"}}>
              {loading ? <><Spinner/> {tab==="create"?"Creating room…":"Joining…"}</> : tab==="create" ? <><PlayIco/> Start meeting</> : <><EnterIco/> Join meeting</>}
            </button>
          </form>

          <div className="flex items-center justify-center flex-wrap gap-4 mt-6 pt-5" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            {["No account required","End-to-end encrypted","Free to start"].map((t,i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/22 font-medium">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.55)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.2}}
            className="text-red-400/75 text-[11px] mt-1.5 px-1">{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const Spinner  = () => <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const PlayIco  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const EnterIco = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
