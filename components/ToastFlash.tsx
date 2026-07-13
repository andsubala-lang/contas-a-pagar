"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function ToastFlash({ message }: { message?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (message) {
      showToast(message);
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return null;
}
