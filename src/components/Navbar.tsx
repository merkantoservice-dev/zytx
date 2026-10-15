"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  
  if (pathname.startsWith('/dashboard') || pathname === '/login') {
    return null;
  }
  
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
        <span className={styles.logoText}>ZYT</span>
        <span className={styles.logoX}>
          X
          <svg className={styles.logoArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="19" x2="19" y2="5"></line>
            <polyline points="5 5 19 5 19 19"></polyline>
          </svg>
        </span>
      </Link>
      <div className={styles.navLinks}>
        <Link href="/" className={pathname === '/' ? styles.active : ''}>Home</Link>
        <Link href="/about" className={pathname === '/about' ? styles.active : ''}>About</Link>
        <Link href="/what-we-do" className={pathname === '/what-we-do' ? styles.active : ''}>What We Do</Link>
        <Link href="/approach" className={pathname === '/approach' ? styles.active : ''}>Our Approach</Link>
        <Link href="/courses" className={pathname === '/courses' ? styles.active : ''}>Courses</Link>
        <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>Contact</Link>
      </div>
      <Link href="/login" className={styles.loginBtn}>
        LOGIN
      </Link>
    </nav>
  );
}
