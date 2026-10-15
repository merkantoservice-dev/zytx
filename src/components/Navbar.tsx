"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (pathname.startsWith('/dashboard') || pathname === '/login') {
    return null;
  }
  
  return (
    <>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="ZYT X - Driven by Growth"
            width={120}
            height={62}
            className={styles.logoImg}
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>Home</Link>
          <Link href="/about" className={pathname === '/about' ? styles.active : ''}>About</Link>
          <Link href="/what-we-do" className={pathname === '/what-we-do' ? styles.active : ''}>What We Do</Link>
          <Link href="/approach" className={pathname === '/approach' ? styles.active : ''}>Our Approach</Link>
          <Link href="/courses" className={pathname === '/courses' ? styles.active : ''}>Courses</Link>
          <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>Contact</Link>
        </div>

        {/* Desktop Login Button */}
        <Link href="/login" className={styles.loginBtn}>
          LOGIN
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.lineOpen1 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.lineOpen2 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.lineOpen3 : ''}`}></span>
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.overlayVisible : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer Menu */}
      <aside className={`${styles.mobileDrawer} ${mobileOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <Link href="/" onClick={() => setMobileOpen(false)} className={styles.logo}>
            <Image
              src="/logo.png"
              alt="ZYT X"
              width={105}
              height={54}
              style={{ height: '36px', width: 'auto' }}
            />
          </Link>
          <button 
            type="button" 
            className={styles.drawerCloseBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className={styles.drawerLinks}>
          <Link href="/" className={pathname === '/' ? styles.activeDrawerLink : styles.drawerLink}>
            <span>Home</span>
            <span className={styles.drawerArrow}>→</span>
          </Link>
          <Link href="/about" className={pathname === '/about' ? styles.activeDrawerLink : styles.drawerLink}>
            <span>About</span>
            <span className={styles.drawerArrow}>→</span>
          </Link>
          <Link href="/what-we-do" className={pathname === '/what-we-do' ? styles.activeDrawerLink : styles.drawerLink}>
            <span>What We Do</span>
            <span className={styles.drawerArrow}>→</span>
          </Link>
          <Link href="/approach" className={pathname === '/approach' ? styles.activeDrawerLink : styles.drawerLink}>
            <span>Our Approach</span>
            <span className={styles.drawerArrow}>→</span>
          </Link>
          <Link href="/courses" className={pathname === '/courses' ? styles.activeDrawerLink : styles.drawerLink}>
            <span>Courses</span>
            <span className={styles.drawerArrow}>→</span>
          </Link>
          <Link href="/contact" className={pathname === '/contact' ? styles.activeDrawerLink : styles.drawerLink}>
            <span>Contact</span>
            <span className={styles.drawerArrow}>→</span>
          </Link>
        </div>

        <div className={styles.drawerFooter}>
          <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setMobileOpen(false)}>
            STUDENT & ADMIN LOGIN
          </Link>
        </div>
      </aside>
    </>
  );
}
