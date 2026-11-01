import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Palette, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import {
  APPEARANCE_THEMES,
  APPEARANCE_UI,
  TEXT_SIZES,
  type AppearanceThemeId,
  type TextSizeId,
} from '../academyData';

function broadcastToAcademyFrames(theme: AppearanceThemeId, textSize: TextSizeId) {
  try {
    localStorage.setItem('dma-theme', theme);
    localStorage.setItem('dma-text-size', textSize);
  } catch {
    // ignore storage errors
  }
  document.querySelectorAll<HTMLIFrameElement>('iframe[data-academy-frame]').forEach((frame) => {
    try {
      frame.contentWindow?.postMessage({ type: 'marwan-appearance', theme, textSize }, '*');
    } catch {
      // ignore cross-frame issues
    }
  });
}

export default function AppearanceMenu() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<AppearanceThemeId>(() => {
    const saved = localStorage.getItem('marwan_appearance') || localStorage.getItem('dma-theme');
    return APPEARANCE_THEMES.some((t) => t.id === saved) ? (saved as AppearanceThemeId) : 'classic';
  });
  const [textSize, setTextSize] = useState<TextSizeId>(() => {
    const saved = localStorage.getItem('marwan_text_size') || localStorage.getItem('dma-text-size');
    return TEXT_SIZES.some((s) => s.id === saved) ? (saved as TextSizeId) : 'normal';
  });

  useEffect(() => {
    document.documentElement.dataset.appearance = theme;
    document.documentElement.dataset.textSize = textSize;
    localStorage.setItem('marwan_appearance', theme);
    localStorage.setItem('marwan_text_size', textSize);
    broadcastToAcademyFrames(theme, textSize);
  }, [theme, textSize]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={L(APPEARANCE_UI.buttonLabel)}
        title={L(APPEARANCE_UI.buttonLabel)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[0.72rem] font-semibold transition-colors cursor-pointer bg-[color-mix(in_srgb,var(--t-glass)_8%,transparent)] border border-[color-mix(in_srgb,var(--t-accent)_25%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_82%,transparent)] hover:border-cyan-400/60 hover:text-cyan-300"
      >
        <Palette className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden xl:inline">{L(APPEARANCE_UI.buttonLabel)}</span>
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setOpen(false);
                }}
                dir={isRtl ? 'rtl' : 'ltr'}
                role="dialog"
                aria-modal="true"
                aria-label={L(APPEARANCE_UI.title)}
                className="fixed inset-0 z-[1200] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md rounded-3xl bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-accent)_25%,transparent)] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-start">
                      <p className="teach-eyebrow">{L(APPEARANCE_UI.eyebrow)}</p>
                      <h2
                        className="text-xl font-black text-[var(--t-ink)] mt-0.5"
                        style={{ fontFamily: 'var(--teach-font-display)' }}
                      >
                        {L(APPEARANCE_UI.title)}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={L(APPEARANCE_UI.close)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[color-mix(in_srgb,var(--t-ink)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--t-ink)_15%,transparent)] text-[var(--t-ink)] cursor-pointer border-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)] text-start">
                    {L(APPEARANCE_UI.subtitle)}
                  </p>

                  {/* 8 Themes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {APPEARANCE_THEMES.map((item) => {
                      const active = item.id === theme;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTheme(item.id)}
                          aria-pressed={active}
                          className={`flex items-center justify-between gap-2.5 rounded-2xl p-3 text-start cursor-pointer transition-all border ${
                            active
                              ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)]'
                              : 'border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] bg-[color-mix(in_srgb,var(--t-glass)_3%,transparent)] hover:border-[var(--t-accent)]'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-7 h-7 rounded-full shrink-0 border border-black/15 flex items-center justify-center shadow-inner"
                              style={{ background: item.swatchBg }}
                              aria-hidden="true"
                            >
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ background: item.swatchAccent }}
                              />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-bold text-[var(--t-ink)] truncate">
                                {L(item.label)}
                              </span>
                              <span className="block text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)] truncate">
                                {L(item.note)}
                              </span>
                            </span>
                          </span>
                          {active && <Check className="w-4 h-4 shrink-0 text-[var(--t-accent)]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* 3 Text sizes */}
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold text-[var(--t-ink)] text-start">
                      {L(APPEARANCE_UI.textSizeLabel)}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {TEXT_SIZES.map((s) => {
                        const active = s.id === textSize;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setTextSize(s.id)}
                            aria-pressed={active}
                            className={`rounded-xl py-2.5 px-3 text-center cursor-pointer transition-all border ${
                              active
                                ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                                : 'border-[color-mix(in_srgb,var(--t-ink)_15%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                            }`}
                          >
                            <span className="block text-sm font-black" dir="ltr">{s.label}</span>
                            <span className="block text-[0.65rem] opacity-80">{L(s.desc)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
