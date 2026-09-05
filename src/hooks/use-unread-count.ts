"use client";

import { useEffect, useState } from "react";

export function useUnreadCount(initial: number) {
  const [unread, setUnread] = useState(initial);

  useEffect(() => {
    let active = true;
    const fetchCount = () => {
      fetch("/api/unread-count")
        .then((r) => r.json())
        .then((d) => {
          if (active) setUnread(d.unread);
        })
        .catch(() => {});
    };
    const interval = setInterval(fetchCount, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return unread;
}
