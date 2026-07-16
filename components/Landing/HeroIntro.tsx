'use client';

import { useEffect, useRef } from 'react';

const TEXT_TO_TYPE = "Hi! I'm";
const TYPING_SPEED = 100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function HeroIntro() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const typewriterElement = root.querySelector<HTMLElement>('.typewriter-animation');
    const titleElement = root.querySelector<HTMLElement>('#scroll-title');
    const scrollDownTextElement = root.querySelector<HTMLElement>('.scroll-down-text');

    const wordDelay = Math.random() * 50 + 150;
    // Guards against the page navigating away (Nav is always mounted, so a
    // click can unmount this component) mid-animation — without these, the
    // pending timeout/transitionend callbacks fire on detached elements and
    // `no-scroll` never gets removed from <body>, freezing scroll site-wide.
    let cancelled = false;
    let revealTimeout: ReturnType<typeof setTimeout> | undefined;
    let transitionHandler: ((e: TransitionEvent) => void) | undefined;

    function triggerReveal() {
      revealTimeout = setTimeout(() => {
        if (cancelled || !titleElement) return;
        titleElement.style.transition = 'transform 0.7s cubic-bezier(.2,1.2,.6,1), opacity 0.5s';
        titleElement.style.transform = 'translateY(0)';
        titleElement.style.opacity = '1';

        transitionHandler = (e: TransitionEvent) => {
          if (e.propertyName === 'transform') {
            document.body.classList.remove('no-scroll');
            if (scrollDownTextElement) {
              scrollDownTextElement.style.transition = 'opacity 0.7s';
              scrollDownTextElement.style.opacity = '1';
            }
            titleElement.removeEventListener('transitionend', transitionHandler!);
          }
        };
        titleElement.addEventListener('transitionend', transitionHandler);
      }, 250);
    }

    async function typewriterAnimation() {
      if (!typewriterElement) return;
      typewriterElement.textContent = '';

      for (const char of TEXT_TO_TYPE) {
        if (cancelled) return;
        typewriterElement.textContent += char;
        let delay = TYPING_SPEED;
        if (char === ' ') delay += wordDelay;
        await sleep(delay);
      }

      if (cancelled) return;
      triggerReveal();
    }

    if (titleElement) {
      titleElement.style.transform = 'translateY(200px)';
      titleElement.style.opacity = '0';
    }
    if (scrollDownTextElement) {
      scrollDownTextElement.style.opacity = '0';
    }

    window.scrollTo(0, 0);
    document.body.classList.add('no-scroll');

    const startTimeout = setTimeout(() => {
      if (cancelled) return;
      window.scrollTo(0, 0);
      typewriterAnimation();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(startTimeout);
      clearTimeout(revealTimeout);
      if (titleElement && transitionHandler) {
        titleElement.removeEventListener('transitionend', transitionHandler);
      }
      document.body.classList.remove('no-scroll');
    };
  }, []);

  return (
    <section ref={rootRef} className="landing">
      <h2 className="typewriter-animation"></h2>
      <h1 id="scroll-title">ZIKRI</h1>

      <div className="scroll-down-text wave-text">
        <span className="arrow-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
            <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <span>S</span><span>c</span><span>r</span><span>o</span><span>l</span><span>l</span>
        <span style={{ marginLeft: '0.5ch' }}></span>
        <span>D</span><span>o</span><span>w</span><span>n</span>
      </div>
    </section>
  );
}
