import { useEffect, useState } from "react";
import { site } from "../data/site";

function formatTime() {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: site.timezone,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

export function LocalClock() {
  // Render a stable placeholder on the server, real time after mount, so
  // SSR and client markup match (no hydration mismatch).
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    setTime(formatTime());
    const id = setInterval(() => setTime(formatTime()), 1000 * 15);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono tabular-nums" suppressHydrationWarning>
      {time}
    </span>
  );
}
