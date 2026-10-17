"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
            style={{ height: '42px', width: 'auto', display: 'block' }}
            priority
          />
        </Link>

        {/* Desktop Links */}
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

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.mobileToggleActive : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className={styles.hamburgerBar}></span>
          <span className={styles.hamburgerBar}></span>
          <span className={styles.hamburgerBar}></span>
        </button>
      </nav>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.mobileDrawerHeader}>
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/logo.png"
              alt="ZYT X"
              width={100}
              height={50}
              style={{ height: '36px', width: 'auto' }}
            />
          </Link>
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className={styles.mobileDrawerLinks}>
          <Link href="/" className={pathname === '/' ? styles.mobileActive : ''} onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/about" className={pathname === '/about' ? styles.mobileActive : ''} onClick={() => setMobileMenuOpen(false)}>
            About
          </Link>
          <Link href="/what-we-do" className={pathname === '/what-we-do' ? styles.mobileActive : ''} onClick={() => setMobileMenuOpen(false)}>
            What We Do
          </Link>
          <Link href="/approach" className={pathname === '/approach' ? styles.mobileActive : ''} onClick={() => setMobileMenuOpen(false)}>
            Our Approach
          </Link>
          <Link href="/courses" className={pathname === '/courses' ? styles.mobileActive : ''} onClick={() => setMobileMenuOpen(false)}>
            Courses
          </Link>
          <Link href="/contact" className={pathname === '/contact' ? styles.mobileActive : ''} onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
        </div>

        <div className={styles.mobileDrawerFooter}>
          <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setMobileMenuOpen(false)}>
            LOGIN TO PORTAL
          </Link>
        </div>
      </div>
    </>
  );
}
