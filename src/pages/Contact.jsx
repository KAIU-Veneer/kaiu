import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import useReveal from '../useReveal.js';
import './Contact.css';

// Submissions go to our own server function, which validates them and forwards
// them on. The storage endpoint lives in a server-side env var, never here.
const CONTACT_ENDPOINT = '/api/contact';

export default function Contact() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorKey, setErrorKey] = useState('error');
  const infoRef = useReveal();
  const formRef = useReveal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setStatus('sending');

    const payload = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value,
      company: form.company.value, // honeypot, left empty by real visitors
    };

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus('sent');
        form.reset();
        return;
      }
      setErrorKey(
        res.status === 429 ? 'errorRateLimited'
          : data.error === 'validation_failed' ? 'errorValidation'
            : 'error'
      );
      setStatus('error');
    } catch {
      setErrorKey('errorNetwork');
      setStatus('error');
    }
  };

  return (
    <div className="contact-body page-section">
      <span className="eyebrow">{t.contact.eyebrow}</span>
      <h1>{t.contact.title}</h1>
      <div className="contact-grid">
        <div className="contact-info reveal" ref={infoRef}>
          <dl>
            <dt>{t.contact.studio}</dt>
            <dd>Jl. Pluit Karang Jelita 1, Blok R4 Barat No. 2<br/>Jakarta, Indonesia</dd>
            <dt>{t.contact.email}</dt>
            <dd><a href="mailto:kaiuveneer@gmail.com">kaiuveneer@gmail.com</a></dd>
            <dt>{t.contact.phone}</dt>
            <dd><a href="tel:+628131205377">+62 813 1205 377</a></dd>
            <dt>{t.contact.hours}</dt>
            <dd>{t.contact.hoursValue}</dd>
          </dl>
          <div className="contact-socials">
            <a href="https://www.instagram.com/kaiuveneer/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/assets/icons/instagram.svg" alt="Instagram" /></a>
            <a href="https://wa.me/628131205377" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><img src="/assets/icons/whatsapp.svg" alt="WhatsApp" /></a>
          </div>
        </div>

        {status === 'sent' ? (
          <div className="contact-success">
            <p>{t.contact.success}</p>
          </div>
        ) : (
          <form className="reveal" ref={formRef} onSubmit={handleSubmit} noValidate={false}>
            <div className="contact-form-field">
              <label htmlFor="contact-name">{t.contact.fullName}</label>
              <input id="contact-name" type="text" name="name" required maxLength={100} autoComplete="name" placeholder={t.contact.fullNamePh} />
            </div>
            <div className="contact-form-field">
              <label htmlFor="contact-email">{t.contact.emailField}</label>
              <input id="contact-email" type="email" name="email" required maxLength={254} autoComplete="email" placeholder={t.contact.emailPh} />
            </div>
            <div className="contact-form-field">
              <label htmlFor="contact-phone">{t.contact.enquiryType}</label>
              <input id="contact-phone" type="tel" name="phone" maxLength={40} autoComplete="tel" placeholder={t.contact.enquiryPh} />
            </div>
            <div className="contact-form-field">
              <label htmlFor="contact-message">{t.contact.message}</label>
              <textarea id="contact-message" name="message" required maxLength={4000} placeholder={t.contact.messagePh} />
            </div>

            {/* Honeypot: hidden from people, tempting to bots. */}
            <div className="contact-hp" aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input id="contact-company" type="text" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <button type="submit" className="contact-submit" disabled={status === 'sending'}>
              {status === 'sending' ? t.contact.sending : t.contact.send}
            </button>
            {status === 'error' && (
              <p className="contact-error" role="alert">{t.contact[errorKey] || t.contact.error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
