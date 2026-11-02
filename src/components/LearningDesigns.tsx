import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Layers, Smartphone, Monitor } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { DESIGNS, DESIGNS_HEADER } from '../teachingData';
import Reveal from './Reveal';

/**
 * Learning-Experience Designs — organized as a 4-project interactive case-study
 * switcher (FIKR Math Games, Quran Garden, Healthcare SCORM Induction, ID Compass)
 * with live step-by-step learner-journey screenshot walkthroughs.
 */
export default function LearningDesigns() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [activeIdx, setActiveIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const project = DESIGNS[activeIdx] ?? DESIGNS[0];
  const currentStep = project.steps[stepIdx] ?? project.steps[0];

  const selectProject = (idx: number) => {
    setActiveIdx(idx);
    setStepIdx(0);
  };

  const stepProject = (delta: number) => {
    const next = (activeIdx + delta + DESIGNS.length) % DESIGNS.length;
    selectProject(next);
  };

  return (
    <section id="designs" className="relative py-14 md:py-20 px-5 lg:px-8 overflow-hidden">
      <div className="absolute -bottom-24 start-1/3 w-[520px] h-[520px] rounded-full bg-indigo-500/[0.06] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative space-y-10">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(DESIGNS_HEADER.tag)}</p>
          <h2 className="teach-section-title">
            {L(DESIGNS_HEADER.titlePrefix)} <em>{L(DESIGNS_HEADER.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(DESIGNS_HEADER.desc)}</p>
        </Reveal>

        {/* 4-Project Selector Strip */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {DESIGNS.map((item, idx) => {
              const on = idx === activeIdx;
              const DevIcon = item.device === 'phone' ? Smartphone : Monitor;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectProject(idx)}
                  aria-pressed={on}
                  className={`teach-card !rounded-2xl p-4 text-start cursor-pointer transition-all bg-transparent ${
                    on
                      ? '!border-[var(--t-accent)] ring-2 ring-[var(--t-accent)]/25'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      dir="ltr"
                      className={`text-[0.68rem] font-mono font-black px-2.5 py-0.5 rounded-full ${
                        on
                          ? 'bg-[var(--t-accent)] text-[#fff]'
                          : 'bg-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] text-[var(--t-ink)]'
                      }`}
                    >
                      0{idx + 1} · {item.date}
                    </span>
                    <DevIcon className="w-3.5 h-3.5 text-[var(--t-accent)] shrink-0" />
                  </div>
                  <p
                    className="text-base font-black text-[var(--t-ink)] truncate"
                    style={{ fontFamily: 'var(--teach-font-display)' }}
                  >
                    {L(item.title)}
                  </p>
                  <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)] truncate mt-0.5">
                    {L(item.kind)}
                  </p>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Active Project Walkthrough Card */}
        <div
          key={project.id}
          className="teach-card !rounded-3xl p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
        >
          {/* Interactive Device Preview + Learner-Journey Step Pills */}
          <div className="lg:col-span-7 space-y-4">
            <div
              data-theme="dark"
              className="teach-card chalk !p-4 sm:!p-6 !rounded-3xl flex flex-col items-center justify-center min-h-[320px]"
            >
              {project.device === 'phone' ? (
                <div className="w-[230px] sm:w-[260px] rounded-[2rem] border-4 border-white/15 bg-[#080d1a] p-2 shadow-2xl">
                  <div className="w-16 h-1.5 rounded-full bg-white/15 mx-auto mb-2" />
                  <img
                    key={currentStep.image}
                    src={currentStep.image}
                    alt={`${L(project.title)} — ${L(currentStep.label)}`}
                    loading="lazy"
                    className="w-full rounded-[1.4rem] object-cover"
                  />
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-white/15 bg-[#080d1a] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-white/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400/75" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-300/75" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/75" />
                    </div>
                    <span className="text-[0.68rem] font-mono text-white/55 truncate">
                      {L(currentStep.label)}
                    </span>
                    <span className="text-[0.65rem] font-mono text-cyan-300/75" dir="ltr">
                      {stepIdx + 1}/{project.steps.length}
                    </span>
                  </div>
                  <img
                    key={currentStep.image}
                    src={currentStep.image}
                    alt={`${L(project.title)} — ${L(currentStep.label)}`}
                    loading="lazy"
                    className="w-full aspect-[16/10] object-cover object-top"
                  />
                </div>
              )}
            </div>

            {/* Step Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {project.steps.map((st, sIdx) => {
                const activeStep = sIdx === stepIdx;
                return (
                  <button
                    key={st.image}
                    type="button"
                    onClick={() => setStepIdx(sIdx)}
                    aria-pressed={activeStep}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                      activeStep
                        ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                        : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                    }`}
                  >
                    <span dir="ltr" className="font-mono opacity-75 me-1.5">
                      {sIdx + 1}.
                    </span>
                    {L(st.label)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case-Study Narrative */}
          <div className="lg:col-span-5 space-y-5 text-start">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--t-accent)]">
                <Layers className="w-3.5 h-3.5" />
                {L(project.kind)}
              </span>

              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => stepProject(-1)}
                  aria-label={isRtl ? 'المشروع السابق' : 'Previous project'}
                  className="w-8 h-8 rounded-full border border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)] flex items-center justify-center cursor-pointer"
                >
                  {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => stepProject(1)}
                  aria-label={isRtl ? 'المشروع التالي' : 'Next project'}
                  className="w-8 h-8 rounded-full border border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)] flex items-center justify-center cursor-pointer"
                >
                  {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h3
                className="text-3xl sm:text-4xl font-black text-[var(--t-ink)] leading-tight"
                style={{ fontFamily: 'var(--teach-font-display)' }}
              >
                {L(project.title)}
              </h3>
              <p className="text-xs font-mono text-[color-mix(in_srgb,var(--t-ink)_52%,transparent)]" dir="ltr">
                {project.date} · {project.stack}
              </p>
            </div>

            <p className="text-[0.95rem] leading-[1.85] text-[color-mix(in_srgb,var(--t-ink)_78%,transparent)] font-light">
              {L(project.what)}
            </p>

            <div className="rounded-2xl p-4 bg-[color-mix(in_srgb,var(--t-accent)_8%,transparent)] border border-[color-mix(in_srgb,var(--t-accent)_22%,transparent)] space-y-1">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-wider text-[var(--t-accent)]">
                {isRtl ? 'لمن صُمّم وما الأثر؟' : 'Learner Impact'}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_82%,transparent)]">
                {L(project.forWho)}
              </p>
            </div>

            {project.link && (
              <div className="pt-1">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="teach-btn teach-btn-primary"
                >
                  {isRtl ? 'جرّب المنصة مباشرة' : 'Open Live Platform'}
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
