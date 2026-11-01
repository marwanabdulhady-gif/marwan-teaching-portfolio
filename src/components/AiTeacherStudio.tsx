import { useMemo, useState } from 'react';
import { Check, Copy, Download, Sparkles } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import {
  AI_STUDIO_UI,
  STUDIO_PRESETS,
  STUDIO_TOOLS,
  type StudioTool,
} from '../academyData';
import Reveal from './Reveal';

function buildStructuredPrompt(params: {
  tool: StudioTool;
  subject: string;
  grade: string;
  lesson: string;
  outputLang: 'en' | 'ar';
  curriculum: string;
  focus: string;
  notes: string;
}) {
  const { tool, subject, grade, lesson, outputLang, curriculum, focus, notes } = params;

  if (outputLang === 'ar') {
    const modeHeader: Record<StudioTool['id'], string> = {
      lab: 'أنت مصمم تعليمي ومطور محاكاة رياضية وعلمية تفاعلية. صمّم مختبراً تفاعلياً ذاتي الاحتواء يعمل في المتصفح (ملف HTML واحد بدون مكتبات خارجية تتطلب خادماً).',
      lesson: 'أنت مصمم تعليمي خبير في تدريس الرياضيات والعلوم. صمّم خطة درس متكاملة وفق نموذج 5E قابلة للتطبيق المباشر داخل الفصل.',
      presentation: 'أنت مصمم عروض تعليمية بصرية. أنشئ مخطط عرض تقديمي شريحة بشريحة مع الرسوم التوضيحية وأسئلة النقاش وملاحظات المعلم.',
      game: 'أنت مصمم ألعاب تعليمية تضع الفهم العميق قبل السرعة. ابنِ لعبة تعليمية تفاعلية تعمل في المتصفح (HTML5) مع مستويات متدرجة وتغذية راجعة فورية.',
      whiteboard: 'أنت مصمم شروحات سبورة تفاعلية. صمّم شرحاً بصرياً متدرج الرسم (SVG/Canvas) مع وقفات توقّع لإشراك الطلاب.',
      video: 'أنت مخرج محتوى تعليمي علمي. أنشئ حزمة إنتاج فيديو تعليمي (لوحة قصصية لقطة بلقطة مع التوقيت والنص الصوتي والتسميات التوضيحية).',
    };

    return [
      `# استوديو المعلم بالذكاء الاصطناعي — ${tool.title.ar}`,
      modeHeader[tool.id],
      '',
      '## ١) بطاقة توصيف الدرس',
      `- المادة: ${subject || 'الرياضيات'}`,
      `- الصف / المستوى: ${grade || 'المرحلة الثانوية'}`,
      `- عنوان الدرس: ${lesson || 'تطبيقات القيم القصوى'}`,
      curriculum ? `- المنهج المرجعي: ${curriculum}` : null,
      `- لغة المخرجات المطلوبة: العربية الواضحة السليمة علمياً (مع الحفاظ على الرموز الرياضية القياسية).`,
      '',
      '## ٢) محور الفهم والتفاعل المطلوب',
      focus || 'ربط التمثيل الجبري بالتمثيل البياني والجدولي مع خطوات تحقق واضحة.',
      '',
      notes ? `## ٣) المفاهيم الخاطئة وملاحظات الصف\n${notes}\n` : null,
      '## ٤) معايير الجودة التربوية والتقنية الإلزامية',
      '- ابدأ بسؤال تشخيصي قصير يكشف المعرفة القبلية قبل عرض القاعدة.',
      '- عالج الأخطاء الشائعة بتغذية راجعة تفسيرية تشرح (لماذا) وليس فقط (صح/خطأ).',
      '- التزم بالدقة الرياضية التامة في المجال والوحدات والحالات الحدية.',
      '- اجعل جميع عناصر التحكم واضحة وتعمل بلوحة المفاتيح واللمس وشاشة العرض الصفية.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  const modeRole: Record<StudioTool['id'], string> = {
    lab: 'Act as a senior mathematics & STEM instructional designer and front-end simulation engineer. Build a self-contained, single-file interactive HTML lab with live mathematical state, visual graphs, prediction checkpoints, and keyboard-accessible controls.',
    lesson: 'Act as an expert instructional designer. Author a classroom-ready 5E lesson plan (Engage, Explore, Explain, Elaborate, Evaluate) with diagnostic warm-ups, misconception coaching, paired tasks, and an exit ticket.',
    presentation: 'Act as a visual curriculum designer. Create a slide-by-slide teaching deck specification with board diagrams, worked examples, pacing cues, and Socratic speaker notes.',
    game: 'Act as an educational game designer. Build a playable, self-contained HTML5 classroom game where mechanics directly embody the mathematical structure, with progressive tiers, hints, and explanatory feedback.',
    whiteboard: 'Act as a visual math explainer. Create an interactive progressive-reveal SVG whiteboard storyboard with timed steps and student prediction pauses.',
    video: 'Act as a scientific & mathematical video producer. Write a shot-by-shot storyboard and narration script with exact timing, visual actions, captions, and explicit model limitations.',
  };

  return [
    `# AI Teacher Studio — ${tool.title.en} Brief`,
    modeRole[tool.id],
    '',
    '## 1. Teaching Context',
    `- Subject: ${subject || 'Mathematics'}`,
    `- Grade / Level: ${grade || 'Grade 12'}`,
    `- Lesson Topic: ${lesson || 'Optimization'}`,
    curriculum ? `- Curriculum Alignment: ${curriculum}` : null,
    `- Output Language: English`,
    `- Target Deliverable: ${tool.deliverables.en}`,
    '',
    '## 2. Core Conceptual & Interactive Focus',
    focus || 'Connect symbolic equations, numerical tables, and dynamic graphs so learners test predictions before seeing formal proofs.',
    '',
    notes ? `## 3. Classroom Constraints & Misconceptions to Address\n${notes}\n` : null,
    '## 4. Non-Negotiable Pedagogical & Quality Guardrails',
    '1. Include a 2-minute diagnostic prediction or warm-up before introducing formal notation.',
    '2. Provide specific distractor/misconception coaching explaining *why* an approach fails and what to try next.',
    '3. Verify all mathematical domains, units, boundary/degenerate cases, and labels rigorously.',
    '4. Ensure clean typography, high contrast, projector readability, and full keyboard + touch accessibility.',
    '5. Never request or store any student personal data.',
  ]
    .filter(Boolean)
    .join('\n');
}

export default function AiTeacherStudio() {
  const { locale, isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [selectedToolId, setSelectedToolId] = useState<StudioTool['id']>('lab');
  const [presetId, setPresetId] = useState<string>('optimization');
  const [subject, setSubject] = useState(STUDIO_PRESETS[0].subject);
  const [grade, setGrade] = useState(STUDIO_PRESETS[0].grade);
  const [lesson, setLesson] = useState(STUDIO_PRESETS[0].lesson);
  const [outputLang, setOutputLang] = useState<'en' | 'ar'>(locale);
  const [curriculum, setCurriculum] = useState(STUDIO_PRESETS[0].curriculum);
  const [focus, setFocus] = useState(STUDIO_PRESETS[0].focus);
  const [notes, setNotes] = useState(STUDIO_PRESETS[0].notes);
  const [copied, setCopied] = useState(false);

  const selectedTool = useMemo(
    () => STUDIO_TOOLS.find((t) => t.id === selectedToolId) || STUDIO_TOOLS[0],
    [selectedToolId],
  );

  const generatedPrompt = useMemo(
    () =>
      buildStructuredPrompt({
        tool: selectedTool,
        subject,
        grade,
        lesson,
        outputLang,
        curriculum,
        focus,
        notes,
      }),
    [selectedTool, subject, grade, lesson, outputLang, curriculum, focus, notes],
  );

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = STUDIO_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setSelectedToolId(p.toolId);
    setSubject(p.subject);
    setGrade(p.grade);
    setLesson(p.lesson);
    setCurriculum(p.curriculum);
    setFocus(p.focus);
    setNotes(p.notes);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback copy
      const ta = document.createElement('textarea');
      ta.value = generatedPrompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (lesson || 'teaching-prompt').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    a.href = url;
    a.download = `ai-teacher-studio-${selectedTool.id}-${slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="studio" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden bg-[color-mix(in_srgb,var(--t-bg-2)_28%,transparent)]">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Section Header */}
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(AI_STUDIO_UI.tag)}</p>
          <h2 className="teach-section-title">
            {L(AI_STUDIO_UI.titlePrefix)} <em>{L(AI_STUDIO_UI.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(AI_STUDIO_UI.desc)}</p>
        </Reveal>

        {/* Step 1: 6 Educator Creation Workflows */}
        <div className="space-y-4">
          <p className="teach-eyebrow text-start">{L(AI_STUDIO_UI.step1)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STUDIO_TOOLS.map((tool, idx) => {
              const active = tool.id === selectedToolId;
              return (
                <Reveal key={tool.id} delay={0.04 * idx}>
                  <button
                    type="button"
                    onClick={() => setSelectedToolId(tool.id)}
                    aria-pressed={active}
                    className={`teach-card w-full h-full p-5 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                      active
                        ? '!border-[var(--t-accent)] ring-2 ring-[color-mix(in_srgb,var(--t-accent)_35%,transparent)]'
                        : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] text-[var(--t-accent-deep)]">
                          {L(tool.badge)}
                        </span>
                        {active && <Sparkles className="w-4 h-4 text-[var(--t-accent)] shrink-0" />}
                      </div>
                      <h3
                        className="text-lg font-black text-[var(--t-ink)] leading-snug"
                        style={{ fontFamily: 'var(--teach-font-display)' }}
                      >
                        {L(tool.title)}
                      </h3>
                      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)]">
                        {L(tool.desc)}
                      </p>
                    </div>
                    <p className="text-[0.68rem] font-mono text-[color-mix(in_srgb,var(--t-ink)_52%,transparent)] pt-2 border-t border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)]">
                      {L(tool.deliverables)}
                    </p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Step 2 & 3: Workbench (Brief Form + Sample Visual Preview + Live Prompt) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Teaching Brief Form */}
          <Reveal className="lg:col-span-6">
            <div className="teach-card p-6 sm:p-8 space-y-5 text-start">
              <div className="space-y-1">
                <p className="teach-eyebrow">{L(AI_STUDIO_UI.step2)}</p>
                <h3
                  className="text-2xl font-black text-[var(--t-ink)]"
                  style={{ fontFamily: 'var(--teach-font-display)' }}
                >
                  {L(selectedTool.title)}
                </h3>
              </div>

              {/* Preset selector */}
              <div className="space-y-1.5">
                <label htmlFor="studio-preset-select" className="block text-xs font-bold text-[var(--t-ink)]">
                  {L(AI_STUDIO_UI.presetLabel)}
                </label>
                <select
                  id="studio-preset-select"
                  value={presetId}
                  onChange={(e) => applyPreset(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none"
                >
                  <option value="">{L(AI_STUDIO_UI.customPreset)}</option>
                  {STUDIO_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {L(p.label)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="studio-subject-in" className="block text-xs font-bold text-[var(--t-ink)]">
                    {L(AI_STUDIO_UI.fields.subject)}
                  </label>
                  <input
                    id="studio-subject-in"
                    type="text"
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setPresetId(''); }}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="studio-grade-in" className="block text-xs font-bold text-[var(--t-ink)]">
                    {L(AI_STUDIO_UI.fields.grade)}
                  </label>
                  <input
                    id="studio-grade-in"
                    type="text"
                    value={grade}
                    onChange={(e) => { setGrade(e.target.value); setPresetId(''); }}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="studio-lesson-in" className="block text-xs font-bold text-[var(--t-ink)]">
                    {L(AI_STUDIO_UI.fields.lesson)}
                  </label>
                  <input
                    id="studio-lesson-in"
                    type="text"
                    value={lesson}
                    onChange={(e) => { setLesson(e.target.value); setPresetId(''); }}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="studio-lang-in" className="block text-xs font-bold text-[var(--t-ink)]">
                    {L(AI_STUDIO_UI.fields.language)}
                  </label>
                  <select
                    id="studio-lang-in"
                    value={outputLang}
                    onChange={(e) => setOutputLang(e.target.value as 'en' | 'ar')}
                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="studio-curr-in" className="block text-xs font-bold text-[var(--t-ink)]">
                  {L(AI_STUDIO_UI.fields.curriculum)}
                </label>
                <input
                  id="studio-curr-in"
                  type="text"
                  value={curriculum}
                  onChange={(e) => { setCurriculum(e.target.value); setPresetId(''); }}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="studio-focus-in" className="block text-xs font-bold text-[var(--t-ink)]">
                  {L(AI_STUDIO_UI.fields.focus)}
                </label>
                <textarea
                  id="studio-focus-in"
                  rows={3}
                  value={focus}
                  onChange={(e) => { setFocus(e.target.value); setPresetId(''); }}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none resize-y"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="studio-notes-in" className="block text-xs font-bold text-[var(--t-ink)]">
                  {L(AI_STUDIO_UI.fields.notes)}
                </label>
                <textarea
                  id="studio-notes-in"
                  rows={2}
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setPresetId(''); }}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] focus:border-[var(--t-accent)] outline-none resize-y"
                />
              </div>

              <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
                {L(AI_STUDIO_UI.privacyNote)}
              </p>
            </div>
          </Reveal>

          {/* Right: Sample Output Preview + Generated Prompt */}
          <Reveal delay={0.1} className="lg:col-span-6 space-y-6">
            {/* Sample output visual card */}
            <div data-theme="dark" className="teach-card chalk p-5 sm:p-6 space-y-3 text-start">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="teach-eyebrow">{L(AI_STUDIO_UI.previewLabel)}</span>
                <span className="text-[0.68rem] font-mono text-cyan-300" dir="ltr">
                  {selectedTool.recommendedTool}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0b1426]">
                <img
                  src={selectedTool.previewImage}
                  alt={L(selectedTool.previewCaption)}
                  loading="lazy"
                  className="w-full aspect-[16/10] object-cover object-top block"
                />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {L(selectedTool.previewCaption)}
              </p>
            </div>

            {/* Live Prompt Output */}
            <div className="teach-card p-6 space-y-4 text-start">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="teach-eyebrow">{L(AI_STUDIO_UI.step3)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="teach-btn teach-btn-primary !py-2 !px-4 !text-xs border-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? L(AI_STUDIO_UI.copiedBtn) : L(AI_STUDIO_UI.copyBtn)}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="teach-btn teach-btn-secondary !py-2 !px-3.5 !text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {L(AI_STUDIO_UI.downloadBtn)}
                  </button>
                </div>
              </div>

              <pre
                dir={outputLang === 'ar' ? 'rtl' : 'ltr'}
                className="w-full max-h-[300px] overflow-y-auto rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[color-mix(in_srgb,var(--t-ink)_5%,transparent)] border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] text-[var(--t-ink)] m-0"
              >
                {generatedPrompt}
              </pre>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
