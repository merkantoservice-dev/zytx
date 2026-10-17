import Link from "next/link";
import styles from "@/app/page.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <span className={styles.sectionLabel} style={{ display: 'block', marginBottom: '2rem' }}>ABOUT ZYT X</span>
        <h1 className={styles.pageHeaderTitle}>Direction creates momentum.</h1>
        <p className={styles.pageHeaderSubtitle}>
          ZYT X is built around a simple belief: meaningful growth begins with clarity and moves forward through execution.
        </p>
      </div>

      <section className={styles.sectionPad}>
        <div className={styles.grid2}>
          <div>
            <div className={styles.sectionHeaderLineBlock}>
              <span className={styles.sectionLabel}>WHO WE ARE</span>
              <div className={styles.line}></div>
              <span className={styles.sectionNumber}>01</span>
            </div>
            <h2 className={styles.responsiveHeadingLg}>Built for opportunity.</h2>
          </div>
          <div style={{ paddingTop: '1rem' }}>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              ZYT X operates across business development and trading, identifying opportunities and transforming strategic direction into measurable progress.
            </p>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Our approach combines market awareness, strong relationships and disciplined execution to create long-term value.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionPad} style={{ backgroundColor: 'var(--gray-light)' }}>
        <div className={styles.grid2}>
          <div>
            <div className={styles.sectionHeaderLineBlock}>
              <span className={styles.sectionLabel}>OUR PHILOSOPHY</span>
              <div className={styles.line}></div>
              <span className={styles.sectionNumber}>02</span>
            </div>
            <h2 className={styles.responsiveHeadingLg}>Growth with direction.</h2>
          </div>
          <div style={{ paddingTop: '1rem' }}>
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500, color: 'var(--navy)' }}>
              We don't believe in movement for the sake of movement.
            </p>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Every opportunity should have purpose. Every strategy should have direction. And every action should contribute toward measurable progress.
            </p>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              That philosophy is represented directly in the ZYT X identity: the upward arrow integrated into the X represents growth, expansion and strategic acceleration.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionPadLg}>
        <div className={styles.sectionHeaderLineBlock}>
          <span className={styles.sectionLabel}>WHAT DRIVES US</span>
          <div className={styles.line}></div>
          <span className={styles.sectionNumber}>03</span>
        </div>
        
        <div className={styles.grid4} style={{ marginTop: '3rem' }}>
          <div className={styles.valueCard}>
            <h3>Clarity</h3>
            <p>Understand the opportunity before acting.</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Precision</h3>
            <p>Make deliberate decisions backed by insight.</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Progress</h3>
            <p>Focus on outcomes that create meaningful movement.</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Partnership</h3>
            <p>Build relationships capable of creating lasting value.</p>
          </div>
        </div>
      </section>

      <div className={styles.darkBanner}>
        <h2>Built on insight.<br/>Driven by execution.<br/>Focused on what's next.</h2>
        <Link href="/contact" className={styles.btnWhite}>
          Work With ZYT X
          <ArrowIcon />
        </Link>
      </div>
    </main>
  );
}
