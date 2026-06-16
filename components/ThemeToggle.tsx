"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-14 h-7" />;

  const isDark = resolvedTheme === "dark";

  const spring = prefersReduced
    ? { type: "tween", duration: 0.15 }
    : { type: "spring", stiffness: 400, damping: 28 };

  return (
    <button
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center w-14 h-7 rounded-full border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
    >
      {/* Track fill — slides in from left (light) or right (dark) */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background: isDark
            ? "color-mix(in oklch, var(--color-primary) 20%, transparent)"
            : "color-mix(in oklch, var(--color-accent) 15%, transparent)",
        }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ type: "spring" }}
      />

      {/* Thumb */}
      <motion.span
        className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full shadow-sm"
        style={{
          background: isDark ? "var(--color-primary)" : "var(--color-accent)",
        }}
        initial={false}
        animate={{ x: isDark ? 28 : 4 }}
        transition={{ type: "spring" }}
      >
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, rotate: -30, scale: 0.6 }
          }
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, rotate: 30, scale: 0.6 }
          }
          transition={prefersReduced ? { duration: 0.1 } : { duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon
              className="h-3 w-3 text-primary-foreground"
              strokeWidth={2.5}
            />
          ) : (
            <Sun
              className="h-3 w-3 text-primary-foreground"
              strokeWidth={2.5}
            />
          )}
        </motion.span>
      </motion.span>
    </button>
  );
}
