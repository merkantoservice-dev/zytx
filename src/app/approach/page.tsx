import Link from "next/link";
import styles from "@/app/page.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function ApproachPage() {
  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <span className={styles.sectionLabel} style={{ display: 'block', marginBottom: '2rem' }}>OUR APPROACH</span>
        <h1 className={styles.pageHeaderTitle}>Growth doesn't happen<br/>by accident.</h1>
        <p className={styles.pageHeaderSubtitle}>
          It comes from understanding where you are, recognising where opportunity exists and executing the right strategy.
        </p>
      </div>

      <section style={{ padding: '8rem 4rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div className={styles.approachStep}>
            <div className={styles.approachStepNumber}>01</div>
            <div className={styles.approachStepTitle}>Understand</div>
            <div className={styles.approachStepText}>
              <strong style={{ display: 'block', color: 'var(--navy)', marginBottom: '0.5rem' }}>See the bigger picture.</strong>
              We begin by understanding the business, market, challenges and opportunities surrounding it.
            </div>
          </div>
          
          <div className={styles.approachStep}>
            <div className={styles.approachStepNumber}>02</div>
            <div className={styles.approachStepTitle}>Identify</div>
            <div className={styles.approachStepText}>
              <strong style={{ display: 'block', color: 'var(--navy)', marginBottom: '0.5rem' }}>Find where value can be created.</strong>
              We evaluate opportunities and determine where strategic action can generate meaningful progress.
            </div>
          </div>
          
          <div className={styles.approachStep}>
            <div className={styles.approachStepNumber}>03</div>
            <div className={styles.approachStepTitle}>Strategize</div>
            <div className={styles.approachStepText}>
              <strong style={{ display: 'block', color: 'var(--navy)', marginBottom: '0.5rem' }}>Give opportunity direction.</strong>
              Insight becomes a focused strategy with clear priorities and practical objectives.
            </div>
          </div>
          
          <div className={styles.approachStep}>
            <div className={styles.approachStepNumber}>04</div>
            <div className={styles.approachStepTitle}>Execute</div>
            <div className={styles.approachStepText}>
              <strong style={{ display: 'block', color: 'var(--navy)', marginBottom: '0.5rem' }}>Turn direction into action.</strong>
              Strategies only matter when they move. We focus on disciplined execution and strong commercial relationships.
            </div>
          </div>
          
          <div className={styles.approachStep} style={{ borderBottom: '1px solid var(--gray-border)' }}>
            <div className={styles.approachStepNumber}>05</div>
            <div className={styles.approachStepTitle}>Scale</div>
            <div className={styles.approachStepText}>
              <strong style={{ display: 'block', color: 'var(--navy)', marginBottom: '0.5rem' }}>Build beyond the first result.</strong>
              The objective isn't simply short-term movement. It's creating foundations capable of supporting continued growth.
            </div>
          </div>

        </div>
      </section>

      <div className={styles.darkBanner}>
        <p style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '2px', color: 'var(--brand-blue)', marginBottom: '2rem' }}>
          INSIGHT &rarr; STRATEGY &rarr; EXECUTION &rarr; GROWTH
        </p>
        <h2>From opportunity to measurable progress.</h2>
        <Link href="/contact" className={styles.btnWhite}>
          Start a Conversation
          <ArrowIcon />
        </Link>
      </div>
    </main>
  );
}
