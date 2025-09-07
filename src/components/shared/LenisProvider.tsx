'use client';

import {
  useLayoutEffect,
  useRef,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import Lenis from '@studio-freight/lenis';

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

   useEffect(() => {
     // <-- change here
     const lenisInstance = new Lenis({
       duration: 1.3,
       easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
       smoothWheel: true,
       syncTouch: true,
     });
     setLenis(lenisInstance);

     function raf(time: number) {
       lenisInstance.raf(time);
       requestAnimationFrame(raf);
     }
     requestAnimationFrame(raf);

     lenisInstance.scrollTo(window.scrollY, { immediate: true });

     return () => {
       lenisInstance.destroy();
     };
   }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
