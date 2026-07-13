"use client";

import { useEffect, useState } from "react";
import {
  savePushSubscription,
  removePushSubscription,
  sendTestPush,
} from "@/lib/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<
    "checking" | "unsupported" | "off" | "on" | "denied" | "working"
  >("checking");
  const [error, setError] = useState<string | null>(null);
  const [testState, setTestState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleTest() {
    setTestState("sending");
    try {
      await sendTestPush();
      setTestState("sent");
      setTimeout(() => setTestState("idle"), 3000);
    } catch (e: any) {
      setError(e?.message || "Não foi possível enviar o teste.");
      setTestState("error");
    }
  }

  useEffect(() => {
    check();
  }, []);

  async function check() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setStatus(sub ? "on" : "off");
  }

  async function enable() {
    setError(null);
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await savePushSubscription(sub.toJSON() as any);
      setStatus("on");
    } catch (e: any) {
      setError("Não foi possível ativar. Tente novamente.");
      setStatus("off");
    }
  }

  async function disable() {
    setError(null);
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch {
      setError("Não foi possível desativar. Tente novamente.");
      setStatus("on");
    }
  }

  if (status === "checking") {
    return <p className="text-sm text-[var(--ink-soft)]">Verificando...</p>;
  }

  if (status === "unsupported") {
    return (
      <p className="text-sm text-[var(--ink-soft)]">
        Este navegador não aceita notificações. Para receber lembretes, adicione
        o app à tela inicial pelo Chrome ou Safari.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-sm text-[var(--danger)]">
        As notificações estão bloqueadas nas configurações do navegador. Ative-as
        manualmente para receber os lembretes.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={status === "on" ? disable : enable}
        disabled={status === "working"}
        className={`tap rounded-lg px-4 py-2.5 text-sm font-medium ${
          status === "on"
            ? "border border-[var(--line)] text-[var(--ink-soft)]"
            : "bg-[var(--primary)] text-[var(--primary-ink)]"
        }`}
      >
        {status === "working"
          ? "Aguarde..."
          : status === "on"
          ? "Notificações ativadas · desativar"
          : "Ativar notificações"}
      </button>

      {status === "on" && (
        <div>
          <button
            onClick={handleTest}
            disabled={testState === "sending"}
            className="tap text-xs text-[var(--ink-soft)] underline underline-offset-2"
          >
            {testState === "sending"
              ? "Enviando..."
              : testState === "sent"
              ? "Notificação enviada ✓"
              : "Enviar notificação de teste"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
