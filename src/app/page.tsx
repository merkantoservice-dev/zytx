import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <video 
              src="/hero-video.mp4" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
            <div className={styles.heroGradient}></div>
          </div>

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              DRIVEN BY
              <span>GROWTH.</span>
            </h1>
            <p className={styles.heroText}>
              ZYT X builds opportunities, accelerates businesses and turns strategic direction into measurable growth.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/about" className={styles.btnPrimary}>
                Explore ZYT X
                <ArrowIcon />
              </Link>
              <Link href="/contact" className={styles.btnGhost}>
                Start a Conversation
                <ArrowIcon />
              </Link>
            </div>
          </div>
          
          <div className={styles.heroTags}>
            <span>BUSINESS<br/>DEVELOPMENT</span>
            <span>TRADING</span>
            <span>STRATEGIC GROWTH</span>
            <div className={styles.heroTagsLine}></div>
          </div>

          <div className={styles.scrollIndicator}>
            <div className={styles.scrollIcon}></div>
            <span className={styles.scrollText}>SCROLL</span>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className={styles.about}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <div className={styles.sectionHeaderLineBlock}>
                <span className={styles.sectionLabel}>ABOUT ZYT X</span>
                <div className={styles.line}></div>
                <span className={styles.sectionNumber}>01</span>
              </div>
              <h2>Growth isn't<br/>a destination.<br/><span>It's how we operate.</span></h2>
              <p>
                ZYT X is a business development and trading firm focused on identifying opportunities, building strategic relationships and creating measurable progress.
                <br/><br/>
                We combine insight, disciplined execution and a clear understanding of markets to help businesses move forward with purpose.
              </p>
              <Link href="/about" className={styles.linkWithIcon}>
                Discover ZYT X
                <ArrowIcon />
              </Link>
            </div>
            <div className={styles.aboutVisual}>
              <div className={styles.aboutImageWrapper}>
                <video
                  src="/section-2-video.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.aboutImage}
                />
              </div>
              <div className={styles.aboutTags}>
                <p>PEOPLE</p>
                <p>OPPORTUNITIES</p>
                <p>PERFORMANCE</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT WE DO SECTION */}
        <section id="what-we-do" className={styles.services}>
          <div className={`${styles.sectionHeaderLineBlock} ${styles.sectionHeaderDark}`}>
            <span className={`${styles.sectionLabel} ${styles.sectionLabelDark}`}>WHAT WE DO</span>
            <div className={styles.line}></div>
            <span className={`${styles.sectionNumber} ${styles.sectionNumberDark}`}>02</span>
          </div>
          <h2 className={styles.responsiveHeadingLg} style={{ marginBottom: '3.5rem' }}>Built to move businesses forward.</h2>
          
          <div className={styles.servicesList}>
            <div className={styles.serviceItem}>
              <div className={styles.serviceNumber}>01</div>
              <div className={styles.serviceText}>
                <h3>Business Development</h3>
                <p>Identifying opportunities, developing markets and building pathways for sustainable growth.</p>
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
                <p>A disciplined approach to trading built around market understanding, opportunity and long-term value.</p>
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
                <p>Connecting businesses, people and opportunities to create relationships designed to scale.</p>
              </div>
              <div className={styles.serviceImageWrapper}>
                <img src="/section 3 card 3.png" alt="Strategic Partnerships" className={styles.serviceImage} />
              </div>
              <div className={styles.serviceArrow}><ArrowIcon /></div>
            </div>
          </div>
          <div style={{ marginTop: '4rem' }}>
            <Link href="/what-we-do" className={styles.btnPrimaryDark}>
              Explore What We Do
              <ArrowIcon />
            </Link>
          </div>
        </section>

        {/* APPROACH SECTION */}
        <section id="approach" className={styles.approach}>
          <div className={styles.approachContent}>
            <div className={styles.approachImageWrapper}>
              <img src="/zytx hero section image.png" alt="Our Approach" className={styles.approachImage} />
            </div>
            <div className={styles.approachText}>
              <div className={styles.sectionHeaderLineBlock}>
                <span className={styles.sectionLabel}>OUR APPROACH</span>
                <div className={styles.line}></div>
                <span className={styles.sectionNumber}>03</span>
              </div>
              <h2>Insight.<br/>Execution.<br/>Scalable impact.</h2>
              <p>We believe growth comes from understanding the opportunity, defining the right direction and executing with precision.</p>
              <Link href="/approach" className={styles.linkWithIcon}>
                Our Approach
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

        {/* COURSES PREVIEW SECTION */}
        <section className={styles.sectionPadLg} style={{ backgroundColor: 'var(--gray-light)' }}>
          <div className={styles.sectionHeaderLineBlock}>
            <span className={styles.sectionLabel}>ZYT X COURSES</span>
            <div className={styles.line}></div>
            <span className={styles.sectionNumber}>04</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 className={styles.responsiveHeadingXl} style={{ marginBottom: '1.5rem' }}>
                Knowledge built<br/>for growth.
              </h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Practical learning experiences designed to turn business and market knowledge into real-world capability.
              </p>
            </div>
            <Link href="/courses" className={styles.btnPrimary}>
              Explore Courses
              <ArrowIcon />
            </Link>
          </div>
        </section>

        {/* CTA SECTION */}
        <section id="contact" className={styles.cta}>
          <div className={styles.ctaContent}>
            <div>
              <h2>Ready to create<br/>what's next?</h2>
            </div>
            <div className={styles.ctaRight}>
              <p>Partner with ZYT X to explore new opportunities, strengthen your direction and accelerate your growth journey.</p>
              <Link href="/contact" className={styles.btnWhite}>
                Start a Conversation
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
