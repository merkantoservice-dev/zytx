"use client";

import styles from "@/app/page.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <span className={styles.sectionLabel} style={{ display: 'block', marginBottom: '2rem' }}>CONTACT</span>
        <h1 className={styles.pageHeaderTitle}>Let's create<br/>what's next.</h1>
        <p className={styles.pageHeaderSubtitle}>
          Whether you're exploring a business opportunity, partnership, trading enquiry or one of our courses, we'd like to hear from you.
        </p>
      </div>
      
      <section className={styles.sectionPadLg}>
        <div className={styles.grid2}>
          
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '2.5rem', letterSpacing: '-1px' }}>Start a Conversation</h3>
            <form className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" className={styles.formInput} placeholder="Your full name" />
              </div>
              <div className={styles.grid2} style={{ gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input type="email" className={styles.formInput} placeholder="name@company.com" />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input type="tel" className={styles.formInput} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Company</label>
                <input type="text" className={styles.formInput} placeholder="Your company name" />
              </div>
              
              <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                <label style={{ marginBottom: '0.75rem' }}>I'm interested in &darr;</label>
                <div className={styles.formRadioGroup}>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="business_development" /> Business Development
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="trading" /> Trading
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="strategic_partnership" /> Strategic Partnership
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="courses" /> Courses
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="other" /> Other
                  </label>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                <label>Message</label>
                <textarea className={styles.formTextarea} placeholder="How can we help you achieve your goals?"></textarea>
              </div>

              <button type="button" className={styles.btnPrimaryDark} style={{ width: 'fit-content', backgroundColor: 'var(--navy)', color: 'white', marginTop: '1.5rem' }}>
                Send Enquiry
                <ArrowIcon />
              </button>
            </form>
          </div>

          <div className={styles.contactDetails}>
            <div className={styles.detailBlock}>
              <h4>Business Enquiries</h4>
              <a href="mailto:contact@zytx.com">contact@zytx.com</a>
            </div>
            <div className={styles.detailBlock}>
              <h4>Call</h4>
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>
            <div className={styles.detailBlock}>
              <h4>Visit</h4>
              <p>100 Strategic Growth Ave.<br/>Suite 400<br/>New York, NY 10001</p>
            </div>
            <div className={styles.detailBlock}>
              <h4>Follow</h4>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <a href="#linkedin" className={styles.linkWithIcon}>LinkedIn ↗</a>
                <a href="#instagram" className={styles.linkWithIcon}>Instagram ↗</a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
