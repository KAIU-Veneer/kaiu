import React from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import './LanguageSwitch.css';

/** EN/ID language pill: click to toggle site language. */
export default function LanguageSwitch() {
  const { lang, toggle, t } = useLanguage();
  return (
    <button type="button" className="lang-switch" onClick={toggle} aria-label={t.a11y.switchLanguage}>
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}
