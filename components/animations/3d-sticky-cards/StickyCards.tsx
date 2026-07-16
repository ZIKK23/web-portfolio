'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECT_CARDS } from '../../../lib/projects';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const CARD_Y_OFFSET = 5;
const CARD_SCALE_STEP = 0.075;

export default function StickyCards() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const normalizer = ScrollTrigger.normalizeScroll(true);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.card', root);
      const totalCards = cards.length;
      const segmentSize = 1 / totalCards;

      cards.forEach((card, i) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50 + i * CARD_Y_OFFSET,
          scale: 1 - i * CARD_SCALE_STEP,
        });
      });

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${cards[0].getBoundingClientRect().height * totalCards * 0.4}px`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIndex = Math.min(Math.floor(progress / segmentSize), totalCards - 1);
          const segProgress = (progress - activeIndex * segmentSize) / segmentSize;

          cards.forEach((card, i) => {
            if (i < activeIndex) {
              gsap.set(card, { yPercent: -400, rotationX: 35 });
            } else if (i === activeIndex) {
              gsap.set(card, {
                yPercent: gsap.utils.interpolate(-50, -200, segProgress),
                rotationX: gsap.utils.interpolate(0, 35, segProgress),
                scale: 1,
              });
            } else {
              const behindIndex = i - activeIndex;
              const currentYOffset = (behindIndex - segProgress) * CARD_Y_OFFSET;
              const currentScale = 1 - (behindIndex - segProgress) * CARD_SCALE_STEP;
              gsap.set(card, { yPercent: -50 + currentYOffset, rotationX: 0, scale: currentScale });
            }
          });
        },
      });
    }, root);

    return () => {
      ctx.revert();
      normalizer?.kill();
    };
  }, []);

  return (
    <section className="sticky-cards" ref={rootRef}>
      {PROJECT_CARDS.map((project) => (
        <a className="card" id={project.id} key={project.id} href={project.repoUrl} target="_blank" rel="noopener noreferrer">
          <div className="col">
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>
          <div className="col card-image-placeholder" />
        </a>
      ))}
    </section>
  );
}
