import React from "react";

const COLS = [
  { title:"Product",  links:["Features","Pricing","Changelog","Roadmap","Security"] },
  { title:"Company",  links:["About","Blog","Careers","Press","Partners"] },
  { title:"Support",  links:["Documentation","API Reference","Community","Status","Contact"] },
  { title:"Legal",    links:["Privacy Policy","Terms of Service","Cookie Policy","GDPR","Licenses"] },
];

export default function Footer() {
  return (
    <footer className="relative py-20 px-6 overflow-hidden" style={{background:"#020406",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
      <div className="absolute inset-x-0 top-0 h-px" style={{background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.35),rgba(6,182,212,0.25),transparent)"}}/>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"rgba(99,102,241,0.18)",border:"1px solid rgba(99,102,241,0.35)"}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 2l7 4-7 4-7-4 7-4z" fill="rgba(165,180,252,0.25)" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 10l7 4 7-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="font-bold text-white tracking-tight">FocusMeet</div>
                <div className="text-[9px] text-indigo-400/40 font-bold tracking-widest uppercase">Premium</div>
              </div>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6">The micro-meeting platform engineered for focused teams. Structured. Time-bounded. Outcome-driven.</p>
            <div className="flex gap-3">
              {["twitter","github","linkedin"].map(s => (
                <div key={s} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div className="text-white/30 text-[10px] font-bold uppercase">{s[0]}</div>
                </div>
              ))}
            </div>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><span className="text-sm text-white/35 hover:text-white/65 transition-colors cursor-pointer">{l}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="glow-line mb-8"/>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-white/20">© 2025 FocusMeet, Inc. All rights reserved.</span>
          <div className="flex items-center gap-2 text-xs text-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 inline-block"/>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
