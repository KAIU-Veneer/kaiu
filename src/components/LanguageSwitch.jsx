import React from 'react';
import { useLanguage } from '../LanguageContext.jsx';
import './LanguageSwitch.css';

/** EN/ID language pill: click to toggle site language. */
export default function LanguageSwitch() {
  const { lang, toggle, t } = useLanguage();
  return (
    // The label is written in the language it switches to, so it carries that
    // language's tag for screen readers to pronounce it properly.
    <button
      type="button"
      className="lang-switch"
      onClick={toggle}
      aria-label={t.a11y.switchLanguage}
      lang={lang === 'en' ? 'id' : 'en'}
    >
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}
