"use client";

import Link from 'next/link';
import Image from 'next/image';
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
        <Image
          src="/logo.png"
          alt="ZYT X - Driven by Growth"
          width={120}
          height={62}
          style={{ height: '42px', width: 'auto', display: 'block' }}
          priority
        />
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
