"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const LAUNCH_DATE = new Date("2026-07-01T08:00:00Z");

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getTimeLeft() {
  const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

// ---------------------------------------------------------------------------
// Magnetic cursor follower
// ---------------------------------------------------------------------------
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 80, damping: 20 });
  const springY = useSpring(y, { stiffness: 80, damping: 20 });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-0"
      style={{
        left: springX,
        top: springY,
        x: "-50%",
        y: "-50%",
        width: 520,
        height: 520,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(45,106,79,0.07) 0%, transparent 70%)",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Floating data particles — light mode
// ---------------------------------------------------------------------------
function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    type P = {
      x: number;
      y: number;
      speed: number;
      opacity: number;
      size: number;
      val: string;
    };
    let particles: P[] = [];

    function init() {
      if (!canvas) return;
      particles = [];
      const vals = [
        "34%",
        "61%",
        "78%",
        "12%",
        "±3.2",
        "n=1000",
        "89%",
        "45%",
        "σ=0.4",
        "p<0.05",
        "52%",
        "n=847",
      ];
      for (let i = 0; i < 28; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.15 + Math.random() * 0.25,
          opacity: 0.04 + Math.random() * 0.1,
          size: Math.random() > 0.6 ? 11 : 9,
          val: vals[Math.floor(Math.random() * vals.length)],
        });
      }
    }
    init();
    window.addEventListener("resize", init);

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        ctx.font = `${p.size}px 'Geist Mono', monospace`;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = "#1C1C1A";
        ctx.fillText(p.val, p.x, p.y);
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", init);
    };
  }, [prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}

// ---------------------------------------------------------------------------
// Animated digit with slot-machine flip
// ---------------------------------------------------------------------------
function Digit({ value, label }: { value: string; label: string }) {
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value;
      if (prefersReduced) {
        setDisplay(value);
        return;
      }
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplay(value);
        setFlipping(false);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [value, prefersReduced]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden" style={{ lineHeight: 1 }}>
        <motion.span
          animate={
            flipping
              ? { y: "-60%", opacity: 0, scaleY: 0.4 }
              : { y: "0%", opacity: 1, scaleY: 1 }
          }
          transition={{ duration: 0.12, ease: "easeIn" }}
          className="block font-serif font-bold tracking-tighter text-[#1C1C1A] select-none"
          style={{
            fontSize: "clamp(4.5rem, 13vw, 9.5rem)",
            fontVariantNumeric: "tabular-nums",
            minWidth: "2ch",
            textAlign: "center",
          }}
        >
          {display}
        </motion.span>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-2 text-[9px] uppercase tracking-[0.22em] text-[#1C1C1A]"
      >
        {label}
      </motion.span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Magnetic button
// ---------------------------------------------------------------------------
function MagneticButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReduced = useReducedMotion();

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.28);
      y.set((e.clientY - cy) * 0.28);
    },
    [x, y, prefersReduced],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="cursor-pointer rounded-full bg-[#2D6A4F] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#235C43]"
    >
      {children}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Horizontal scrolling ticker
// ---------------------------------------------------------------------------
const TICKER_ITEMS = [
  "Sondages en temps réel",
  "Pondération par raking",
  "Intervalles de confiance",
  "Tableaux croisés",
  "Suivi longitudinal",
  "Export PDF & Excel",
  "Institut de sondage",
  "BlyAnalytics",
];

