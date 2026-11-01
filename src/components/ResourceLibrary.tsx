import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Play,
  RotateCcw,
  Sparkles,
  Store,
  X,
  Youtube,
} from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { LINKS, RESOURCES, VIDEOS } from '../teachingData';
import {
  ACADEMY_LESSONS,
  ACADEMY_WORKSPACE_UI,
  GUIDED_SAMPLER_ITEMS,
  GUIDED_SAMPLER_UI,
} from '../academyData';
import Reveal from './Reveal';

function VideoCard({ id, title, topic }: { id: string; title: string; topic: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="teach-card overflow-hidden">
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 cursor-pointer"
            aria-label={title}
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-[var(--t-accent)] text-[#fff] flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 ms-1" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="p-4 text-start space-y-1">
        <p className="teach-eyebrow">{topic}</p>
        <p className="font-bold text-[0.95rem] text-[var(--t-ink)] leading-snug">{title}</p>
      </figcaption>
    </figure>
  );
}

/**
 * Native React Guided Self-Check + Worked-Steps + Mastery Rating sampler.
 * Demonstrates the exact pedagogy inside all 23 interactive lessons directly on the page.
 */
function GuidedLessonSampler({ onOpenLesson }: { onOpenLesson: (url: string, title: string) => void }) {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [sampleIdx, setSampleIdx] = useState(0);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [explainForced, setExplainForced] = useState(false);
  const [mastery, setMastery] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('marwan:sampler:mastery') || '{}');
    } catch {
      return {};
    }
  });

  const item = GUIDED_SAMPLER_ITEMS[sampleIdx];
  const isCorrect = checked && selected === item.correctIndex;

  const selectTab = (idx: number) => {
    setSampleIdx(idx);
    setStepsOpen(false);
    setSelected(null);
    setChecked(false);
    setHintOpen(false);
    setExplainForced(false);
  };

  const resetQuestion = () => {
    setSelected(null);
    setChecked(false);
    setExplainForced(false);
  };

  const toggleMastery = (level: string) => {
    const next = { ...mastery };
    if (next[item.id] === level) delete next[item.id];
    else next[item.id] = level;
    setMastery(next);
    try {
      localStorage.setItem('marwan:sampler:mastery', JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <Reveal>
      <div className="teach-card p-6 sm:p-8 space-y-6 text-start">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="teach-eyebrow">{L(GUIDED_SAMPLER_UI.eyebrow)}</p>
            <h3
              className="text-2xl sm:text-3xl font-black text-[var(--t-ink)] leading-tight"
              style={{ fontFamily: 'var(--teach-font-display)' }}
            >
              {L(GUIDED_SAMPLER_UI.title)}
            </h3>
            <p className="text-sm text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)] max-w-2xl leading-relaxed">
              {L(GUIDED_SAMPLER_UI.desc)}
            </p>
          </div>

          {/* Strand switcher pills */}
          <div className="flex flex-wrap gap-2">
            {GUIDED_SAMPLER_ITEMS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectTab(idx)}
                aria-pressed={idx === sampleIdx}
                className={`px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                  idx === sampleIdx
                    ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                    : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                }`}
              >
                <span className="font-mono me-1.5">{s.lessonCode}</span>
                {L(s.strand)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Worked Example ("Show all worked steps") */}
          <div className="lg:col-span-5 rounded-2xl p-5 bg-[color-mix(in_srgb,var(--t-ink)_4%,transparent)] border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-[var(--t-accent-deep)]">
                {L(GUIDED_SAMPLER_UI.workedBadge)} · {item.lessonCode}
              </span>
            </div>
            <p className="text-base font-bold text-[var(--t-ink)]">{L(item.workedTitle)}</p>
            <div
              dir="ltr"
              className="rounded-xl px-4 py-3 bg-[var(--t-bg)] border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] font-mono text-xs sm:text-sm font-semibold text-[var(--t-ink)]"
            >
              {item.workedProblem}
            </div>

            {!stepsOpen ? (
              <button
                type="button"
                onClick={() => setStepsOpen(true)}
                className="teach-btn teach-btn-secondary !py-2.5 !px-4 !text-xs w-full justify-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--t-accent)]" />
                {L(GUIDED_SAMPLER_UI.showAllSteps)}
              </button>
            ) : (
              <div className="space-y-3">
                {item.workedSteps.map((st, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-3.5 bg-[var(--t-bg)] border border-[color-mix(in_srgb,var(--t-accent)_22%,transparent)] space-y-1"
                  >
                    <p className="text-xs font-bold text-[var(--t-accent-deep)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {L(st.label)}
                    </p>
                    <p dir="ltr" className="font-mono text-xs font-semibold text-[var(--t-ink)]">
                      {st.math}
                    </p>
                    <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)]">
                      {L(st.note)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {L(GUIDED_SAMPLER_UI.allStepsShown)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStepsOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--t-ink)] hover:text-[var(--t-accent)] cursor-pointer bg-transparent border-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {L(GUIDED_SAMPLER_UI.resetSteps)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Confidence Self-Check + Mastery Self-Rating */}
          <div className="lg:col-span-7 rounded-2xl p-5 sm:p-6 bg-[var(--t-bg)] border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-widest text-[var(--t-accent-deep)]">
                <HelpCircle className="w-3.5 h-3.5" />
                {L(GUIDED_SAMPLER_UI.selfCheckBadge)}
              </span>
              <button
                type="button"
                onClick={() => onOpenLesson(item.lessonHref, L(item.lessonTitle))}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--t-accent-deep)] hover:underline cursor-pointer bg-transparent border-0"
              >
                {L(GUIDED_SAMPLER_UI.openFullLesson)}
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <p className="text-sm sm:text-base font-bold text-[var(--t-ink)] leading-relaxed">
              {L(item.question)}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" dir="ltr">
              {item.options.map((opt, idx) => {
                const active = selected === idx;
                const rightAfterCheck = checked && idx === item.correctIndex;
                const wrongAfterCheck = checked && active && idx !== item.correctIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={checked}
                    onClick={() => setSelected(idx)}
                    className={`p-3.5 rounded-xl text-start font-mono text-xs sm:text-sm font-semibold transition-all border ${
                      checked ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      rightAfterCheck
                        ? 'border-emerald-600 bg-emerald-500/10 text-[var(--t-ink)]'
                        : wrongAfterCheck
                          ? 'border-amber-600 bg-amber-500/10 text-[var(--t-ink)]'
                          : active
                            ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] text-[var(--t-ink)]'
                            : 'border-[color-mix(in_srgb,var(--t-ink)_15%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {!checked && (
                <button
                  type="button"
                  disabled={selected === null}
                  onClick={() => setChecked(true)}
                  className="teach-btn teach-btn-primary !py-2 !px-4 !text-xs border-0 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {L(GUIDED_SAMPLER_UI.checkAnswer)}
                </button>
              )}
              <button
                type="button"
                onClick={() => setHintOpen((v) => !v)}
                aria-expanded={hintOpen}
                className="teach-btn teach-btn-secondary !py-2 !px-3.5 !text-xs"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[var(--t-sun)]" />
                {hintOpen ? L(GUIDED_SAMPLER_UI.hideHint) : L(GUIDED_SAMPLER_UI.showHint)}
              </button>
              {checked && (
                <button
                  type="button"
                  onClick={resetQuestion}
                  className="teach-btn teach-btn-secondary !py-2 !px-3.5 !text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {L(GUIDED_SAMPLER_UI.tryAgain)}
                </button>
              )}
              {checked && !isCorrect && !explainForced && (
                <button
                  type="button"
                  onClick={() => setExplainForced(true)}
                  className="teach-btn teach-btn-secondary !py-2 !px-3.5 !text-xs"
                >
                  {L(GUIDED_SAMPLER_UI.showExplanation)}
                </button>
              )}
            </div>

            {hintOpen && (
              <div className="rounded-xl p-3.5 bg-[color-mix(in_srgb,var(--t-sun)_16%,transparent)] border border-[color-mix(in_srgb,var(--t-sun)_45%,transparent)] text-xs leading-relaxed text-[var(--t-ink)]">
                <strong className="me-1">{L(GUIDED_SAMPLER_UI.showHint)}:</strong>
                {L(item.hint)}
              </div>
            )}

            {checked && selected !== null && (
              <div
                role="status"
                className={`rounded-xl p-4 text-xs sm:text-sm leading-relaxed border ${
                  isCorrect || explainForced
                    ? 'border-emerald-600/40 bg-emerald-500/10 text-[var(--t-ink)]'
                    : 'border-amber-600/40 bg-amber-500/10 text-[var(--t-ink)]'
                }`}
              >
                <p className="font-bold">
                  {isCorrect || explainForced
                    ? L(GUIDED_SAMPLER_UI.correctTitle)
                    : L(GUIDED_SAMPLER_UI.wrongTitle)}
                </p>
                <p className="mt-1">
                  {isCorrect || explainForced
                    ? L(item.explanation)
                    : item.optionFeedback[selected]
                      ? L(item.optionFeedback[selected]!)
                      : L(item.explanation)}
                </p>
              </div>
            )}

            {/* Mastery Self-Rating */}
            <div className="pt-3 border-t border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)]">
                {L(GUIDED_SAMPLER_UI.masteryTitle)}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {GUIDED_SAMPLER_UI.masteryLevels.map((lv) => {
                  const on = mastery[item.id] === lv.id;
                  return (
                    <button
                      key={lv.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleMastery(lv.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${
                        on
                          ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                          : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                      }`}
                    >
                      {L(lv.label)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function ResourceLibrary() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [courseTab, setCourseTab] = useState<'grade-12-calculus' | 'grade-11-precalculus'>('grade-12-calculus');
  const workspaceRef = useRef<HTMLDivElement>(null);

  const launchWorkspace = (url: string, title: string) => {
    setActiveUrl(url);
    setActiveTitle(title);
    requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  // Listen to global search palette & visual math card triggers
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ url: string; title: string }>).detail;
      if (detail?.url) {
        launchWorkspace(detail.url, detail.title || L(ACADEMY_WORKSPACE_UI.eyebrow));
      }
    };
    window.addEventListener('marwan:open-academy', onOpen);
    return () => window.removeEventListener('marwan:open-academy', onOpen);
  }, [isRtl]);

  const filteredLessons = ACADEMY_LESSONS.filter((l) => l.courseSlug === courseTab);

  const extras = [
    { key: 'worksheets', icon: FileText, data: RESOURCES.worksheets, href: LINKS.worksheets },
    { key: 'tpt', icon: Store, data: RESOURCES.tpt, href: LINKS.tpt },
  ];

  return (
    <section id="resources" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative space-y-14">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(ACADEMY_WORKSPACE_UI.eyebrow)}</p>
          <h2 className="teach-section-title">
            {L(ACADEMY_WORKSPACE_UI.titlePrefix)} <em>{L(ACADEMY_WORKSPACE_UI.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(ACADEMY_WORKSPACE_UI.desc)}</p>
        </Reveal>

        {/* Launch Chalkboard Banner (Academy + Desmos + Socratic AI Tutor) */}
        <Reveal>
          <div
            data-theme="dark"
            className="teach-card chalk !rounded-3xl p-6 sm:p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 teach-grid-bg opacity-45" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-start">
              <div className="space-y-2 max-w-2xl">
                <p className="teach-eyebrow">
                  {isRtl ? '٢٣ درساً · ١٦٢ سؤال تحقق · Desmos · GMAT' : '23 Lessons · 162 Self-Checks · Desmos · GMAT'}
                </p>
                <h3
                  className="text-2xl sm:text-3xl font-black text-white"
                  style={{ fontFamily: 'var(--teach-font-display)' }}
                >
                  {isRtl
                    ? 'تعلّم بالتفاعل: ما قبل التفاضل، التفاضل، وGMAT'
                    : 'Learn Interactively: Precalculus, Calculus & GMAT'}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isRtl
                    ? 'افتح أي درس كامل بصيغة عرض السبورة، أو ارسم الدوال في حاسبة Desmos المدمجة، أو اسأل المعلم الذكي خطوة بخطوة.'
                    : 'Open any full lesson in classroom presentation mode, plot functions in the embedded Desmos lab, or ask the step-by-step Math AI Tutor.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => launchWorkspace('/academy/index.html', L(ACADEMY_WORKSPACE_UI.openHub))}
                  className="teach-btn teach-btn-primary border-0"
                >
                  <BookOpen className="w-4 h-4" />
                  {L(ACADEMY_WORKSPACE_UI.openHub)}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    launchWorkspace(
                      '/academy/courses/grade-12-calculus/desmos/index.html',
                      L(ACADEMY_WORKSPACE_UI.openDesmos),
                    )
                  }
                  className="teach-btn teach-btn-secondary"
                >
                  <Calculator className="w-4 h-4" />
                  {L(ACADEMY_WORKSPACE_UI.openDesmos)}
                </button>
                <button
                  type="button"
                  onClick={() => launchWorkspace('/academy/tutor/index.html', L(ACADEMY_WORKSPACE_UI.openTutor))}
                  className="teach-btn teach-btn-secondary"
                >
                  <Sparkles className="w-4 h-4" />
                  {L(ACADEMY_WORKSPACE_UI.openTutor)}
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Expandable Lazy-Loaded Academy Workspace Iframe */}
        <AnimatePresence initial={false}>
          {activeUrl && (
            <motion.div
              ref={workspaceRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="teach-card !rounded-2xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)] border-b border-[color-mix(in_srgb,var(--t-accent)_20%,transparent)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-4 h-4 shrink-0 text-[var(--t-accent)]" />
                    <span className="text-xs sm:text-sm font-bold text-[var(--t-ink)] truncate">
                      {activeTitle}
                    </span>
                  </div>

                  {/* Quick jump bar inside workspace */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ACADEMY_WORKSPACE_UI.quickNav.map((nav) => (
                      <button
                        key={nav.href}
                        type="button"
                        onClick={() => launchWorkspace(nav.href, L(nav.label))}
                        className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold cursor-pointer border-0 transition-colors ${
                          activeUrl === nav.href
                            ? 'bg-[var(--t-accent)] text-[#fff]'
                            : 'bg-[color-mix(in_srgb,var(--t-ink)_8%,transparent)] text-[var(--t-ink)] hover:bg-[color-mix(in_srgb,var(--t-ink)_14%,transparent)]'
                        }`}
                      >
                        {L(nav.label)}
                      </button>
                    ))}
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.72rem] font-semibold text-[var(--t-ink)] hover:text-[var(--t-accent)]"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      {L(ACADEMY_WORKSPACE_UI.openNewTab)}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveUrl(null);
                        setActiveTitle('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] text-[var(--t-ink)] hover:bg-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] text-[0.72rem] font-bold cursor-pointer border-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      {L(ACADEMY_WORKSPACE_UI.close)}
                    </button>
                  </div>
                </div>

                <iframe
                  key={activeUrl}
                  data-academy-frame="1"
                  src={activeUrl}
                  title={activeTitle}
                  onLoad={(e) => {
                    try {
                      const theme = localStorage.getItem('marwan_appearance') || 'classic';
                      const textSize = localStorage.getItem('marwan_text_size') || 'normal';
                      e.currentTarget.contentWindow?.postMessage(
                        { type: 'marwan-appearance', theme, textSize },
                        '*',
                      );
                    } catch {
                      // ignore
                    }
                  }}
                  className="block w-full h-[clamp(540px,80vh,860px)] bg-[var(--t-bg)] border-0"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Native React Guided Lesson Sampler */}
        <GuidedLessonSampler onOpenLesson={launchWorkspace} />

        {/* Interactive 23-Lesson Directory + GMAT Quick Strip */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCourseTab('grade-12-calculus')}
                aria-pressed={courseTab === 'grade-12-calculus'}
                className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                  courseTab === 'grade-12-calculus'
                    ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                    : 'border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                }`}
              >
                {isRtl ? 'تفاضل الصف ١٢ (١٤ درساً)' : 'Grade 12 Calculus (14 lessons)'}
              </button>
              <button
                type="button"
                onClick={() => setCourseTab('grade-11-precalculus')}
                aria-pressed={courseTab === 'grade-11-precalculus'}
                className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                  courseTab === 'grade-11-precalculus'
                    ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                    : 'border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                }`}
              >
                {isRtl ? 'ما قبل التفاضل · الصف ١١ (٩ دروس)' : 'Grade 11 Precalculus (9 lessons)'}
              </button>
              <button
                type="button"
                onClick={() =>
                  launchWorkspace(
                    '/academy/courses/gmat-preparation/index.html',
                    isRtl ? 'مركز تحضير GMAT (٣٨ موضوعاً)' : 'GMAT Quant & Data Insights (38 topics)',
                  )
                }
                className="px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all border border-[color-mix(in_srgb,var(--t-sky)_40%,transparent)] bg-[color-mix(in_srgb,var(--t-sky)_10%,transparent)] text-[var(--t-ink)] hover:border-[var(--t-sky)]"
              >
                {isRtl ? 'تحضير GMAT الكمي والبيانات (٣٨ موضوعاً) →' : 'GMAT Quant & Data Insights (38 topics) →'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredLessons.map((lesson, i) => (
              <Reveal key={lesson.id} delay={0.025 * i}>
                <button
                  type="button"
                  onClick={() => launchWorkspace(lesson.href, L(lesson.title))}
                  className="teach-card w-full h-full p-4 flex items-center justify-between gap-3 text-start cursor-pointer bg-transparent"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      dir="ltr"
                      className="px-2.5 py-1.5 rounded-xl bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] text-[var(--t-accent-deep)] font-mono text-xs font-black shrink-0"
                    >
                      {lesson.code}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[var(--t-ink)] leading-snug truncate">
                        {L(lesson.title)}
                      </span>
                      {lesson.hasLab && (
                        <span className="inline-block mt-1 text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--t-sun)_28%,transparent)] text-[var(--t-ink)]">
                          {isRtl ? '+ مختبر تفاعلي' : '+ Interactive Lab'}
                        </span>
                      )}
                    </span>
                  </span>
                  <ArrowRight className={`w-4 h-4 shrink-0 text-[var(--t-accent)] ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </Reveal>
            ))}
          </div>
        </div>

        {/* YouTube channel */}
        <Reveal>
          <a
            href={LINKS.youtube}
            target="_blank"
            rel="noreferrer"
            data-theme="dark"
            className="teach-card chalk group flex flex-col sm:flex-row items-start sm:items-center gap-5 p-7 sm:p-9 !rounded-3xl text-start"
          >
            <span className="w-16 h-16 rounded-2xl bg-[#ff0033] text-[#fff] flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
              <Youtube className="w-8 h-8" />
            </span>
            <span className="flex-1 space-y-1.5">
              <span
                className="block text-2xl sm:text-3xl font-black"
                style={{ fontFamily: 'var(--teach-font-display)' }}
              >
                {L(RESOURCES.youtube.title)}
              </span>
              <span className="block text-[0.92rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
                {L(RESOURCES.youtube.desc)}
              </span>
            </span>
            <span className="teach-btn teach-btn-primary shrink-0">
              {L(RESOURCES.youtube.cta)} <ArrowUpRight className="w-4 h-4" />
            </span>
          </a>
        </Reveal>

        {/* Featured YouTube lessons (shown once video ids are listed) */}
        {VIDEOS.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VIDEOS.map((v, i) => (
              <Reveal key={v.id} delay={0.05 * i}>
                <VideoCard id={v.id} title={L(v.title)} topic={L(v.topic)} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Worksheets + TPT store */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {extras.map(({ key, icon: Icon, data, href }, i) => {
            const body = (
              <>
                <span className="teach-icon-chip !w-12 !h-12 shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 space-y-1.5 text-start">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-xl font-black text-[var(--t-ink)]"
                      style={{ fontFamily: 'var(--teach-font-display)' }}
                    >
                      {L(data.title)}
                    </span>
                    {!href && (
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[color-mix(in_srgb,var(--t-sun)_25%,transparent)] text-[var(--t-ink)]">
                        {L(RESOURCES.soon)}
                      </span>
                    )}
                  </span>
                  <span className="block text-[0.88rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)]">
                    {L(data.desc)}
                  </span>
                  {href && (
                    <span className="inline-flex items-center gap-1 pt-1 text-sm font-bold text-[var(--t-accent-deep)]">
                      {L(data.cta)} <ArrowUpRight className="w-4 h-4" />
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <Reveal key={key} delay={0.08 * i}>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="teach-card h-full flex items-start gap-4 p-6 sm:p-7">
                    {body}
                  </a>
                ) : (
                  <div className="teach-card h-full flex items-start gap-4 p-6 sm:p-7">{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
