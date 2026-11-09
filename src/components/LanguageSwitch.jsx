import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import { pathInLang } from '../siteMeta.js';
import './LanguageSwitch.css';

/**
 * EN/ID language pill. It is a real link to this page in the other language,
 * so a crawler can follow it, and a plain click switches without a reload.
 */
export default function LanguageSwitch() {
  const { lang, toggle, t } = useLanguage();
  const { pathname, search } = useLocation();
  const other = lang === 'en' ? 'id' : 'en';

  const onClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    toggle();
  };

  return (
    // The label is written in the language it switches to, so it carries that
    // language's tag for screen readers to pronounce it properly.
    <a
      href={pathInLang(pathname, other) + search}
      hrefLang={other}
      className="lang-switch"
      onClick={onClick}
      aria-label={t.a11y.switchLanguage}
      lang={other}
    >
      <span>{lang.toUpperCase()}</span>
    </a>
  );
}
