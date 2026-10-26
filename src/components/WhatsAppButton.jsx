import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../LanguageContext.jsx';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const { t } = useLanguage();
  const phone = '628131205377';
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return createPortal(
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.a11y.whatsapp}
      className={`whatsapp-float${visible ? '' : ' is-hidden'}`}
    >
      <img src="/assets/icons/whatsapp-160.webp" alt="" width="76" height="76" />
    </a>,
    document.body
  );
}
