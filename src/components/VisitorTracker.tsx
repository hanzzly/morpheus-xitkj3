"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const trackedRef = useRef(false);

  useEffect(() => {
    // Hanya track sekali per session / page load untuk mencegah double counting di dev mode
    if (trackedRef.current) return;

    const trackVisitor = async () => {
      try {
        await fetch("/api/visitors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
          }),
        });
        trackedRef.current = true;
      } catch (error) {
        console.error("Gagal mencatat visitor", error);
      }
    };

    trackVisitor();
  }, [pathname]);

  return null;
}
