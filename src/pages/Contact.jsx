import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../LanguageContext.jsx';
import useDocumentMeta from '../useDocumentMeta.js';
import './Contact.css';

// Submissions go to our own server function, which validates them and forwards
// them on. The storage endpoint lives in a server-side env var, never here.
const CONTACT_ENDPOINT = '/api/contact';

// The server answers a rejection with the field keys it did not accept. These
// are the labels those keys wear on screen, so the message can name them.
const FIELD_LABELS = {
  name: 'fullName',
  email: 'emailField',
  phone: 'phoneField',
  projectType: 'projectType',
  message: 'message',
};

function ProjectTypeSelect({ label, placeholder, options, value, onChange, invalid }) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const selectedIndex = Math.max(0, options.findIndex(([key]) => key === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const menuId = 'contact-project-type-options';

  const showMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(Math.max(rect.width, 180), window.innerWidth - 24);
    const height = Math.min(options.length * 47 + 12, 300);
    const top = window.innerHeight - rect.bottom >= height + 12
      ? rect.bottom + 8
      : Math.max(12, rect.top - height - 8);
    setPosition({ top, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), width });
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnScroll = () => setOpen(false);
    document.addEventListener('pointerdown', closeOutside);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
    };
  }, [open]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) showMenu();
      else setActiveIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      onChange(options[activeIndex][0]);
      setOpen(false);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <>
      <input type="hidden" name="projectType" value={value} />
      <button
        ref={triggerRef}
        id="contact-project-type"
        type="button"
        className={`contact-select-trigger${open ? ' is-open' : ''}${invalid ? ' is-invalid' : ''}`}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-invalid={invalid || undefined}
        aria-valuetext={value ? options[selectedIndex][1] : placeholder}
        aria-activedescendant={open ? `${menuId}-${options[activeIndex][0]}` : undefined}
        onClick={() => (open ? setOpen(false) : showMenu())}
        onKeyDown={onKeyDown}
      >
        <span className={!value ? 'is-placeholder' : ''}>{value ? options[selectedIndex][1] : placeholder}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 6 4.5 4 4.5-4" /></svg>
      </button>
      {open && position && createPortal(
        <div ref={menuRef} id={menuId} className="contact-select-menu" role="listbox" aria-label={label} style={position}>
          {options.map(([key, text], index) => (
            <div
              key={key}
              id={`${menuId}-${key}`}
              className={`contact-select-option${key === value ? ' is-selected' : ''}${index === activeIndex ? ' is-active' : ''}`}
              role="option"
              aria-selected={key === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => { onChange(key); setOpen(false); triggerRef.current?.focus(); }}
            >
              {text}{key === value && <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default function Contact() {
  const { t } = useLanguage();
  useDocumentMeta(t.meta.contact);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorKey, setErrorKey] = useState('error');
  // Which fields the server rejected, so the message can name them.
  const [badFields, setBadFields] = useState([]);
  const [projectType, setProjectType] = useState('');
  // The form is replaced by the thank-you note on success; move focus there
  // so keyboard and screen reader users land on it instead of nowhere.
  const successRef = useRef(null);
  useEffect(() => {
    if (status === 'sent') successRef.current?.focus();
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!projectType) {
      setBadFields(['projectType']);
      setErrorKey('errorValidation');
      setStatus('error');
      document.getElementById('contact-project-type')?.focus();
      return;
    }
    setStatus('sending');

    const payload = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      projectType,
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
        setProjectType('');
        return;
      }
      setBadFields(Array.isArray(data.fields) ? data.fields : []);
      setErrorKey(
        res.status === 429 ? 'errorRateLimited'
          : data.error === 'validation_failed' ? 'errorValidation'
            : 'error'
      );
      setStatus('error');
    } catch {
      setBadFields([]);
      setErrorKey('errorNetwork');
      setStatus('error');
    }
  };

  const rejected = (field) => (status === 'error' && badFields.includes(field) ? true : undefined);
  const namedFields = badFields
    .map((field) => t.contact[FIELD_LABELS[field]])
    .filter(Boolean)
    .join(', ');

  return (
    <div className="contact-body page-section">
      <div className="contact-heading">
        <h1>{t.contact.title}</h1>
        <p>{t.contact.intro}</p>
      </div>
      <div className="contact-grid">
        {status === 'sent' ? (
          <div className="contact-form contact-success" role="status" tabIndex={-1} ref={successRef}>
            <p>{t.contact.success}</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate={false}>
            <div className="contact-form-field">
              <label htmlFor="contact-name">{t.contact.fullName}</label>
              <input id="contact-name" type="text" name="name" required minLength={3} maxLength={100} autoComplete="name" placeholder={t.contact.fullNamePh} aria-invalid={rejected('name')} />
            </div>
            <div className="contact-form-field">
              <label htmlFor="contact-email">{t.contact.emailField}</label>
              <input id="contact-email" type="email" name="email" required maxLength={254} autoComplete="email" placeholder={t.contact.emailPh} aria-invalid={rejected('email')} />
            </div>
            <div className="contact-form-field">
              <label htmlFor="contact-phone">{t.contact.phoneField} <span className="contact-optional">({t.contact.optional})</span></label>
              <input id="contact-phone" type="tel" name="phone" maxLength={40} autoComplete="tel" placeholder={t.contact.phonePh} aria-invalid={rejected('phone')} />
            </div>
            <div className="contact-form-field">
              <label htmlFor="contact-project-type">{t.contact.projectType}</label>
              <ProjectTypeSelect
                label={t.contact.projectType}
                placeholder={t.contact.projectTypePlaceholder}
                options={['residential', 'commercial', 'hospitality', 'office', 'other'].map((type) => [type, t.contact.projectTypes[type]])}
                value={projectType}
                onChange={(nextValue) => { setProjectType(nextValue); setBadFields((fields) => fields.filter((field) => field !== 'projectType')); }}
                invalid={rejected('projectType')}
              />
            </div>
            <div className="contact-form-field contact-message-field">
              <label htmlFor="contact-message">{t.contact.message}</label>
              <textarea id="contact-message" name="message" required maxLength={4000} placeholder={t.contact.messagePh} aria-invalid={rejected('message')} />
            </div>

            <div className="contact-hp" aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input id="contact-company" type="text" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="contact-form-actions">
              <button type="submit" className="contact-submit" disabled={status === 'sending'}>
                {status === 'sending' ? t.contact.sending : t.contact.send}<span aria-hidden="true">→</span>
              </button>
              {status === 'error' && (
                <p className="contact-error" role="alert">
                  {errorKey === 'errorValidation' && namedFields
                    ? `${t.contact.errorValidationFields} ${namedFields}`
                    : t.contact[errorKey] || t.contact.error}
                </p>
              )}
            </div>
          </form>
        )}

        <aside className="contact-info on-dark">
          <h2>{t.contact.studio}</h2>
          <dl>
            <dt>{t.contact.visit}</dt>
            <dd>Jalan Pluit Karang Sari Blok B7T 64<br/>RT 001 / RW 12<br/>Jakarta Utara 14450, Indonesia</dd>
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
        </aside>
      </div>
    </div>
  );
}
