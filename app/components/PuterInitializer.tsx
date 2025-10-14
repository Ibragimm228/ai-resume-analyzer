// @ts-ignore
import { useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";

export default function PuterInitializer() {
  const { init } = usePuterStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const checkAndInit = () => {
      if (cancelled || hasInitialized.current) return;
      if (window.puter) {
        hasInitialized.current = true;
        init();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    checkAndInit();

    return () => {
      cancelled = true;
    };
  }, [init]);

  return null;
}
