/**
 * MeetingRoom.jsx — Production meeting interface
 * - Floating dock with auto-hide
 * - Professional dark image background
 * - Notes persisted via Sidebar + exported on end
 * - Fluid layout fill on sidebar toggle / layout switch
 * - Screen recording, whiteboard, webcam
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebcam }         from "../hooks/useWebcam";
import { useScreenRecorder } from "../hooks/useScreenRecorder";
import { useSocket }         from "../context/SocketContext";
import Sidebar    from "./Sidebar";
import Whiteboard from "./Whiteboard";

const PEERS = [
  { id:"p2", name:"Alex M.",  initials:"AM", color:"#059669", video:"/assets/videos/participant-loop-2.mp4", muted:false },
  { id:"p3", name:"Jamie L.", initials:"JL", color:"#7c3aed", video:"/assets/videos/participant-loop-3.mp4", muted:true  },
  { id:"p4", name:"Kai P.",   initials:"KP", color:"#ea580c", video:null,                                    muted:false },
];

export default function MeetingRoom({ roomId, roomName, duration=25, user, onEnd }) {
  const { socket } = useSocket();
  const [layout,      setLayout]      = useState("grid");
  const [spotId,      setSpotId]      = useState("self");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wbOpen,      setWbOpen]      = useState(false);
  const [endConfirm,  setEndConfirm]  = useState(false);
  const [dockVisible, setDockVisible] = useState(true);
  const [recNotify,   setRecNotify]   = useState("");
  const dockTimer = useRef(null);

  // Stable notes ref — updated by Sidebar via onNotesChange
  const latestNotes = useRef("");
  const handleNotesChange = useCallback((val) => { latestNotes.current = val; }, []);

  const { setVideoRef, status, isMuted, isCamOff, toggleMute, toggleCamera, getStream } = useWebcam({ audio:true, video:true });
  const recorder = useScreenRecorder();

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join:room", { roomId, user });
  }, [socket, roomId, user]);

  useEffect(() => {
    socket?.emit("media:state", { roomId, muted:isMuted, camOff:isCamOff });
  }, [isMuted, isCamOff, socket, roomId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("recording:state", ({ recording }) => {
      setRecNotify(recording ? "🔴 Recording started" : "⏹ Recording stopped");
      setTimeout(() => setRecNotify(""), 3000);
    });
    return () => socket.off("recording:state");
  }, [socket]);

  // Auto-hide dock after 4 seconds of mouse inactivity
  const resetDockTimer = useCallback(() => {
    setDockVisible(true);
    clearTimeout(dockTimer.current);
    dockTimer.current = setTimeout(() => setDockVisible(false), 4000);
  }, []);

  useEffect(() => {
    resetDockTimer();
    return () => clearTimeout(dockTimer.current);
  }, [resetDockTimer]);

  const handleEnd = useCallback(() => {
    if (recorder.recording) recorder.stopRecording();
    socket?.emit("timer:reset", { roomId });
    // Collect notes from sidebar ref OR DOM fallback
    const notes = latestNotes.current
      || document.getElementById("fm-shared-notes")?.value
      || "";
    onEnd?.({ elapsed: 0, participants: [], notes });
  }, [socket, roomId, recorder, onEnd]);

  const handleStartRecording = useCallback(async () => {
    await recorder.startRecording(getStream());
    socket?.emit("recording:start", { roomId });
  }, [recorder, getStream, socket, roomId]);

  const handleStopRecording = useCallback(() => {
    recorder.stopRecording();
    socket?.emit("recording:stop", { roomId });
  }, [recorder, socket, roomId]);

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden select-none"
      style={{ background:"#030507" }}
      onMouseMove={resetDockTimer}
      onPointerMove={resetDockTimer}
    >
      {/* ── Professional room background ── */}
      {/* Asset: meeting-room-bg.jpg — dark studio / server-room texture */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage:"url('/assets/images/meeting-room-bg.jpg')",
          backgroundSize:"cover",
          backgroundPosition:"center",
          opacity:0.14,
        }}/>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 90% 70% at 50% 50%, rgba(3,5,7,0) 20%, rgba(3,5,7,0.85) 100%)" }}/>
        {/* Corner glows */}
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%)", filter:"blur(60px)" }}/>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)", filter:"blur(50px)" }}/>
      </div>

      {/* ── Header ── */}
      <header
        className="relative z-20 flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{
          background:"rgba(3,5,7,0.82)",
          backdropFilter:"blur(24px) saturate(180%)",
          WebkitBackdropFilter:"blur(24px) saturate(180%)",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:"rgba(99,102,241,0.18)", border:"1px solid rgba(99,102,241,0.35)" }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 2l7 4-7 4-7-4 7-4z" fill="rgba(165,180,252,0.25)" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M3 10l7 4 7-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-white/85">{roomName}</div>
            <div className="text-[10px] text-white/30">Room · {roomId}</div>
          </div>
          <div className="flex items-center gap-1.5 ml-2 px-2 py-1 rounded-md" style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)" }}>
            <span className="rec-dot"/>
            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Live</span>
          </div>
          {recorder.recording && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background:"rgba(239,68,68,0.20)", border:"1px solid rgba(239,68,68,0.40)" }}>
              <span className="rec-dot"/>
              <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">REC {recorder.fmtDur(recorder.duration)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <HBtn active={wbOpen}      onClick={() => setWbOpen(w=>!w)}           label="Whiteboard"><WbIco/></HBtn>
          <HBtn active={layout!=="grid"} onClick={() => setLayout(l => l==="grid"?"spotlight":"grid")} label={layout==="grid"?"Spotlight":"Grid"}><LayoutIco grid={layout==="grid"}/></HBtn>
          <HBtn active={!sidebarOpen} onClick={() => setSidebarOpen(s=>!s)}     label={sidebarOpen?"Hide panel":"Show panel"}><PanelIco/></HBtn>
          <button onClick={() => setEndConfirm(true)}
            className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:scale-105"
            style={{ background:"rgba(239,68,68,0.82)", boxShadow:"0 0 14px rgba(239,68,68,0.25)" }}>
            End meeting
          </button>
        </div>
      </header>

      {/* Recording toast */}
      <AnimatePresence>
        {recNotify && (
          <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background:"rgba(99,102,241,0.88)", boxShadow:"0 8px 24px rgba(0,0,0,0.45)" }}>
            {recNotify}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body ── */}
      <div className="relative z-10 flex flex-1 overflow-hidden min-h-0">
        {/* Videos area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-3 gap-3 pb-20">
          {layout === "grid"
            ? <GridLayout setVideoRef={setVideoRef} status={status} isMuted={isMuted} isCamOff={isCamOff} user={user} peers={PEERS} onSpotlight={id=>{setSpotId(id);setLayout("spotlight");}}/>
            : <SpotlightLayout setVideoRef={setVideoRef} status={status} isMuted={isMuted} isCamOff={isCamOff} user={user} peers={PEERS} spotId={spotId} onSelect={setSpotId}/>
          }
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div key="sidebar" initial={{width:0,opacity:0}} animate={{width:300,opacity:1}} exit={{width:0,opacity:0}}
              transition={{duration:0.22,ease:"easeInOut"}} className="flex-shrink-0 overflow-hidden min-h-0">
              <div className="w-[300px] h-full">
                <Sidebar
                  socket={socket}
                  roomId={roomId}
                  roomName={roomName}
                  duration={duration}
                  user={user}
                  onNotesChange={handleNotesChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Whiteboard overlay */}
        <AnimatePresence>
          {wbOpen && (
            <Whiteboard socket={socket} roomId={roomId} visible={wbOpen}/>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating Dock (auto-hide) ── */}
      <AnimatePresence>
        {dockVisible && (
          <motion.div
            key="dock"
            initial={{ y:100, opacity:0 }}
            animate={{ y:0,   opacity:1 }}
            exit={{    y:100, opacity:0 }}
            transition={{ type:"spring", stiffness:380, damping:32, mass:0.8 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30"
          >
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background:"rgba(8,10,22,0.88)",
                backdropFilter:"blur(32px) saturate(200%)",
                WebkitBackdropFilter:"blur(32px) saturate(200%)",
                border:"1px solid rgba(255,255,255,0.12)",
                boxShadow:"0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <DockBtn onClick={toggleMute}   active={isMuted}        label={isMuted?"Unmute":"Mute"}      icon={isMuted?<MicOffIco/>:<MicIco/>}/>
              <DockBtn onClick={toggleCamera} active={isCamOff}       label={isCamOff?"Start cam":"Camera"} icon={isCamOff?<CamOffIco/>:<CamIco/>}/>
              <DockBtn onClick={() => setSidebarOpen(s=>!s)} active={!sidebarOpen} label="Notes"           icon={<NotesIco/>}/>
              <DockBtn onClick={() => setWbOpen(w=>!w)}      active={wbOpen}       label="Board"           icon={<WbIco/>}/>

              {/* Divider */}
              <div className="w-px h-8 mx-0.5 flex-shrink-0" style={{ background:"rgba(255,255,255,0.10)" }}/>

              {!recorder.recording
                ? <DockBtn onClick={handleStartRecording} label="Record"     icon={<RecIco/>}/>
                : <DockBtn onClick={handleStopRecording}  label={`${recorder.fmtDur(recorder.duration)}`} icon={<StopIco/>} active pulse/>
              }
              {recorder.blobUrl && (
                <DockBtn onClick={() => recorder.downloadRecording(`focusmeet-${roomId}.webm`)} label="Download" icon={<DlIco/>}/>
              )}

              {/* Divider */}
              <div className="w-px h-8 mx-0.5 flex-shrink-0" style={{ background:"rgba(255,255,255,0.10)" }}/>

              {/* End button */}
              <button
                onClick={() => setEndConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background:"linear-gradient(135deg,#dc2626,#b91c1c)", boxShadow:"0 0 20px rgba(239,68,68,0.30), 0 4px 12px rgba(0,0,0,0.40)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                End
              </button>
            </div>
            {/* Dock handle hint */}
            <div className="flex justify-center mt-1.5">
              <div className="w-8 h-1 rounded-full" style={{ background:"rgba(255,255,255,0.12)" }}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── End confirm modal ── */}
      <AnimatePresence>
        {endConfirm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background:"rgba(0,0,0,0.78)", backdropFilter:"blur(12px)" }}>
            <motion.div initial={{scale:0.9,y:24}} animate={{scale:1,y:0}} exit={{scale:0.9,y:24}}
              className="rounded-2xl p-8 max-w-sm w-full mx-4"
              style={{ background:"rgba(10,12,24,0.97)", border:"1px solid rgba(255,255,255,0.12)", boxShadow:"0 32px 80px rgba(0,0,0,0.75)" }}>
              <h3 className="text-lg font-bold text-white mb-2">End meeting?</h3>
              <p className="text-white/42 text-sm mb-7 leading-relaxed">
                This ends the session for all participants. Your shared notes will be captured in the summary.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setEndConfirm(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/55 hover:text-white/80 transition-colors"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}>
                  Cancel
                </button>
                <button onClick={() => { setEndConfirm(false); handleEnd(); }} className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background:"rgba(239,68,68,0.88)", boxShadow:"0 0 16px rgba(239,68,68,0.30)" }}>
                  End for everyone
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Layouts ────────────────────────────────────────────────────────────────────
function GridLayout({ setVideoRef, status, isMuted, isCamOff, user, peers, onSpotlight }) {
  const count = 1 + peers.length;
  const cols  = count <= 2 ? 2 : count <= 4 ? 2 : 3;
  return (
    <div className="flex-1 grid gap-3 min-h-0 min-w-0" style={{ gridTemplateColumns:`repeat(${cols},1fr)`, gridAutoRows:"1fr" }}>
      <HostTile setVideoRef={setVideoRef} status={status} isMuted={isMuted} isCamOff={isCamOff} user={user} onSpotlight={() => onSpotlight("self")}/>
      {peers.map(p => <PeerTile key={p.id} peer={p} onSpotlight={() => onSpotlight(p.id)}/>)}
    </div>
  );
}

function SpotlightLayout({ setVideoRef, status, isMuted, isCamOff, user, peers, spotId, onSelect }) {
  const isSelf = spotId === "self" || !peers.find(p => p.id === spotId);
  const spot   = peers.find(p => p.id === spotId);
  return (
    <div className="flex-1 flex gap-3 min-h-0">
      <div className="flex-1 min-w-0 min-h-0">
        {isSelf
          ? <HostTile setVideoRef={setVideoRef} status={status} isMuted={isMuted} isCamOff={isCamOff} user={user}/>
          : spot ? <PeerTile peer={spot}/> : null
        }
      </div>
      <div className="w-36 flex flex-col gap-2 overflow-y-auto flex-shrink-0">
        <ThumbnailWrapper active={isSelf} onClick={() => onSelect("self")}>
          <HostTile setVideoRef={setVideoRef} status={status} isMuted={isMuted} isCamOff={isCamOff} user={user}/>
        </ThumbnailWrapper>
        {peers.map(p => (
          <ThumbnailWrapper key={p.id} active={spotId===p.id} onClick={() => onSelect(p.id)}>
            <PeerTile peer={p}/>
          </ThumbnailWrapper>
        ))}
      </div>
    </div>
  );
}

function ThumbnailWrapper({ children, active, onClick }) {
  return (
    <div onClick={onClick} className="rounded-xl overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-200"
      style={{ aspectRatio:"4/3", outline: active ? "2px solid #6366f1" : "none", outlineOffset:"2px" }}>
      {children}
    </div>
  );
}

function HostTile({ setVideoRef, status, isMuted, isCamOff, user }) {
  return (
    <div className="video-tile w-full h-full" style={{ background:"linear-gradient(135deg,#1a2744,#0d1222)", minHeight:"120px" }}>
      {!isCamOff && (
        <video
          ref={setVideoRef} autoPlay muted playsInline
          className="w-full h-full"
          style={{ objectFit:"cover", transform:"scaleX(-1)", display: status==="active" ? "block" : "none" }}
        />
      )}
      {(isCamOff || status !== "active") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background:"rgba(99,102,241,0.22)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.35)" }}>
            {(user?.name || "Me").slice(0,2).toUpperCase()}
          </div>
          {status === "requesting" && <p className="text-xs text-white/30">Requesting camera…</p>}
          {status === "denied"     && <p className="text-xs text-red-400/60">Camera access denied</p>}
          {isCamOff                && <p className="text-xs text-white/30">Camera off</p>}
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(180deg,transparent 55%,rgba(0,0,0,0.55) 100%)", zIndex:1 }}/>
      <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow:"0 0 6px #22c55e" }}/>
          <span className="text-[10px] font-semibold text-white">{user?.name || "You"}</span>
        </div>
        <span className="text-[8px] font-black text-white px-1.5 py-0.5 rounded" style={{ background:"rgba(99,102,241,0.78)" }}>HOST</span>
      </div>
      {isMuted && (
        <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full flex items-center justify-center" style={{ background:"rgba(239,68,68,0.90)" }}>
          <MicOffIco size={10}/>
        </div>
      )}
    </div>
  );
}

