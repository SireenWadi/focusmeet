/**
 * HeroSection.jsx — Cinematic 3-layer glassmorphism hero
 * Layer 1: hero-bg-layer1.mp4 (video background)
 * Layer 2: floating-mesh.png (parallax 3D object)
 * Layer 3: frosted glass text card
 */
import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";

const STATS = [
  { value:"94%",   label:"End on time"      },
  { value:"<5s",   label:"Room setup"        },
  { value:"3.2×",  label:"Faster decisions"  },
  { value:"1,200+",label:"Teams active"      },
];

const TRUST_AVATARS = [
  { initials:"SR", color:"#6366f1" },
  { initials:"AM", color:"#06b6d4" },
  { initials:"JL", color:"#8b5cf6" },
  { initials:"KP", color:"#10b981" },
];

export default function HeroSection({ onStart, onJoin }) {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const spX  = useSpring(rawX, { stiffness:50, damping:18 });
  const spY  = useSpring(rawY, { stiffness:50, damping:18 });
  const meshX  = useTransform(spX, [-0.5,0.5], ["8%","-8%"]);
  const meshY  = useTransform(spY, [-0.5,0.5], ["6%","-6%"]);
  const orbX   = useTransform(spX, [-0.5,0.5], ["-10%","10%"]);
  const orbY   = useTransform(spY, [-0.5,0.5], ["-7%","7%"]);

  function onMouseMove(e) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rawX.set((e.clientX - r.left) / r.width  - 0.5);
    rawY.set((e.clientY - r.top)  / r.height - 0.5);
  }
  function onMouseLeave() { rawX.set(0); rawY.set(0); }

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background:"#030507" }}
    >
      {/* ── LAYER 1: Background Video ─────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <video
          src="/assets/videos/hero-bg-layer1.mp4"
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
          style={{ opacity:0.35 }}
        />
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, #030507 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-48" style={{ background:"linear-gradient(0deg, #030507, transparent)" }} />
        <div className="absolute inset-x-0 top-0 h-32" style={{ background:"linear-gradient(180deg, #030507, transparent)" }} />
      </div>

      {/* ── Ambient glow orbs (parallax) ─────────────────────────────── */}
      <motion.div style={{ x:orbX, y:orbY }} className="absolute inset-0 z-[1] pointer-events-none" aria-hidden>
        <div className="absolute rounded-full" style={{ width:800, height:800, top:"30%", left:"40%", transform:"translate(-50%,-50%)", background:"radial-gradient(circle, rgba(99,102,241,0.20) 0%, rgba(79,70,229,0.05) 40%, transparent 70%)", filter:"blur(70px)" }} />
        <div className="absolute rounded-full" style={{ width:500, height:500, top:"20%", left:"75%", background:"radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)", filter:"blur(60px)" }} />
        <div className="absolute rounded-full" style={{ width:300, height:300, top:"70%", left:"20%", background:"radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", filter:"blur(50px)" }} />
      </motion.div>

      {/* ── LAYER 2: Floating Mesh PNG (parallax) ────────────────────── */}
      <motion.div style={{ x:meshX, y:meshY }} className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-end pr-6 lg:pr-12" aria-hidden>
        <motion.img
          src="/assets/images/floating-mesh.png"
          alt=""
          animate={{ y:[0,-28,0], rotate:[0,3,0] }}
          transition={{ duration:11, repeat:Infinity, ease:"easeInOut" }}
          className="w-[320px] lg:w-[480px] xl:w-[560px] select-none"
          style={{ opacity:0.65, filter:"drop-shadow(0 0 80px rgba(99,102,241,0.55)) drop-shadow(0 0 30px rgba(6,182,212,0.25))" }}
        />
      </motion.div>

      {/* ── LAYER 3: Content ─────────────────────────────────────────── */}
      <div className="relative z-[3] w-full max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

        {/* Left: Text */}
        <div className="flex-1 max-w-[600px]">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
            <div className="chip mb-7">
              <span className="rec-dot" />
              Now in open beta — free to use
            </div>
          </motion.div>

          <motion.h1
            initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} transition={{duration:0.75,delay:0.08}}
            className="font-bold leading-[1.05] mb-7"
            style={{ fontSize:"clamp(2.8rem,5.5vw,4.6rem)", letterSpacing:"-0.045em" }}
          >
            <span className="text-white-gradient block">Meetings that</span>
            <span className="text-gradient block">end on time.</span>
            <span className="text-white-gradient block">Every time.</span>
          </motion.h1>

          <motion.p
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.18}}
            className="text-white/50 text-lg leading-[1.7] mb-10 max-w-[480px]"
          >
            FocusMeet is the micro-meeting platform built for teams who respect each other's time — structured agendas, live shared notes, and hard time limits.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.26}}
            className="flex flex-wrap gap-4 mb-12"
          >
            <button onClick={onStart} className="btn-primary px-9 py-4 rounded-2xl text-base flex items-center gap-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start a meeting
            </button>
            <button onClick={onJoin} className="btn-secondary px-9 py-4 rounded-2xl text-base">
              Join with code
            </button>
          </motion.div>

          {/* Trust row */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8,delay:0.45}} className="flex items-center gap-5">
            <div className="flex">
              {TRUST_AVATARS.map((a,i) => (
                <div key={i} className="p-avatar w-8 h-8 text-[11px]"
                  style={{ background:`${a.color}25`, color:a.color, border:`2px solid #030507`, marginLeft: i===0?0:-10, zIndex:4-i }}>
                  {a.initials}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_,i) => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
              </div>
              <div className="text-white/35 text-xs">Trusted by 1,200+ teams this month</div>
            </div>
          </motion.div>
        </div>

        {/* Right: Live preview card */}
        <motion.div
          initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} transition={{duration:0.9,delay:0.35, ease:[0.23,1,0.32,1]}}
          className="hidden lg:block flex-shrink-0 w-[370px] xl:w-[420px]"
        >
          <HeroCard />
        </motion.div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.6}}
        className="absolute bottom-0 inset-x-0 z-[3]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-8">
          <div className="glass rounded-2xl px-8 py-5 flex flex-wrap items-center justify-around gap-6">
            {STATS.map((s,i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white mb-0.5" style={{letterSpacing:"-0.04em",background:"linear-gradient(135deg,#fff,#a5b4fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.value}</div>
                <div className="text-[10px] text-white/35 font-semibold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div animate={{y:[0,10,0]}} transition={{duration:2.2,repeat:Infinity}} className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[3]">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </motion.div>
    </section>
  );
}

// ── Live meeting preview card inside hero ────────────────────────────────────
function HeroCard() {
  const [secs, setSecs] = useState(18*60+44);
  const [notes] = useState("✓ Q3 metrics reviewed\n→ Alex: update Figma by Thu\n→ Jamie: schedule 3 interviews");
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0,s-1)), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pct = secs / (25*60);

  return (
    <div className="relative" style={{filter:"drop-shadow(0 40px 80px rgba(0,0,0,0.7))"}}>
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-3xl" style={{background:"radial-gradient(ellipse 80% 80% at 50% 50%, rgba(99,102,241,0.18) 0%, transparent 70%)", filter:"blur(30px)", transform:"scale(1.1)"}} />

      <div className="relative glass-heavy rounded-3xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.12)"}}>
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div className="flex items-center gap-2.5">
            <span className="rec-dot" />
            <span className="text-xs font-semibold text-white/80">Product Sync · Sprint 48</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Mini progress ring */}
            <svg width="28" height="28" viewBox="0 0 32 32" className="-rotate-90">
              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"/>
              <circle cx="16" cy="16" r="12" fill="none" stroke={pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#f59e0b" : "#ef4444"}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*12}`}
                strokeDashoffset={`${2*Math.PI*12*(1-pct)}`}
                style={{transition:"stroke-dashoffset 1s linear, stroke 0.5s"}}
              />
            </svg>
            <span className="text-xs font-bold text-white/65 tabular-nums">{fmt(secs)}</span>
          </div>
        </div>

        {/* Video grid */}
        <div className="p-3 grid gap-2" style={{gridTemplateColumns:"3fr 2fr",gridTemplateRows:"auto auto"}}>
          {/* Main */}
          <div className="video-tile row-span-2 relative" style={{background:"linear-gradient(135deg,#1a2744,#0d1528)",aspectRatio:"3/4"}}>
            <video src="/assets/videos/participant-loop-1.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" style={{opacity:0.9}}/>
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{boxShadow:"0 0 6px #22c55e"}} />
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}>Sireen · Host</span>
            </div>
            <div className="absolute top-2 left-2 z-10 text-[8px] font-black text-white px-1.5 py-0.5 rounded" style={{background:"rgba(99,102,241,0.8)"}}>HOST</div>
          </div>
          {/* Tiles */}
          {[{i:"AM",g:"from-emerald-900 to-emerald-700"},{i:"JL",g:"from-violet-900 to-violet-700",muted:true}].map((p,idx) => (
            <div key={idx} className="video-tile relative" style={{background:`linear-gradient(135deg, var(--tw-gradient-stops))`,aspectRatio:"4/3"}}>
              <div className={`w-full h-full bg-gradient-to-br ${p.g} flex items-center justify-center text-lg font-bold text-white/50`}>{p.i}</div>
              {p.muted && <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center bg-red-500/90"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></svg></div>}
              <div className="absolute bottom-1 left-1.5 z-10 text-[9px] font-semibold text-white" style={{textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{p.i==="AM"?"Alex":"Jamie"}</div>
            </div>
          ))}
        </div>

        {/* Notes preview */}
        <div className="mx-3 mb-3 p-3 rounded-xl text-[11px] leading-relaxed text-white/45" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1.5">Shared Notes</div>
          {notes.split("\n").map((l,i) => <div key={i}>{l}</div>)}
        </div>

        {/* Controls */}
        <div className="px-4 pb-4 flex items-center justify-center gap-3">
          {[MicIcon,CamIcon,ScreenIcon].map((Icon,i) => (
            <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.10)"}}>
              <Icon />
            </div>
          ))}
          <div className="ml-1 px-4 py-2 rounded-full text-[10px] font-bold text-white cursor-pointer" style={{background:"rgba(239,68,68,0.85)",boxShadow:"0 0 12px rgba(239,68,68,0.30)"}}>End meeting</div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div animate={{y:[0,-5,0]}} transition={{duration:3,repeat:Infinity}} className="absolute -top-4 -right-6 glass rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{boxShadow:"0 0 8px #22c55e"}}/>
        <span className="text-xs font-semibold text-white/80">3 participants</span>
      </motion.div>
      <motion.div animate={{y:[0,5,0]}} transition={{duration:4,repeat:Infinity,delay:1}} className="absolute -bottom-8 -left-4 glass rounded-xl px-3 py-2">
        <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-0.5">Time Remaining</div>
        <div className="text-lg font-bold text-white tabular-nums" style={{letterSpacing:"-0.04em",color: pct > 0.5?"#22c55e":pct>0.25?"#f59e0b":"#ef4444"}}>{fmt(secs)}</div>
      </motion.div>
    </div>
  );
}

const MicIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>;
const CamIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const ScreenIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
