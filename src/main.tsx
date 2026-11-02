import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TeachingApp from './TeachingApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TeachingApp />
  </StrictMode>,
);