function PeerTile({ peer }) {
  const vRef = useRef(null);
  useEffect(() => { if (vRef.current) vRef.current.srcObject = null; }, []);
  return (
    <div className="video-tile w-full h-full" style={{ background:"linear-gradient(135deg,#0d1222,#111827)", minHeight:"80px" }}>
      {peer.video
        ? <video ref={vRef} src={peer.video} autoPlay muted loop playsInline className="w-full h-full" style={{ objectFit:"cover" }}/>
        : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
              style={{ background:`${peer.color}22`, color:peer.color, border:`1px solid ${peer.color}35` }}>
              {peer.initials}
            </div>
          </div>
        )
      }
      <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(180deg,transparent 55%,rgba(0,0,0,0.55) 100%)", zIndex:1 }}/>
      <div className="absolute bottom-2 left-2.5 z-10">
        <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-md" style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)" }}>
          {peer.name}
        </span>
      </div>
      {peer.muted && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center" style={{ background:"rgba(239,68,68,0.88)" }}>
          <MicOffIco size={9}/>
        </div>
      )}
    </div>
  );
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function HBtn({ children, onClick, active, label }) {
  return (
    <button onClick={onClick} title={label}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
      style={active
        ? { background:"rgba(99,102,241,0.22)", border:"1px solid rgba(99,102,241,0.42)", color:"#a5b4fc" }
        : { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)" }
      }>
      {children}{label}
    </button>
  );
}

