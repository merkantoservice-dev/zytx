"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Preloader.module.css";

export default function Preloader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only display preloader on first entry of this browser session
    const hasVisited = sessionStorage.getItem("zytx_visited");
    if (hasVisited) {
      setLoading(false);
      return;
    }

    // Don't show preloader if direct navigation to auth/dashboard
    if (pathname.startsWith("/dashboard") || pathname === "/login") {
      setLoading(false);
      return;
    }

    // Lock page scrolling while loading screen is active
    document.body.style.overflow = "hidden";

    const duration = 1300; // 1.3 seconds
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(currentPct);

      if (currentPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFading(true);
          sessionStorage.setItem("zytx_visited", "true");
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = "";
          }, 650); // Matches CSS transition duration
        }, 120);
      }
    }, 20);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className={`${styles.preloader} ${fading ? styles.fadeOut : ""}`} aria-hidden={fading}>
      <div className={styles.content}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoGlow} />
          <Image
            src="/logo-white.png"
            alt="ZYT X"
            width={150}
            height={75}
            priority
            style={{ height: "52px", width: "auto", display: "block" }}
          />
        </div>

        <div className={styles.tagline}>
          DRIVEN BY GROWTH.
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.percentage}>
            {progress < 10 ? `0${progress}%` : `${progress}%`}
          </div>
        </div>
      </div>
    </div>
  );
}
