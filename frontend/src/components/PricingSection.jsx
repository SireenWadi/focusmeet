import React, { useState } from "react";
import { motion } from "framer-motion";

const PLANS = [
  { name:"Free",   mo:0,  yr:0,  desc:"For individuals exploring focused meetings.",
    features:["5 meetings/month","2 participants","15-min max","Meeting summaries"],
    cta:"Get started free", primary:false },
  { name:"Pro",    mo:12, yr:9,  desc:"For teams running focused meetings daily.",
    features:["Unlimited meetings","Up to 5 participants","60-min max","Live shared notes","Screen sharing","Priority support","Export summaries"],
    cta:"Start free trial",  primary:true,  popular:true },
  { name:"Team",   mo:9,  yr:7,  desc:"For organisations with 10+ members, billed yearly.",
    features:["Everything in Pro","Team admin dashboard","SSO / SAML","Advanced analytics","Dedicated success manager","Custom integrations"],
    cta:"Contact sales",  primary:false },
];

const Check = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CheckGray = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function PricingSection({ onCta }) {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="relative py-32 overflow-hidden" style={{background:"#060810"}}>
      <div className="absolute inset-0 z-0" style={{backgroundImage:"url('/assets/images/pricing-bg.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.09}}/>
      <div className="section-fade-top"/>
      <div className="section-fade-bottom"/>
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute rounded-full" style={{width:600,height:350,top:"40%",right:"15%",background:"radial-gradient(ellipse,rgba(6,182,212,0.10) 0%,transparent 70%)",filter:"blur(70px)"}}/>
      </div>

      <div className="relative z-[2] max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.65}} className="text-center mb-16">
          <div className="chip mb-5">Pricing</div>
          <h2 className="font-bold text-white mb-6" style={{fontSize:"clamp(2rem,3.5vw,2.8rem)",letterSpacing:"-0.04em"}}>
            Simple, transparent pricing
          </h2>
          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <button onClick={()=>setAnnual(false)} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${!annual?"text-white":"text-white/35"}`} style={!annual?{background:"rgba(99,102,241,0.22)",border:"1px solid rgba(99,102,241,0.35)"}:{}}>Monthly</button>
            <button onClick={()=>setAnnual(true)}  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${annual?"text-white":"text-white/35"}`} style={annual?{background:"rgba(99,102,241,0.22)",border:"1px solid rgba(99,102,241,0.35)"}:{}}>
              Annual <span className="ml-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">−25%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((p,i) => (
            <motion.div key={p.name} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.55,delay:i*0.1}} className={p.popular?"md:-mt-4":""}>
              <div className={`relative rounded-2xl p-8 h-full transition-all duration-300 ${p.popular?"glass-heavy":"glass card-hover"}`}
                style={p.popular?{border:"1px solid rgba(99,102,241,0.45)",boxShadow:"0 0 50px rgba(99,102,241,0.18),0 24px 60px rgba(0,0,0,0.55)"}:{}}>
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white whitespace-nowrap"
                    style={{background:"linear-gradient(135deg,#6366f1,#4338ca)",boxShadow:"0 0 20px rgba(99,102,241,0.55)"}}>
                    Most popular
                  </div>
                )}
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{p.name}</div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-bold text-white" style={{fontSize:"3rem",letterSpacing:"-0.06em",lineHeight:1}}>${annual?p.yr:p.mo}</span>
                  {(annual?p.yr:p.mo) > 0 && <span className="text-white/30 text-sm mb-2">/user/mo</span>}
                </div>
                <p className="text-white/35 text-sm leading-relaxed mb-7">{p.desc}</p>
                <div className="border-t mb-6" style={{borderColor:"rgba(255,255,255,0.07)"}}/>
                <div className="space-y-3 mb-8">
                  {p.features.map((f,j) => (
                    <div key={j} className="flex items-center gap-2.5 text-sm" style={{color:"rgba(255,255,255,0.65)"}}>
                      {p.primary ? <Check/> : <CheckGray/>} {f}
                    </div>
                  ))}
                </div>
                <button onClick={()=>onCta?.(p.name)} className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${p.primary?"btn-primary":"btn-secondary"}`}>
                  {p.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.4}} className="text-center text-white/25 text-sm mt-10">
          No credit card required · Cancel anytime · 14-day free trial on Pro
        </motion.p>
      </div>
    </section>
  );
}
