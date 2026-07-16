'use client';

import { useEffect, useRef } from 'react';

const DEFAULT_NAV_THEME = {
  '--nav-link-bg': 'transparent',
  '--nav-hover-fill': '#5B7C99',
  '--hamburger-hover-bg': '#5B7C99',
};

const FOOTER_NAV_THEME = {
  '--nav-link-bg': '#5B7C99',
  '--nav-hover-fill': '#fff',
  '--hamburger-hover-bg': '#fff',
};

function applyNavTheme(theme: Record<string, string>) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value);
  }
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          applyNavTheme(entry.isIntersecting ? FOOTER_NAV_THEME : DEFAULT_NAV_THEME);
        });
      },
      { root: null, rootMargin: '0px 0px -95% 0px', threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  function handleMouseEnter() {
    const cursor = cursorRef.current;
    if (!cursor) return;
    cursor.style.opacity = '1';
    cursor.style.transform = 'scale(1)';
  }

  function handleMouseLeave() {
    const cursor = cursorRef.current;
    if (!cursor) return;
    cursor.style.opacity = '0';
    cursor.style.transform = 'scale(0)';
  }

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const cursor = cursorRef.current;
    const footer = footerRef.current;
    if (!cursor || !footer) return;
    const rect = footer.getBoundingClientRect();
    const x = e.clientX - rect.left - cursor.offsetWidth / 2;
    const y = e.clientY - rect.top - cursor.offsetHeight / 2;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }

  return (
    <footer
      className="contact-footer"
      ref={footerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div className="footer-content-wrapper">
        <h2 className="footer-title">Let&apos;s Build Cool Stuff!</h2>
        <a href="/contact" className="footer-cta-button">Get in Touch</a>

        <div className="footer-links">
          <a href="mailto:zikrihilmi15@gmail.com" className="footer-link">Email</a>
          <span className="link-separator" aria-hidden="true">|</span>
          <a href="https://www.linkedin.com/in/hilmi-zikri/" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          <span className="link-separator" aria-hidden="true">|</span>
          <a href="https://github.com/ZIKK23" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>&copy; 2025 HILMI ZIKRI</p>
      </div>
      <div className="cursor-effects" ref={cursorRef} />
    </footer>
  );
}
