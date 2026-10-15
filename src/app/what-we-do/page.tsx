import Link from "next/link";
import styles from "./what-we-do.module.css";

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function WhatWeDoPage() {
  return (
    <main className={styles.main}>
      {/* Page Header */}
      <section className={styles.pageHeader}>
        <span className={styles.sectionLabel}>WHAT WE DO</span>
        <h1 className={styles.pageHeaderTitle}>
          Opportunity, turned<br />into progress.
        </h1>
        <p className={styles.pageHeaderSubtitle}>
          We work across business development, trading and strategic partnerships to create pathways for sustainable growth.
        </p>
      </section>

      {/* Services Showcase */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesList}>
          
          {/* 01: Business Development */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceContent}>
              <div className={styles.serviceMeta}>
                <span className={styles.serviceNumber}>01</span>
                <span className={styles.serviceCategory}>Core Practice</span>
              </div>
              <h2 className={styles.serviceTitle}>Business Development</h2>
              <p className={styles.serviceSubtitle}>Accelerating market entry and enterprise expansion.</p>
              <p className={styles.serviceDesc}>
                We identify opportunities, develop high-value relationships and create strategies that help businesses enter new markets, expand their reach and unlock new possibilities.
              </p>
              
              <div className={styles.tagsContainer}>
                <span className={styles.tag}>Market Development</span>
                <span className={styles.tag}>Growth Strategy</span>
                <span className={styles.tag}>Opportunity Identification</span>
                <span className={styles.tag}>Business Expansion</span>
                <span className={styles.tag}>Commercial Development</span>
              </div>

              <Link href="/contact" className={styles.ctaBtn}>
                Discuss an Opportunity
                <ArrowIcon />
              </Link>
            </div>

            <div className={styles.serviceVisual}>
              <img src="/section 3 card 1.png" alt="Business Development" className={styles.serviceImg} />
            </div>
          </div>

          {/* 02: Trading */}
          <div className={`${styles.serviceCard} ${styles.serviceCardReverse}`}>
            <div className={styles.serviceVisual}>
              <img src="/section 3 card 2.png" alt="Trading" className={styles.serviceImg} />
            </div>

            <div className={styles.serviceContent}>
              <div className={styles.serviceMeta}>
                <span className={styles.serviceNumber}>02</span>
                <span className={styles.serviceCategory}>Core Practice</span>
              </div>
              <h2 className={styles.serviceTitle}>Trading</h2>
              <p className={styles.serviceSubtitle}>Market intelligence backed by disciplined execution.</p>
              <p className={styles.serviceDesc}>
                Our trading activities are built around market understanding, disciplined decision-making and a forward-looking approach to capture global supply and demand dynamics.
              </p>
              
              <div className={styles.tagsContainer}>
                <span className={styles.tag}>Market Opportunities</span>
                <span className={styles.tag}>Trading Strategy</span>
                <span className={styles.tag}>Commercial Networks</span>
                <span className={styles.tag}>Market Intelligence</span>
              </div>

              <Link href="/contact" className={styles.ctaBtn}>
                Explore Trading
                <ArrowIcon />
              </Link>
            </div>
          </div>

          {/* 03: Strategic Partnerships */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceContent}>
              <div className={styles.serviceMeta}>
                <span className={styles.serviceNumber}>03</span>
                <span className={styles.serviceCategory}>Core Practice</span>
              </div>
              <h2 className={styles.serviceTitle}>Strategic Partnerships</h2>
              <p className={styles.serviceSubtitle}>The right connections can change the direction of a business.</p>
              <p className={styles.serviceDesc}>
                We bring together complementary businesses, opportunities and people to create partnerships capable of generating long-term, compounding value.
              </p>
              
              <div className={styles.tagsContainer}>
                <span className={styles.tag}>Partnership Development</span>
                <span className={styles.tag}>Business Connections</span>
                <span className={styles.tag}>Strategic Alliances</span>
                <span className={styles.tag}>Market Access</span>
              </div>

              <Link href="/contact" className={styles.ctaBtn}>
                Partner With Us
                <ArrowIcon />
              </Link>
            </div>

            <div className={styles.serviceVisual}>
              <img src="/section 3 card 3.png" alt="Strategic Partnerships" className={styles.serviceImg} />
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Impact Banner */}
      <section className={styles.bottomBanner}>
        <div className={styles.bottomBannerContent}>
          <h2 className={styles.bottomBannerTitle}>
            Different capabilities.<br />One direction — growth.
          </h2>
          <Link href="/contact" className={styles.bottomBannerBtn}>
            Start a Conversation
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}
