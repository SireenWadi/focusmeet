import React from "react";
import { motion } from "framer-motion";

const ClockIcon = ({ c="#6366f1" }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const NotesIcon = ({ c="#06b6d4" }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const UsersIcon = ({ c="#8b5cf6" }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckIcon = ({ c="#10b981" }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ZapIcon   = ({ c="#f59e0b" }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const ShieldIcon= ({ c="#ec4899" }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const FEATURES = [
  { Icon:ClockIcon, c:"#6366f1", title:"Time-bounded by design",   desc:"Set a duration. A synchronized countdown runs for every participant. Overruns become structurally impossible." },
  { Icon:NotesIcon, c:"#06b6d4", title:"Live shared notes",         desc:"A real-time collaborative notepad synced via WebSockets. Every keystroke is visible to all participants instantly." },
  { Icon:UsersIcon, c:"#8b5cf6", title:"Five people max",           desc:"Micro-meetings stay micro. Five participants is the optimal size for fast, decisive group work." },
  { Icon:CheckIcon, c:"#10b981", title:"Auto-generated summaries",  desc:"When the timer ends, a structured summary — participants, duration, and notes — is ready to export." },
  { Icon:ZapIcon,   c:"#f59e0b", title:"Zero-friction rooms",       desc:"Create a room in under 5 seconds. Share a link or 6-character code. No downloads, no accounts required for guests." },
  { Icon:ShieldIcon,c:"#ec4899", title:"End-to-end encrypted",      desc:"Every session is encrypted in transit. Your conversations stay private — no recording, no retention." },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{background:"#060810"}}>
      <div className="absolute inset-0 z-0" style={{backgroundImage:"url('/assets/images/features-bg.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.10}} />
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute rounded-full" style={{width:700,height:400,top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"radial-gradient(ellipse,rgba(99,102,241,0.09) 0%,transparent 70%)",filter:"blur(60px)"}}/>
      </div>

      <div className="relative z-[2] max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.65}} className="text-center mb-20">
          <div className="chip mb-5">Why FocusMeet</div>
          <h2 className="font-bold text-white mb-5" style={{fontSize:"clamp(2rem,3.8vw,3rem)",letterSpacing:"-0.04em"}}>
            Built for teams that respect
            <br/><span className="text-gradient">each other's time.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-lg mx-auto leading-relaxed">Every feature is an intentional constraint — designed to make meetings shorter, not longer.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f,i) => (
            <motion.div key={i} initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}} transition={{duration:0.55,delay:i*0.07}}>
              <div className="glass card-hover rounded-2xl p-7 h-full group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{background:`${f.c}15`,border:`1px solid ${f.c}30`}}>
                  <f.Icon c={f.c} />
                </div>
                <h3 className="text-white font-semibold text-[1rem] mb-3 leading-snug">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:`linear-gradient(90deg,${f.c}70,transparent)`}} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
