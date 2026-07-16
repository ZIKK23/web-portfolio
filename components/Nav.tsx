'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebarOpen(false);
    }
    function handleResize() {
      const isDesktop = window.innerWidth > 768;
      if (isDesktop) setSidebarOpen(false);
    }
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
  }, [isSidebarOpen]);

  return (
    <>
      <nav>
        <ul className={`sidebar${isSidebarOpen ? ' active' : ''}`}>
          <li>
            <a id="close-sidebar" href="#" onClick={(e) => { e.preventDefault(); setSidebarOpen(false); }}>
              <svg xmlns="http://www.w3.org/2000/svg" height={24} viewBox="0 -960 960 960" width={24}>
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </a>
          </li>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/projects">Projects</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <ul>
          <li className="logo">
            <Link href="/">
              <img src="/Assets/boilingName.gif" alt="Hilmi Zikri Portfolio Home" className="logo-img" />
            </Link>
          </li>
          <li className="hideOnMobile nav-link"><Link href="/projects">Projects</Link></li>
          <li className="hideOnMobile nav-link"><Link href="/about">About</Link></li>
          <li className="hideOnMobile nav-link"><Link href="/contact">Contact</Link></li>
          <li className="menu-button">
            <a id="hamburger-menu" href="#" onClick={(e) => { e.preventDefault(); setSidebarOpen(true); }}>
              <svg xmlns="http://www.w3.org/2000/svg" height={24} viewBox="0 -960 960 960" width={24}>
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </a>
          </li>
        </ul>
      </nav>
      <div
        className={`sidebar-overlay${isSidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
    </>
  );
}