function DockBtn({ icon, label, onClick, active=false, pulse=false }) {
  return (
    <button onClick={onClick} title={label}
      className={`flex flex-col items-center gap-1 group transition-transform active:scale-90 ${pulse?"":"hover:scale-105"}`}>
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${pulse?"animate-pulse":""}`}
        style={{
          background: active ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.09)",
          border: `1px solid ${active ? "rgba(239,68,68,0.38)" : "rgba(255,255,255,0.14)"}`,
          boxShadow: active ? "0 0 14px rgba(239,68,68,0.20)" : "none",
        }}
      >
        {icon}
      </div>
      <span className={`text-[8px] font-semibold tracking-wide transition-colors ${active?"text-red-400":"text-white/28 group-hover:text-white/55"}`}>
        {label}
      </span>
    </button>
  );
}

// Icons
const sp = { fill:"none", stroke:"rgba(255,255,255,0.72)", strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round" };
const MicIco    = () => <svg width="17" height="17" viewBox="0 0 24 24" {...sp}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const MicOffIco = ({size=17}) => <svg width={size} height={size} viewBox="0 0 24 24" {...sp} stroke={size<14?"white":"rgba(255,255,255,0.72)"}><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>;
const CamIco    = () => <svg width="17" height="17" viewBox="0 0 24 24" {...sp}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const CamOffIco = () => <svg width="17" height="17" viewBox="0 0 24 24" {...sp}><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 2H1v14a2 2 0 0 0 2 2h14"/><path d="M3 7l4 5M23 7l-6 6m0-6v7"/></svg>;
const NotesIco  = () => <svg width="17" height="17" viewBox="0 0 24 24" {...sp}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const WbIco     = () => <svg width="17" height="17" viewBox="0 0 24 24" {...sp}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const RecIco    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.85)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="rgba(239,68,68,0.85)"/></svg>;
const StopIco   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(239,68,68,0.85)"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>;
const DlIco     = () => <svg width="17" height="17" viewBox="0 0 24 24" {...sp}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const PanelIco  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
const LayoutIco = ({grid}) => grid
  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="10"/></svg>
  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
