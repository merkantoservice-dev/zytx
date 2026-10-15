"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/demo') {
    return null;
  }
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.col1}>
          <div className={styles.logo}>
            <Image
              src="/logo.png"
              alt="ZYT X - Driven by Growth"
              width={130}
              height={67}
              style={{ height: '48px', width: 'auto', display: 'block' }}
            />
          </div>
          <p className={styles.copyright}>© 2024 ZYT X. All rights reserved.</p>
        </div>
        
        <div className={styles.col2}>
          <ul className={styles.links}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/what-we-do">What We Do</Link></li>
            <li><Link href="/approach">Our Approach</Link></li>
            <li><Link href="/courses">Courses</Link></li>
          </ul>
        </div>
        
        <div className={styles.col3}>
          <div className={styles.topLinks}>
            <Link href="/contact" className={styles.withIcon}>
              Contact
              <ArrowIcon />
            </Link>
            <Link href="#linkedin">LinkedIn</Link>
            <div className={styles.divider}></div>
          </div>
          
          <div className={styles.footerTagline}>
            <p>DRIVEN BY GROWTH.</p>
            <p>BUILT FOR WHAT'S NEXT.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
