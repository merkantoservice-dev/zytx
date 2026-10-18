"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"></line>
    <polyline points="5 5 19 5 19 19"></polyline>
  </svg>
);

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", "551e7277-b9ef-41d7-9818-5ae105719356");
    formData.append("subject", "New Contact Enquiry from ZYT X Website");
    formData.append("from_name", "ZYT X Website");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully. We will get back to you shortly.",
        });
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to send enquiry. Please try again or contact us directly.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred while sending your message. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '2.5rem', letterSpacing: '-1px' }}>
              Start a Conversation
            </h3>

            {status.type === "success" && (
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  marginBottom: "2rem",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#2563eb" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{status.message}</span>
              </div>
            )}

            {status.type === "error" && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  marginBottom: "2rem",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              >
                {status.message}
              </div>
            )}

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="contact-name">Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  className={styles.formInput}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className={styles.grid2} style={{ gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-email">Email *</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    className={styles.formInput}
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-phone">Phone</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    className={styles.formInput}
                    placeholder="+91 94000 00000"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  name="company"
                  className={styles.formInput}
                  placeholder="Your company name"
                />
              </div>
              
              <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                <label style={{ marginBottom: '0.75rem' }}>I'm interested in &darr;</label>
                <div className={styles.formRadioGroup}>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="Business Development" defaultChecked /> Business Development
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="Trading" /> Trading
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="Strategic Partnership" /> Strategic Partnership
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="Courses" /> Courses
                  </label>
                  <label className={styles.formRadioLabel}>
                    <input type="radio" name="interest" value="Other" /> Other
                  </label>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                <label htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  className={styles.formTextarea}
                  placeholder="How can we help you achieve your goals?"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={styles.btnPrimaryDark}
                style={{
                  width: 'fit-content',
                  backgroundColor: 'var(--navy)',
                  color: 'white',
                  marginTop: '1.5rem',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? "Sending Enquiry..." : "Send Enquiry"}
                {!submitting && <ArrowIcon />}
              </button>
            </form>
          </div>

          <div className={styles.contactDetails}>
            <div className={styles.detailBlock}>
              <h4>Business & Support</h4>
              <a href="mailto:support@zytxventures.com">support@zytxventures.com</a>
            </div>
            <div className={styles.detailBlock}>
              <h4>Call</h4>
              <a href="tel:+919400308350">+91 9400308350</a>
            </div>
            <div className={styles.detailBlock}>
              <h4>Visit</h4>
              <p>HiLITE Business Park<br/>Palazhi, Kozhikode<br/>673014</p>
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
