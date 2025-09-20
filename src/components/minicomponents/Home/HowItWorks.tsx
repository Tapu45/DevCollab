'use client';

import { useEffect, useRef } from 'react';
import {
  ProgressSlider,
  SliderBtn,
  SliderContent,
  SliderWrapper,
} from '@/components/Animations/ProgressSlider';

const items = [
  {
    img: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWJzdHJhY3QlMjBwcm9maWxlfGVufDB8fDB8fHww',
    title: 'Identity Formation',
    desc: 'AI analyzes your coding patterns, GitHub activity, and skill progression to create a comprehensive developer profile.',
    sliderName: 'identity',
  },
  {
    img: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YWklMjBtYXRjaGluZ3xlbnwwfHwwfHx8MA%3D%3D',
    title: 'Intelligent Matching',
    desc: 'Advanced algorithms consider technical compatibility, working styles, timezone alignment, and project goals.',
    sliderName: 'matching',
  },
  {
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29sbGFib3JhdGlvbiUyMHdvcmtzcGFjZXxlbnwwfHwwfHx8MA%3D%3D',
    title: 'Collaborative Workspace',
    desc: 'Real-time collaboration tools, shared code repositories, and integrated project management.',
    sliderName: 'workspace',
  },
  {
    img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGF1bmNoJTIwc2NhbGV8ZW58MHx8MHx8fDA%3D',
    title: 'Launch & Scale',
    desc: 'Deploy your collaborative projects, track performance metrics, and build a portfolio.',
    sliderName: 'launch',
  },
];

export default function HowItWorks() {
  const controlsRef = useRef<HTMLDivElement | null>(null);

  // poll for active button and center it inside the controls container
  // useEffect(() => {
  //   const el = controlsRef.current;
  //   if (!el) return;
  //   const interval = setInterval(() => {
  //     const activeBtn: HTMLElement | null = el.querySelector(
  //       'button[data-active="true"]',
  //     );
  //     if (activeBtn) {
  //       // center active item horizontally
  //       activeBtn.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'nearest',
  //         inline: 'center',
  //       });
  //     }
  //   }, 300); // small interval to follow auto-advance
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <section className="relative bg-background py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>

        <ProgressSlider
          vertical={false}
          fastDuration={300}
          duration={4000}
          activeSlider="identity"
          className="w-full"
        >
          {/* Image / hero area */}
          <SliderContent className="w-full">
            {items.map((item, index) => (
              <SliderWrapper
                className="h-full"
                key={index}
                value={item.sliderName}
              >
                <div className="w-full h-[520px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    className="h-full w-full object-cover"
                    src={item.img}
                    alt={item.desc}
                  />
                </div>
              </SliderWrapper>
            ))}
          </SliderContent>

          {/* Bottom overlay controls - using plain div so we can attach a ref */}
          <div
            ref={controlsRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-6 z-30 w-[min(1100px,92%)] flex gap-3 overflow-x-auto px-3 py-3 bg-gradient-to-r from-black/60 via-black/40 to-transparent dark:from-black/60 rounded-xl shadow-xl backdrop-blur-sm"
          >
            {items.map((item, index) => (
              <SliderBtn
                key={index}
                value={item.sliderName}
                className="min-w-[260px] flex-shrink-0 text-left p-4 rounded-md hover:scale-[1.02] transition-transform"
                progressBarClass="left-0 bottom-0 dark:bg-white bg-black h-1 w-full"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-10 rounded-md overflow-hidden bg-gray-800">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/90 text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-100 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </SliderBtn>
            ))}
          </div>
        </ProgressSlider>
      </div>
    </section>
  );
}
