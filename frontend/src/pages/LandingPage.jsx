import React from "react";
import { motion } from "framer-motion";
import HeroSection       from "../components/HeroSection";
import FeaturesSection   from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import PricingSection    from "../components/PricingSection";
import Footer            from "../components/Footer";

const TESTIMONIALS = [
  { name:"Sarah K.",  role:"Product Lead, Vercel",    quote:"Our sprint syncs went from 45 minutes to 20. Every single time. The timer creates real accountability." },
  { name:"Marco T.",  role:"CTO, Linear",             quote:"The shared notes + timer combo is genius. Decisions get made, owners get assigned, meeting ends on time." },
  { name:"Aisha D.",  role:"Design Director, Figma",  quote:"Finally a meeting tool built by people who hate unnecessary meetings. The 25-min limit changed our culture." },
];

const LOGOS = ["Stripe","Linear","Vercel","Notion","Figma","Loom","Supabase","Raycast"];

export default function LandingPage({ onStart, onJoin }) {
  return (
    <div>
      <HeroSection onStart={onStart} onJoin={onJoin}/>

      {/* Social proof strip */}
      <div className="py-5 px-6"
        style={{background:"rgba(255,255,255,0.018)",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8">
          <span className="text-[9px] font-black text-white/18 uppercase tracking-widest">Trusted by teams at</span>
          {LOGOS.map(l => (
            <span key={l} className="text-sm font-bold text-white/18 hover:text-white/38 transition-colors cursor-default tracking-tight">{l}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features"><FeaturesSection/></div>
      <div id="how-it-works"><HowItWorksSection/></div>

      {/* Testimonials — "Teams that ship fast" — with bg image */}
      <section id="about" className="relative py-32 px-6 overflow-hidden" style={{background:"#050810"}}>
        {/* Asset: teams-bg.jpg — dark collaborative workspace / office blur */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage:"url('/assets/images/teams-bg.jpg')",
            backgroundSize:"cover", backgroundPosition:"center", opacity:0.12,
          }}/>
          <div className="absolute inset-0" style={{background:"linear-gradient(180deg,rgba(3,5,7,0.90) 0%,rgba(5,8,16,0.60) 50%,rgba(3,5,7,0.92) 100%)"}}/>
          <div className="absolute inset-x-0 top-0 h-24" style={{background:"linear-gradient(180deg,#030507,transparent)"}}/>
          <div className="absolute inset-x-0 bottom-0 h-24" style={{background:"linear-gradient(0deg,#030507,transparent)"}}/>
          {/* Glow */}
          <div className="absolute rounded-full" style={{width:600,height:400,top:"40%",left:"50%",transform:"translate(-50%,-50%)",background:"radial-gradient(ellipse,rgba(99,102,241,0.10) 0%,transparent 70%)",filter:"blur(60px)"}}/>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.65}} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5"
              style={{color:"#a5b4fc",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.25)"}}>
              What teams say
            </div>
            <h2 className="font-bold text-white" style={{fontSize:"clamp(1.8rem,3.5vw,2.6rem)",letterSpacing:"-0.04em"}}>
              Teams that ship fast
              <br/><span className="text-gradient">use FocusMeet.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t,i) => (
              <motion.div key={i} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.1}}>
                <div className="glass card-hover rounded-2xl p-8 h-full">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_,s) => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <p className="text-white/58 text-sm leading-relaxed mb-7 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{background:"rgba(99,102,241,0.20)",color:"#a5b4fc",border:"1px solid rgba(99,102,241,0.30)"}}>
                      {t.name.slice(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/80">{t.name}</div>
                      <div className="text-xs text-white/28">{t.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <div id="pricing"><PricingSection onCta={onStart}/></div>

      {/* Final CTA */}
      <section className="relative py-36 px-6 text-center overflow-hidden" style={{background:"#030507"}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 90% 70% at 50% 50%, rgba(99,102,241,0.11) 0%, transparent 70%)"}}/>
        <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 50% 40% at 75% 30%, rgba(6,182,212,0.07) 0%, transparent 70%)"}}/>
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div initial={{opacity:0,scale:0.96}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:0.7}}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
              style={{color:"#a5b4fc",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.25)"}}>
              Free to start · No credit card
            </div>
            <h2 className="font-bold text-white mb-5" style={{fontSize:"clamp(2.2rem,4.5vw,3.4rem)",letterSpacing:"-0.045em"}}>
              Ready to make meetings
              <br/><span className="text-gradient">actually count?</span>
            </h2>
            <p className="text-white/38 text-lg mb-12 leading-relaxed">Join 1,200+ teams who've cut meeting time by 40%. Your first meeting starts in 30 seconds.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={onStart}
                className="flex items-center gap-3 px-12 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105"
                style={{background:"linear-gradient(135deg,#6366f1,#4f46e5,#4338ca)",boxShadow:"0 0 28px rgba(99,102,241,0.40),0 4px 20px rgba(0,0,0,0.40)"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start for free — no signup
              </button>
              <button onClick={onJoin}
                className="px-9 py-4 rounded-2xl text-base font-semibold text-white/65 transition-all hover:text-white/85 hover:scale-[1.02]"
                style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)"}}>
                Join with a code
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