function Ticker() {
  const prefersReduced = useReducedMotion();
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full overflow-hidden border-y border-[#E0DDD5] py-3.5">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={prefersReduced ? {} : { x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-[11px] uppercase tracking-[0.2em] text-[#1C1C1A]"
          >
            {item}
            <span className="text-[#C77B2E]">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stagger reveal for stat pills
// ---------------------------------------------------------------------------
const STATS = [
  { val: "1 000", label: "répondants cibles" },
  { val: "±3%", label: "marge d'erreur" },
  { val: "20+", label: "itérations raking" },
  { val: "95%", label: "niveau de confiance" },
];

function StatPills() {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-3"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08, delayChildren: 1.4 } },
      }}
    >
      {STATS.map((s, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 12, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2.5 rounded-full border border-[#E0DDD5] bg-white px-4 py-2"
        >
          <span className="font-mono text-sm font-medium text-[#2D6A4F]">
            {s.val}
          </span>
          <span className="text-[11px] text-[#1C1C1A]">{s.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ComingSoonPage() {
  const prefersReduced = useReducedMotion();
  const [time, setTime] = useState(getTimeLeft());
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  function handleNotify() {
    if (!email || !email.includes("@")) {
      setInputError(true);
      setTimeout(() => setInputError(false), 1400);
      return;
    }
    // TODO: connect to Resend / your email list
    setSubmitted(true);
  }

  const fadeUp = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 28 },
    visible: { opacity: 1, y: 0 },
  };

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F7F6F2]">
      {/* Layers */}
      <AmbientParticles />
      <CursorGlow />

      {/* Subtle radial warmth center */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(199,123,46,0.045) 0%, transparent 70%)",
        }}
      />

      {/* Page layout */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center justify-between px-8 py-6"
        >
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-semibold tracking-tight text-[#1C1C1A]">
              Opineo
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight text-[#C77B2E]">
              DJ
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#1C1C1A]">
            by BlyAnalytics
          </span>
        </motion.header>

        {/* Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Ticker />
        </motion.div>

        {/* Hero */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.2 },
              },
            }}
            className="flex flex-col items-center gap-0"
          >
            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease }}
              className="mb-8 text-[11px] uppercase tracking-[0.24em] text-[#1C1C1A]"
            >
              Plateforme d'analyse de sondages
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.8, ease }}
              className="mb-4 font-serif text-5xl font-bold leading-tight tracking-tight text-[#1C1C1A] md:text-6xl lg:text-7xl"
            >
              L'analyse qui compte.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease }}
              className="mb-16 max-w-md text-base font-light text-[#1C1C1A]"
            >
              Un outil de sondage professionnel conçu pour les instituts
              d'analyse — pondération, intervalles de confiance, tableaux
              croisés.
            </motion.p>

            {/* Countdown */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease }}
              className="mb-16 flex items-end"
            >
              <Digit value={pad(time.days)} label="jours" />
              <Sep />
              <Digit value={pad(time.hours)} label="heures" />
              <Sep />
              <Digit value={pad(time.mins)} label="minutes" />
              <Sep />
              <Digit value={pad(time.secs)} label="secondes" />
            </motion.div>

            {/* Stat pills */}
            <div className="mb-14">
              <StatPills />
            </div>

            {/* Email capture */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease }}
              className="flex flex-col items-center gap-4"
            >
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form"
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3"
                  >
                    <motion.input
                      animate={inputError ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                      transition={{ duration: 0.35 }}
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNotify()}
                      className="w-60 rounded-full border bg-white px-5 py-3 text-sm text-[#1C1C1A] placeholder:text-[#9A9A8E] outline-none transition-colors focus:border-[#2D6A4F]"
                      style={{
                        borderColor: inputError ? "#C0392B" : "#E0DDD5",
                      }}
                    />
                    <MagneticButton onClick={handleNotify}>
                      Me prévenir
                    </MagneticButton>
                  </motion.div>
                ) : (
                  <motion.p
                    key="success"
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease }}
                    className="font-serif italic text-[#2D6A4F]"
                  >
                    ✓ Nous vous préviendrons au lancement.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="flex items-center justify-center gap-2 pb-8 text-[11px] text-[#1C1C1A]"
        >
          <PulseDot />
          Développement en cours — lancement prévu septembre 2025
        </motion.footer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------
function Sep() {
  return (
    <span
      aria-hidden="true"
      className="pb-9 font-serif font-bold leading-none tracking-tighter text-[#C77B2E] select-none"
      style={{ fontSize: "clamp(3.8rem, 11vw, 8.5rem)" }}
    >
      :
    </span>
  );
}

function PulseDot() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.25, 1], scale: [1, 0.65, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block h-1.5 w-1.5 rounded-full bg-[#2D6A4F]"
      aria-hidden="true"
    />
  );
}
