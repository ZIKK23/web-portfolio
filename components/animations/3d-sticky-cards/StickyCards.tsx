'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PROJECT_CARDS } from '../../../lib/projects';

const CARD_Y_OFFSET = 5;
const CARD_SCALE_STEP = 0.075;
const totalCards = PROJECT_CARDS.length;

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function StickyCards() {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const didMountRef = useRef(false);
  const [order, setOrder] = useState(() => PROJECT_CARDS.map((_, i) => i));

  useEffect(() => {
    const targets = order.map((projectIndex) => cardRefs.current[projectIndex]).filter(Boolean) as HTMLElement[];

    order.forEach((projectIndex, stackPos) => {
      const el = cardRefs.current[projectIndex];
      if (!el) return;

      const vars = {
        xPercent: -50,
        yPercent: -50 + stackPos * CARD_Y_OFFSET,
        scale: 1 - stackPos * CARD_SCALE_STEP,
        zIndex: totalCards - stackPos,
      };

      if (!didMountRef.current) {
        gsap.set(el, vars);
      } else {
        gsap.to(el, { ...vars, duration: 0.5, ease: 'power2.out' });
      }
    });

    didMountRef.current = true;

    return () => {
      gsap.killTweensOf(targets);
    };
  }, [order]);

  const advance = () => {
    setOrder((prev) => [...prev.slice(1), prev[0]]);
  };

  return (
    <section className="sticky-cards" ref={rootRef}>
      {PROJECT_CARDS.map((project, i) => (
        <div
          className="card"
          id={project.id}
          key={project.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          role="button"
          tabIndex={0}
          onClick={advance}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              advance();
            }
          }}
        >
          <div className="card-body">
            <div className="col">
              <h1>{project.title}</h1>
              <p>{project.description}</p>
            </div>
            <div className="col card-image-placeholder" />
          </div>
          <a
            className="card-github-link"
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.title} on GitHub`}
            onClick={(e) => e.stopPropagation()}
          >
            <GithubIcon />
          </a>
        </div>
      ))}
    </section>
  );
}
