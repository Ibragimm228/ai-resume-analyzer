// @ts-ignore
import { useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";

export default function PuterInitializer() {
  const { init } = usePuterStore();
  const hasInitialized = useRef(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const loadPuterScript = () => {
      if (scriptLoaded.current) return;
      
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      document.head.appendChild(script);
      scriptLoaded.current = true;
    };

    const checkAndInit = () => {
      if (cancelled || hasInitialized.current) return;
      if (window.puter) {
        hasInitialized.current = true;
        init();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    loadPuterScript();
    checkAndInit();

    return () => {
      cancelled = true;
    };
  }, [init]);

  return null;
}
