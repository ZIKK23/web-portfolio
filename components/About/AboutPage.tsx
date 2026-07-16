'use client';

import { useEffect, useRef } from 'react';

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const headshot = root.querySelector<HTMLElement>('.headshot');
    const textBlocks = root.querySelectorAll<HTMLElement>('.text-block');
    const aboutMain = root.querySelector<HTMLElement>('.about-page-main');

    function showTextBlock(index: number) {
      textBlocks.forEach((b, i) => b.classList.toggle('is-visible', i === index));
    }
    showTextBlock(0);

    let lockY = 0;
    let isLocked = false;

    function lockScroll() {
      if (isLocked) return;
      lockY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflowY = 'scroll';
      isLocked = true;
    }

    function unlockScroll() {
      if (!isLocked) return;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflowY = '';
      window.scrollTo({ top: lockY, behavior: 'instant' as ScrollBehavior });
      isLocked = false;
    }

    // 0 IDLE — above section, normal scroll
    // 1 PRE  — locked, accumulating to flip
    // 2 POST — locked, flipped, accumulating to exit
    // 3 DONE — below section, normal scroll
    const sectionAbsBottom = aboutMain
      ? aboutMain.getBoundingClientRect().bottom + window.scrollY
      : Infinity;
    let phase = window.scrollY >= sectionAbsBottom ? 3 : 0;
    let accumulated = 0;

    const FLIP_DELTA = 100;
    const EXIT_DELTA = 100;

    let lastScrollY = window.scrollY;
    function onScroll() {
      if (!aboutMain) return;
      const sy = window.scrollY;
      const isScrollingUp = sy < lastScrollY;
      lastScrollY = sy;

      const rect = aboutMain.getBoundingClientRect();

      if (phase === 0) {
        if (rect.top <= 80 && rect.bottom > window.innerHeight * 0.3) {
          accumulated = 0;
          lockScroll();
          phase = 1;
        }
      } else if (phase === 3 && isScrollingUp) {
        if (rect.bottom >= window.innerHeight - 80 && rect.top < window.innerHeight * 0.7) {
          accumulated = 0;
          lockScroll();
          phase = 2;
        }
      }
    }

    function onWheel(e: WheelEvent) {
      if (phase !== 1 && phase !== 2) return;
      e.preventDefault();
      accumulated += e.deltaY;

      if (phase === 1) {
        if (accumulated >= FLIP_DELTA) {
          headshot?.classList.add('flipped');
          showTextBlock(1);
          phase = 2;
          accumulated = 0;
        } else if (accumulated < -80) {
          unlockScroll();
          phase = 0;
          accumulated = 0;
        }
      } else {
        if (accumulated >= EXIT_DELTA) {
          unlockScroll();
          phase = 3;
          accumulated = 0;
        } else if (accumulated <= -FLIP_DELTA) {
          headshot?.classList.remove('flipped');
          showTextBlock(0);
          phase = 1;
          accumulated = 0;
        }
      }
    }

    let touchY0 = 0;
    let touchBase = 0;

    function onTouchStart(e: TouchEvent) {
      touchY0 = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (phase !== 1 && phase !== 2) return;
      e.preventDefault();
      const dy = touchY0 - e.touches[0].clientY;
      accumulated = touchBase + dy;

      if (phase === 1) {
        if (accumulated >= FLIP_DELTA) {
          headshot?.classList.add('flipped');
          showTextBlock(1);
          phase = 2;
          touchBase = 0; touchY0 = e.touches[0].clientY; accumulated = 0;
        } else if (accumulated < -80) {
          unlockScroll();
          phase = 0;
          touchBase = 0; accumulated = 0;
        }
      } else {
        if (accumulated >= EXIT_DELTA) {
          unlockScroll();
          phase = 3;
          touchBase = 0; accumulated = 0;
        } else if (accumulated <= -FLIP_DELTA) {
          headshot?.classList.remove('flipped');
          showTextBlock(0);
          phase = 1;
          touchBase = 0; touchY0 = e.touches[0].clientY; accumulated = 0;
        }
      }
    }

    function onTouchEnd() {
      touchBase = accumulated;
      touchY0 = 0;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // Timeline drawing.
    const timelineEl = root.querySelector<HTMLElement>('#js-timeline');
    const svgEl = root.querySelector<SVGSVGElement>('#js-timeline-svg');
    const pathEl = root.querySelector<SVGPathElement>('#js-timeline-path');
    const timelineItems = root.querySelectorAll<HTMLElement>('.timeline-item');
    const dots = root.querySelectorAll<HTMLElement>('.timeline-dot');

    let rafId: number | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let onResize: (() => void) | undefined;

    if (timelineEl && svgEl && pathEl && timelineItems.length > 0) {
      if (prefersReducedMotion) {
        timelineItems.forEach((item) => item.classList.add('reveal'));
        dots.forEach((dot) => dot.classList.add('dot-visible'));
        svgEl.style.display = 'none';
      } else {
        const WOBBLE_RANGE = 7;
        const randomVals = Array.from({ length: 40 }, () => Math.random() * 2 - 1);

        let totalLength = 0;
        let revealFracs: number[] = [];
        let currentOffset = 0;

        const fracAtY = (targetY: number) => {
          let lo = 0, hi = 1;
          for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            if (pathEl.getPointAtLength(mid * totalLength).y < targetY) lo = mid;
            else hi = mid;
          }
          return (lo + hi) / 2;
        };

        const buildPath = () => {
          const svgX = 28;
          const timelineTopAbs = timelineEl.getBoundingClientRect().top + window.scrollY;
          const dotYs: number[] = [];

          timelineItems.forEach((item, i) => {
            const title = item.querySelector<HTMLElement>('.timeline-title');
            if (!title) return;
            const titleRect = title.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const titleCenterY = titleRect.top + window.scrollY + titleRect.height / 2;

            const dotTopInItem = titleCenterY - (itemRect.top + window.scrollY) - 6;
            dots[i].style.top = `${dotTopInItem}px`;

            dotYs.push(titleCenterY - timelineTopAbs);
          });

          if (dotYs.length === 0) return;

          const startY = dotYs[0] - 32;
          const endY = dotYs[dotYs.length - 1] + 44;
          const totalH = endY + 10;

          svgEl.setAttribute('viewBox', `0 0 56 ${totalH}`);
          svgEl.style.height = `${totalH}px`;

          const points = [startY, ...dotYs, endY];
          let d = `M ${svgX} ${startY}`;
          for (let i = 1; i < points.length; i++) {
            const mid = (points[i - 1] + points[i]) / 2;
            const cp1x = svgX + randomVals[(i * 2) % 40] * WOBBLE_RANGE;
            const cp2x = svgX + randomVals[(i * 2 + 1) % 40] * WOBBLE_RANGE;
            d += ` C ${cp1x} ${mid}, ${cp2x} ${mid}, ${svgX} ${points[i]}`;
          }
          pathEl.setAttribute('d', d);
          totalLength = pathEl.getTotalLength();

          revealFracs = dotYs.map((dotY) => fracAtY(dotY));

          pathEl.style.strokeDasharray = String(totalLength);
          pathEl.style.strokeDashoffset = String(totalLength);
          currentOffset = totalLength;
        };

        const getScrollFraction = () => {
          const viewH = window.innerHeight;
          const rect = timelineEl.getBoundingClientRect();
          const topAbs = rect.top + window.scrollY;
          const bottomAbs = rect.bottom + window.scrollY;

          const drawStartOffset = 0.7;
          const drawEndOffset = 0.9;

          const drawStart = topAbs - viewH * drawStartOffset;
          const drawEnd = bottomAbs - viewH * drawEndOffset;
          const sy = window.scrollY;

          if (sy < drawStart) return 0;
          if (sy > drawEnd) return 1;
          return (sy - drawStart) / (drawEnd - drawStart);
        };

        const tick = () => {
          const targetOffset = totalLength * (1 - getScrollFraction());
          currentOffset += (targetOffset - currentOffset) * 0.08;
          if (Math.abs(currentOffset - targetOffset) < 0.5) currentOffset = targetOffset;

          pathEl.style.strokeDashoffset = String(currentOffset);

          const drawnFraction = 1 - currentOffset / totalLength;
          revealFracs.forEach((frac, i) => {
            const visible = drawnFraction >= frac;
            dots[i].classList.toggle('dot-visible', visible);
            timelineItems[i].classList.toggle('reveal', visible);
          });

          rafId = requestAnimationFrame(tick);
        };

        const init = () => {
          buildPath();
          if (!rafId) rafId = requestAnimationFrame(tick);
        };

        requestAnimationFrame(() => requestAnimationFrame(init));

        onResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(buildPath, 120);
        };
        window.addEventListener('resize', onResize);
      }
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (onResize) window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      unlockScroll();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <main className="container about-page-main">
        <div className="scroll-animation-container">
          <div className="sticky-wrapper">
            <div className="about-image-stack">
              <div className="headshot">
                <img className="headshot-face doodle-image" src="/Assets/wavingDude.gif" alt="Doodle of Hilmi Zikri" />
                <img className="headshot-face real-photo" src="/Assets/irlHeadshot.jpg" alt="Hilmi Zikri Headshot" />
              </div>
            </div>

            <div className="about-text-stack">
              <div className="text-block" id="philosophy-text">
                <h1>It Starts with a Sketch</h1>
                <p className="block-text">Napkins, printer paper, sketchbooks or just my mind, my projects start from a simple idea that is brought to reality. If you need a creative developer, a technical designer, or anything in between, I can bring a new perspective to your vision.</p>
              </div>

              <div className="text-block" id="intro-text">
                <h1>About Me</h1>
                <p className="block-text">I&apos;m Zikri, a 2nd-year computer science and engineering student at Northeastern University. You can usually find me hopping between Boston and New York City, wandering around capturing urban experiences on my camera or absorbing inspiration for my new development or engineering project. If there&apos;s too much coffee in your office, I&apos;m always willing to help out!</p>
                {/* Resume download removed — was the original owner's real PDF (third-party PII). Add Zikri's own resume to public/Assets/ and restore this link. */}
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="timeline-section">
        <h2 className="timeline-heading">Experience</h2>
        <div className="timeline" id="js-timeline">
          <svg className="timeline-svg" id="js-timeline-svg" aria-hidden="true">
            <path id="js-timeline-path" className="timeline-path" />
          </svg>

          <div className="timeline-item">
            <div className="timeline-dot" id="js-dot-0"></div>
            <div className="timeline-content">
              <span className="timeline-date">Jan 2026 — Present</span>
              <h3 className="timeline-title">Quality Test Engineering Co-op</h3>
              <p className="timeline-company">SharkNinja</p>
              <p className="timeline-desc">Working across product development cycles on consumer electronics and home appliance platforms. Performed quality assurance testing using rapid prototyping and constructed automated testing frameworks.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot" id="js-dot-1"></div>
            <div className="timeline-content">
              <span className="timeline-date">Jul 2023 — Oct 2023</span>
              <h3 className="timeline-title">Technical Support Engineer</h3>
              <p className="timeline-company">Insights Gaming</p>
              <p className="timeline-desc">Provided technical support and troubleshooting for Insight Gaming&apos;s screen capture software, using various diagnostic tools and techniques.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot" id="js-dot-2"></div>
            <div className="timeline-content">
              <span className="timeline-date">Jun 2020 — Jul 2024</span>
              <h3 className="timeline-title">STEM Tutor</h3>
              <p className="timeline-company">Sylvan Learning</p>
              <p className="timeline-desc">Led interactive STEM based sessions for elementary school students, creating lesson plans for chemistry experiments and guiding through math concepts. Introduced programming concepts through Scratch.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
