import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LanguageProvider, useLanguage } from './LanguageContext.jsx';
import { LANG_PREFIX } from './siteMeta.js';

// Under /id every route and link is written as if at the root and the router
// adds the prefix. It restarts when the language changes, since a router's
// basename is fixed for as long as it runs.
function LanguageRouter({ children }) {
  const { lang } = useLanguage();
  return <BrowserRouter key={lang} basename={LANG_PREFIX[lang] || undefined}>{children}</BrowserRouter>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <LanguageRouter>
        <App />
      </LanguageRouter>
    </LanguageProvider>
  </React.StrictMode>
);
