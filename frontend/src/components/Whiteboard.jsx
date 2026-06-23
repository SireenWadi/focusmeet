/**
 * Whiteboard.jsx — Production collaborative canvas
 * Fixed: proper pointer event handling, smooth drawing,
 *        full color palette, pen/eraser/shapes tools,
 *        Socket.io real-time sync
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PALETTE = [
  "#ffffff","#a5b4fc","#22d3ee","#34d399",
  "#fbbf24","#f87171","#f472b6","#c084fc",
  "#60a5fa","#4ade80","#fb923c","#000000",
];
const BRUSH_SIZES = [2, 5, 10, 18, 28];
const TOOLS = ["pen","eraser","line","rect","ellipse"];

export default function Whiteboard({ socket, roomId, visible }) {
  const canvasRef    = useRef(null);
  const overlayRef   = useRef(null); // temp canvas for shape preview
  const ctxRef       = useRef(null);
  const overlayCtxRef= useRef(null);
  const isDown       = useRef(false);
  const startPos     = useRef({ x:0, y:0 });
  const history      = useRef([]); // array of ImageData snapshots for undo

  const [color,  setColor]  = useState("#ffffff");
  const [size,   setSize]   = useState(5);
  const [tool,   setTool]   = useState("pen");
  const [showPalette, setShowPalette] = useState(true);

  // ── Canvas init & resize observer ────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const canvas  = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const initCanvas = () => {
      const w = canvas.offsetWidth  || 800;
      const h = canvas.offsetHeight || 500;
      // Save existing drawing
      const img = ctxRef.current
        ? ctxRef.current.getImageData(0, 0, canvas.width, canvas.height)
        : null;
      canvas.width  = w; canvas.height  = h;
      overlay.width = w; overlay.height = h;
      const ctx = canvas.getContext("2d");
      ctx.lineCap   = "round";
      ctx.lineJoin  = "round";
      ctx.imageSmoothingEnabled = true;
      ctxRef.current = ctx;
      if (img) ctx.putImageData(img, 0, 0);

      const octx = overlay.getContext("2d");
      octx.lineCap  = "round";
      octx.lineJoin = "round";
      overlayCtxRef.current = octx;
    };

    initCanvas();
    const ro = new ResizeObserver(initCanvas);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [visible]);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !visible) return;
    socket.on("whiteboard:draw",  renderRemoteStroke);
    socket.on("whiteboard:clear", () => clearAll(false));
    socket.on("whiteboard:undo",  () => undoLocal(false));
    return () => {
      socket.off("whiteboard:draw");
      socket.off("whiteboard:clear");
      socket.off("whiteboard:undo");
    };
  }, [socket, visible]);

  // ── Render a stroke (local or remote) ────────────────────────────────────
  const renderRemoteStroke = useCallback((stroke) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    applyStroke(ctx, stroke);
  }, []);

  function applyStroke(ctx, stroke) {
    ctx.save();
    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color;
    }
    ctx.lineWidth = stroke.size;
    ctx.lineCap   = "round";
    ctx.lineJoin  = "round";

    if (stroke.tool === "pen" || stroke.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(stroke.x0, stroke.y0);
      ctx.lineTo(stroke.x1, stroke.y1);
      ctx.stroke();
    } else if (stroke.tool === "line") {
      ctx.beginPath();
      ctx.moveTo(stroke.x0, stroke.y0);
      ctx.lineTo(stroke.x1, stroke.y1);
      ctx.stroke();
    } else if (stroke.tool === "rect") {
      ctx.beginPath();
      ctx.strokeRect(stroke.x0, stroke.y0, stroke.x1 - stroke.x0, stroke.y1 - stroke.y0);
    } else if (stroke.tool === "ellipse") {
      const rx = Math.abs(stroke.x1 - stroke.x0) / 2;
      const ry = Math.abs(stroke.y1 - stroke.y0) / 2;
      const cx = Math.min(stroke.x0, stroke.x1) + rx;
      const cy = Math.min(stroke.y0, stroke.y1) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  // ── Snapshot for undo ──────────────────────────────────────────────────────
  function saveSnapshot() {
    const ctx = ctxRef.current;
    const c   = canvasRef.current;
    if (!ctx || !c) return;
    if (history.current.length > 40) history.current.shift();
    history.current.push(ctx.getImageData(0, 0, c.width, c.height));
  }

  // ── Pointer events ────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    isDown.current = true;
    const pos = getPos(e);
    startPos.current = pos;
    if (tool === "pen" || tool === "eraser") {
      saveSnapshot();
    }
    // Set capture so we keep events even if pointer leaves canvas
    canvasRef.current.setPointerCapture(e.pointerId);
  }, [tool]);

  const lastPos = useRef({ x:0, y:0 });

  const onPointerMove = useCallback((e) => {
    e.preventDefault();
    if (!isDown.current) return;
    const pos = getPos(e);

    if (tool === "pen" || tool === "eraser") {
      const stroke = {
        tool, color, size,
        x0: lastPos.current.x || startPos.current.x,
        y0: lastPos.current.y || startPos.current.y,
        x1: pos.x, y1: pos.y,
      };
      applyStroke(ctxRef.current, stroke);
      socket?.emit("whiteboard:draw", { roomId, stroke });
    } else {
      // Shape preview on overlay
      const octx = overlayCtxRef.current;
      const ov   = overlayRef.current;
      if (!octx || !ov) return;
      octx.clearRect(0, 0, ov.width, ov.height);
      const previewStroke = { tool, color, size, x0: startPos.current.x, y0: startPos.current.y, x1: pos.x, y1: pos.y };
      applyStroke(octx, previewStroke);
    }
    lastPos.current = pos;
  }, [tool, color, size, socket, roomId]);

  const onPointerUp = useCallback((e) => {
    if (!isDown.current) return;
    isDown.current = false;
    const pos = getPos(e);

    if (tool !== "pen" && tool !== "eraser") {
      saveSnapshot();
      const stroke = { tool, color, size, x0: startPos.current.x, y0: startPos.current.y, x1: pos.x, y1: pos.y };
      applyStroke(ctxRef.current, stroke);
      socket?.emit("whiteboard:draw", { roomId, stroke });
      // Clear overlay
      const ov = overlayRef.current;
      overlayCtxRef.current?.clearRect(0, 0, ov.width, ov.height);
    }
    lastPos.current = { x:0, y:0 };
  }, [tool, color, size, socket, roomId]);

  // ── Actions ───────────────────────────────────────────────────────────────
  function clearAll(emit = true) {
    const c   = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !c) return;
    ctx.clearRect(0, 0, c.width, c.height);
    history.current = [];
    if (emit) socket?.emit("whiteboard:clear", { roomId });
  }

  function undoLocal(emit = true) {
    const snap = history.current.pop();
    const ctx  = ctxRef.current;
    const c    = canvasRef.current;
    if (!ctx || !c) return;
    if (snap) ctx.putImageData(snap, 0, 0);
    else ctx.clearRect(0, 0, c.width, c.height);
    if (emit) socket?.emit("whiteboard:undo", { roomId });
  }

  const toolIcons = {
    pen:     "✏️",
    eraser:  "◻",
    line:    "╱",
    rect:    "▭",
    ellipse: "◯",
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity:0, scale:0.98 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.98 }}
      transition={{ duration:0.2 }}
      className="absolute inset-0 z-30 flex flex-col"
      style={{ background:"rgba(4,6,14,0.95)", backdropFilter:"blur(16px)" }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 flex-wrap"
        style={{ background:"rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Title */}
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mr-1 hidden sm:block">Whiteboard</span>

        {/* Tools */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
          {TOOLS.map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200"
              style={tool === t
                ? { background:"rgba(99,102,241,0.35)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.50)" }
                : { color:"rgba(255,255,255,0.40)", border:"1px solid transparent" }
              }
            >
              {toolIcons[t]}
            </button>
          ))}
        </div>

        {/* Brush sizes */}
        <div className="flex items-center gap-1.5 px-2">
          {BRUSH_SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className="rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
              style={{
                width: 28, height: 28,
                background: size === s ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${size === s ? "rgba(99,102,241,0.50)" : "rgba(255,255,255,0.10)"}`,
              }}
            >
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  width: Math.min(s * 0.8, 16),
                  height: Math.min(s * 0.8, 16),
                  background: tool === "eraser" ? "rgba(255,255,255,0.3)" : color,
                  boxShadow: size === s ? `0 0 6px ${color}80` : "none",
                }}
              />
            </button>
          ))}
        </div>

        {/* Color swatch — active color */}
        <button
          onClick={() => setShowPalette(p => !p)}
          className="w-8 h-8 rounded-xl border-2 flex-shrink-0 transition-all duration-200"
          style={{
            background: color,
            borderColor: showPalette ? "#a5b4fc" : "rgba(255,255,255,0.20)",
            boxShadow: `0 0 12px ${color}60`,
          }}
          title="Toggle palette"
        />

        {/* Color palette */}
        <AnimatePresence>
          {showPalette && (
            <motion.div
              initial={{ opacity:0, scale:0.9, x:-4 }}
              animate={{ opacity:1, scale:1, x:0 }}
              exit={{ opacity:0, scale:0.9, x:-4 }}
              transition={{ duration:0.15 }}
              className="flex items-center gap-1.5 p-1.5 rounded-xl"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)" }}
            >
              {PALETTE.map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setTool(t => t === "eraser" ? "pen" : t); }}
                  title={c}
                  className="rounded-lg transition-all duration-150 flex-shrink-0"
                  style={{
                    width: 22, height: 22,
                    background: c,
                    border: color === c ? "2px solid white" : "2px solid rgba(255,255,255,0.15)",
                    transform: color === c ? "scale(1.3)" : "scale(1)",
                    boxShadow: color === c ? `0 0 8px ${c}` : "none",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={() => undoLocal(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:text-white/80"
          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"rgba(255,255,255,0.45)" }}
        >
          ↩ Undo
        </button>
        <button
          onClick={() => clearAll(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{ background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.25)", color:"rgba(239,68,68,0.75)" }}
        >
          🗑 Clear
        </button>
      </div>

      {/* Canvas container — relative so overlay can stack */}
      <div className="flex-1 relative overflow-hidden" style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}>
        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction:"none", display:"block" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={e => { if (isDown.current) onPointerUp(e); }}
        />
        {/* Overlay canvas for shape preview */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ touchAction:"none", display:"block" }}
        />
        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[10px] text-white/15 font-medium tracking-wide">
            {tool === "pen" ? "Draw freely" : tool === "eraser" ? "Erase" : `Draw ${tool} — click & drag`} · Changes sync instantly
          </span>
        </div>
      </div>
    </motion.div>
  );
}
