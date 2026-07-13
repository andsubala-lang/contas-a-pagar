"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToast } from "@/lib/toast";

export default function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeToast((msg) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLeaving(false);
      setMessage(msg);
      timerRef.current = setTimeout(() => setLeaving(true), 2400);
    });
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onAnimationEnd={() => {
        if (leaving) setMessage(null);
      }}
      className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-sm shadow-lg ${
        leaving ? "toast-out" : "toast-in"
      }`}
    >
      {message}
    </div>
  );
}
