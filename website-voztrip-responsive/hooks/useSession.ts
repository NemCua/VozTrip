"use client";
import { useState, useEffect } from "react";

export function useSession() {
  const [sessionId, setSessionId] = useState<string>("");
  const [deviceApproved, setDeviceApproved] = useState<boolean | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("voz_session");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("voz_session", id);
    }
    setSessionId(id);

    const cached = localStorage.getItem("device_approved");
    if (cached === "true") {
      setDeviceApproved(true);
    } else {
      setDeviceApproved(false);
    }
  }, []);

  const markApproved = () => {
    localStorage.setItem("device_approved", "true");
    setDeviceApproved(true);
  };

  return { sessionId, deviceApproved, markApproved };
}
