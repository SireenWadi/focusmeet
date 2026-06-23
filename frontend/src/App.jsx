import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SocketProvider }  from "./context/SocketContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar       from "./components/Navbar";
import LandingPage  from "./pages/LandingPage";
import CreateRoom   from "./components/CreateRoom";
import MeetingRoom  from "./components/MeetingRoom";
import SummaryPage  from "./components/SummaryPage";
import Dashboard    from "./pages/Dashboard";

const fade = {
  initial: { opacity:0, y:12 },
  enter:   { opacity:1, y:0,  transition:{ duration:0.42, ease:[0.23,1,0.32,1] } },
  exit:    { opacity:0, y:-8, transition:{ duration:0.20 } },
};

function AppInner() {
  const { user } = useAuth();
  const [view,    setView]    = useState("landing");
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);

  const goCreate    = useCallback(() => setView("create"),    []);
  const goLanding   = useCallback(() => { setView("landing"); window.scrollTo(0,0); }, []);
  const goDashboard = useCallback(() => setView("dashboard"), []);

  const scrollTo = useCallback((id) => {
    if (view !== "landing") {
      setView("landing");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" }), 250);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  }, [view]);

  const onRoomCreated = useCallback((s) => { setSession(s); setView("room"); }, []);
  const onRoomJoined  = useCallback((s) => { setSession(s); setView("room"); }, []);

  const onEnd = useCallback((data) => {
    setSummary({
      roomId:       session?.roomId,
      roomName:     session?.roomName || "Meeting",
      duration:     data?.elapsed    || session?.duration * 60 || 0,
      participants: data?.participants || [],
      notes:        data?.notes       || "",
      date:         new Date(),
    });
    setView("summary");
  }, [session]);

  const onNewMeeting = useCallback(() => { setSession(null); setSummary(null); setView("create"); }, []);

  const showNav = view === "landing" || view === "create" || view === "dashboard";

  return (
    <div>
      {showNav && (
        <Navbar
          onStart={goCreate}
          onJoin={goCreate}
          onDashboard={user ? goDashboard : null}
          onScrollTo={scrollTo}
        />
      )}

      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div key="landing" variants={fade} initial="initial" animate="enter" exit="exit">
            <LandingPage onStart={goCreate} onJoin={goCreate}/>
          </motion.div>
        )}
        {view === "create" && (
          <motion.div key="create" variants={fade} initial="initial" animate="enter" exit="exit">
            <CreateRoom
              onRoomCreated={onRoomCreated}
              onRoomJoined={onRoomJoined}
              onDashboard={user ? goDashboard : null}
            />
          </motion.div>
        )}
        {view === "room" && session && (
          <motion.div key="room" variants={fade} initial="initial" animate="enter" exit="exit" style={{ height:"100vh" }}>
            <MeetingRoom
              roomId={session.roomId}
              roomName={session.roomName}
              duration={session.duration}
              user={session.user}
              onEnd={onEnd}
            />
          </motion.div>
        )}
        {view === "summary" && summary && (
          <motion.div key="summary" variants={fade} initial="initial" animate="enter" exit="exit">
            <SummaryPage
              summary={summary}
              onNewMeeting={onNewMeeting}
              onHome={goLanding}
            />
          </motion.div>
        )}
        {view === "dashboard" && (
          <motion.div key="dashboard" variants={fade} initial="initial" animate="enter" exit="exit">
            <Dashboard onStart={goCreate} onHome={goLanding}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppInner/>
      </SocketProvider>
    </AuthProvider>
  );
}
