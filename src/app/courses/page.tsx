import Link from "next/link";
import styles from "@/app/page.module.css";
import CourseDemoSection from "@/components/courses/CourseDemoSection";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

const PlayIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default function CoursesPage() {
  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <span className={styles.sectionLabel} style={{ display: 'block', marginBottom: '2rem' }}>ZYT X COURSES</span>
        <h1 className={styles.pageHeaderTitle}>Learn what moves<br/>businesses forward.</h1>
        <p className={styles.pageHeaderSubtitle}>
          Practical knowledge for people who want to better understand business, markets and growth.
        </p>
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="#demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.85rem 1.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <PlayIcon size={14} color="#ffffff" />
            Watch Free Demo
          </a>
          <a href="#courses-list" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Explore Courses &darr;
          </a>
        </div>
      </div>

      <section className="px-5 py-12 md:px-16 md:py-24">
        <div className={styles.grid2}>
          <div>
            <div className={styles.sectionHeaderLineBlock}>
              <span className={styles.sectionLabel}>LEARN WITH ZYT X</span>
              <div className={styles.line}></div>
              <span className={styles.sectionNumber}>01</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-1px', lineHeight: 1.15 }}>Knowledge is another form of leverage.</h2>
          </div>
          <div style={{ paddingTop: '1rem' }}>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Our courses are designed around practical understanding rather than unnecessary complexity — helping learners develop knowledge they can apply in the real world.
            </p>
          </div>
        </div>
      </section>

      <section id="courses-list" className="px-5 py-8 md:px-16 md:py-24">
        <div className={styles.courseItem}>
          <div className={styles.approachStepNumber}>01</div>
          <div>
            <div className={styles.courseCategory}>DROPSHIPPING</div>
            <h3 className={styles.courseTitle}>Dropshipping Foundations</h3>
            <p className={styles.courseDesc}>Master the mechanics of finding winning products, setting up high-converting stores, and launching your first campaigns.</p>
          </div>
          <div className={styles.courseMeta}>
            <div>
              <div className={styles.metaLabel}>Duration</div>
              <div className={styles.metaValue}>8 Weeks</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Format</div>
              <div className={styles.metaValue}>Online</div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/contact" className={styles.linkWithIcon}>
                View Course
                <ArrowIcon />
              </Link>
              <a
                href="#demo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '4px',
                  border: '1px solid #bfdbfe',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <PlayIcon size={12} color="#2563eb" />
                Watch Demo
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.courseItem} style={{ borderBottom: '1px solid var(--gray-border)' }}>
          <div className={styles.approachStepNumber}>02</div>
          <div>
            <div className={styles.courseCategory}>E-COMMERCE</div>
            <h3 className={styles.courseTitle}>E-Commerce Scaling</h3>
            <p className={styles.courseDesc}>Advanced media buying, supply chain optimization, and brand building to take your store to the next level.</p>
          </div>
          <div className={styles.courseMeta}>
            <div>
              <div className={styles.metaLabel}>Duration</div>
              <div className={styles.metaValue}>12 Weeks</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Format</div>
              <div className={styles.metaValue}>Online / Hybrid</div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/contact" className={styles.linkWithIcon}>
                View Course
                <ArrowIcon />
              </Link>
              <a
                href="#demo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '4px',
                  border: '1px solid #bfdbfe',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <PlayIcon size={12} color="#2563eb" />
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- Live Interactive Course Demo Section --- */}
      <CourseDemoSection />

      <div className={styles.darkBanner}>
        <h2 style={{ fontSize: '3rem', marginBottom: '4rem' }}>LEARN.<br/>APPLY.<br/>GROW.</h2>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Not sure where to start?</p>
        <p style={{ marginBottom: '2rem' }}>Talk to our team and find the course that fits your goals.</p>
        <Link href="/contact" className={styles.btnWhite}>
          Talk to Us
          <ArrowIcon />
        </Link>
      </div>
    </main>
  );
}
