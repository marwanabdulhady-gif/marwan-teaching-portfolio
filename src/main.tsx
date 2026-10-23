import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from './LocaleContext';
import TeachingApp from './TeachingApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <TeachingApp />
    </LocaleProvider>
  </StrictMode>,
);
