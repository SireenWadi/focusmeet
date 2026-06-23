import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { label:"Features",     id:"features"    },
  { label:"How it works", id:"how-it-works" },
  { label:"Pricing",      id:"pricing"      },
  { label:"About",        id:"about"        },
];

export default function Navbar({ onStart, onJoin, onDashboard, onScrollTo }) {
  const { user } = useAuth();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLink = (id) => { setMobileOpen(false); onScrollTo?.(id); };

  return (
    <>
      <motion.nav
        initial={{y:-64,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.7,ease:[0.23,1,0.32,1]}}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(3,5,7,0.90)" : "rgba(3,5,7,0.30)",
          backdropFilter:"blur(24px) saturate(180%)", WebkitBackdropFilter:"blur(24px) saturate(180%)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.5)" : "none",
        }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleLink(null)}>
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{background:"linear-gradient(135deg,rgba(99,102,241,0.22),rgba(79,70,229,0.35))",border:"1px solid rgba(99,102,241,0.45)",boxShadow:"0 0 20px rgba(99,102,241,0.22)"}}>
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 2l7 4-7 4-7-4 7-4z" fill="rgba(165,180,252,0.28)" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M3 10l7 4 7-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-[1.05rem] tracking-tight">FocusMeet</span>
              <div className="text-[8px] text-indigo-400/55 font-bold tracking-widest uppercase leading-none">Premium</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(l => (
              <button key={l.id} onClick={() => handleLink(l.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/42 hover:text-white/82 hover:bg-white/[0.04] transition-all duration-200">
                {l.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <button onClick={onDashboard} className="hidden sm:flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white/80 transition-colors px-3 py-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:"rgba(99,102,241,0.25)",color:"#a5b4fc"}}>
                    {user.name?.slice(0,2).toUpperCase()}
                  </div>
                  Dashboard
                </button>
                <button onClick={onStart} className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  New meeting
                </button>
              </>
            ) : (
              <>
                <button onClick={onJoin} className="hidden sm:block text-sm font-medium text-white/45 hover:text-white/75 transition-colors px-3 py-2">Sign in</button>
                <button onClick={onStart} className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Start free
                </button>
              </>
            )}
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(o=>!o)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 ml-1">
              <span className={`block w-5 h-0.5 bg-white/55 transition-all duration-300 ${mobileOpen?"rotate-45 translate-y-2":""}`}/>
              <span className={`block w-5 h-0.5 bg-white/55 transition-all duration-300 ${mobileOpen?"opacity-0":""}`}/>
              <span className={`block w-5 h-0.5 bg-white/55 transition-all duration-300 ${mobileOpen?"-rotate-45 -translate-y-2":""}`}/>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.22}}
            className="fixed top-[68px] inset-x-0 z-40 px-6 py-5 flex flex-col gap-1 md:hidden"
            style={{background:"rgba(3,5,7,0.96)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            {LINKS.map(l => (
              <button key={l.id} onClick={() => handleLink(l.id)}
                className="text-left py-3 text-white/60 hover:text-white font-medium text-sm border-b border-white/[0.05] last:border-0 transition-colors">
                {l.label}
              </button>
            ))}
            <div className="flex gap-3 pt-3">
              <button onClick={()=>{setMobileOpen(false);onJoin?.();}} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/65 text-center" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)"}}>Sign in</button>
              <button onClick={()=>{setMobileOpen(false);onStart?.();}} className="flex-1 py-3 rounded-xl text-sm font-bold text-white text-center btn-primary">Start free</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
