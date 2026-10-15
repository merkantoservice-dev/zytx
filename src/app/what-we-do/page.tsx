import Link from "next/link";
import styles from "@/app/page.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function WhatWeDoPage() {
  return (
    <main className={styles.main}>
      <div className={`${styles.pageHeader} ${styles.pageHeaderDark}`}>
        <span className={`${styles.sectionLabel} ${styles.sectionLabelDark}`} style={{ display: 'block', marginBottom: '2rem' }}>WHAT WE DO</span>
        <h1 className={styles.pageHeaderTitle}>Opportunity, turned<br/>into progress.</h1>
        <p className={styles.pageHeaderSubtitle}>
          We work across business development, trading and strategic partnerships to create pathways for sustainable growth.
        </p>
      </div>

      <section className={styles.services} style={{ padding: '0 0 8rem', backgroundColor: 'var(--navy-dark)' }}>
        <div className={styles.servicesList}>
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceNumber}>01</div>
            <div className={styles.serviceText}>
              <h3>Business Development</h3>
              <p style={{ marginBottom: '1rem' }}>We identify opportunities, develop relationships and create strategies that help businesses enter new markets, expand their reach and unlock new possibilities.</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-blue)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Market Development · Growth Strategy · Opportunity Identification · Business Expansion · Commercial Development
              </p>
              <div style={{ marginTop: '2rem' }}>
                <Link href="/contact" className={styles.btnPrimaryDark}>
                  Discuss an Opportunity
                  <ArrowIcon />
                </Link>
              </div>
            </div>
            <div className={styles.serviceImageWrapper}>
              <img src="/section 3 card 1.png" alt="Business Development" className={styles.serviceImage} />
            </div>
            <div className={styles.serviceArrow}><ArrowIcon /></div>
          </div>
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceNumber}>02</div>
            <div className={styles.serviceText}>
              <h3>Trading</h3>
              <p style={{ marginBottom: '1rem' }}>Our trading activities are built around market understanding, disciplined decision-making and a forward-looking approach.</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-blue)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Market Opportunities · Trading Strategy · Commercial Networks · Market Intelligence
              </p>
              <div style={{ marginTop: '2rem' }}>
                <Link href="/contact" className={styles.btnPrimaryDark}>
                  Explore Trading
                  <ArrowIcon />
                </Link>
              </div>
            </div>
            <div className={styles.serviceImageWrapper}>
              <img src="/section 3 card 2.png" alt="Trading" className={styles.serviceImage} />
            </div>
            <div className={styles.serviceArrow}><ArrowIcon /></div>
          </div>
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceNumber}>03</div>
            <div className={styles.serviceText}>
              <h3>Strategic Partnerships</h3>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1rem', lineHeight: 1.4 }}>The right connections can change the direction of a business.</h4>
              <p style={{ marginBottom: '1rem' }}>We bring together complementary businesses, opportunities and people to create partnerships capable of generating long-term value.</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-blue)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Partnership Development · Business Connections · Strategic Alliances · Market Access
              </p>
              <div style={{ marginTop: '2rem' }}>
                <Link href="/contact" className={styles.btnPrimaryDark}>
                  Partner With Us
                  <ArrowIcon />
                </Link>
              </div>
            </div>
            <div className={styles.serviceImageWrapper}>
              <img src="/section 3 card 3.png" alt="Strategic Partnerships" className={styles.serviceImage} />
            </div>
            <div className={styles.serviceArrow}><ArrowIcon /></div>
          </div>

        </div>
      </section>

      <div className={styles.darkBanner} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h2>Different capabilities.<br/>One direction — growth.</h2>
      </div>
    </main>
  );
}
