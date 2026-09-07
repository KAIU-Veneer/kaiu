import React from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import './LanguageSwitch.css';

/** EN/ID language pill: click to toggle site language. */
export default function LanguageSwitch() {
  const { lang, toggle } = useLanguage();
  return (
    <button type="button" className="lang-switch" onClick={toggle} aria-label="Toggle language">
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}
