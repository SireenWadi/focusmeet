import React from "react";
import { motion } from "framer-motion";

const VideoIcon = ({ c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const ShareIcon = ({ c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ClockIcon = ({ c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckIcon = ({ c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const STEPS = [
  { num:"01", Icon:VideoIcon, c:"#6366f1", title:"Create a room",        desc:"Name your meeting, pick a duration (15, 25, or 45 min), and get a shareable link or 6-character code in seconds." },
  { num:"02", Icon:ShareIcon, c:"#06b6d4", title:"Invite your team",     desc:"Paste the link or share the code. Guests join in the browser — no downloads, no accounts required." },
  { num:"03", Icon:ClockIcon, c:"#8b5cf6", title:"Meet with focus",       desc:"A synchronized countdown keeps everyone on track. Shared notes are live for all participants simultaneously." },
  { num:"04", Icon:CheckIcon, c:"#10b981", title:"Export the outcome",   desc:"When the timer ends, your summary — participants, duration, and notes — is automatically generated." },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{background:"#070a15"}}>
      <div className="absolute inset-0 z-0" style={{backgroundImage:"url('/assets/images/how-it-works-bg.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.08}}/>
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />

      <div className="relative z-[2] max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.65}} className="text-center mb-24">
          <div className="chip mb-5">How it works</div>
          <h2 className="font-bold text-white" style={{fontSize:"clamp(2rem,3.8vw,2.9rem)",letterSpacing:"-0.04em"}}>
            From idea to outcome
            <br/><span className="text-gradient">in under 30 seconds.</span>
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px z-0" style={{background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.35),rgba(6,182,212,0.30),rgba(99,102,241,0.25),transparent)"}}/>

          {STEPS.map((s,i) => (
            <motion.div key={s.num} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-30px"}} transition={{duration:0.55,delay:i*0.1}} className="text-center group">
              <div className="relative inline-flex mb-8">
                <div className="w-[72px] h-[72px] rounded-3xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg"
                  style={{background:`${s.c}15`,border:`1px solid ${s.c}35`,boxShadow:`0 0 28px ${s.c}20`}}>
                  <s.Icon c={s.c}/>
                </div>
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white z-20"
                  style={{background:s.c,boxShadow:`0 0 12px ${s.c}70`}}>
                  {s.num.slice(-1)}
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:s.c}}>{s.num}</div>
              <h3 className="text-white font-semibold text-base mb-3">{s.title}</h3>
              <p className="text-white/38 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
