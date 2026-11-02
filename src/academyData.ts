import type { Bi } from './teachingData';

/* =========================================================================
   1. APPEARANCE CONTROL — 8 eye-comfort themes × 3 text sizes
   ========================================================================= */

export type AppearanceThemeId =
  | 'classic'
  | 'soft'
  | 'dark'
  | 'blue'
  | 'rose'
  | 'lavender'
  | 'mint'
  | 'contrast';

export type TextSizeId = 'small' | 'normal' | 'large';

export interface AppearanceTheme {
  id: AppearanceThemeId;
  label: Bi;
  note: Bi;
  swatchBg: string;
  swatchInk: string;
  swatchAccent: string;
}

export const APPEARANCE_THEMES: AppearanceTheme[] = [
  {
    id: 'classic',
    label: { en: 'Classic Paper', ar: 'ورقي كلاسيكي' },
    note: { en: 'Warm paper + navy & coral', ar: 'ورق دافئ مع كحلي ومرجاني' },
    swatchBg: '#fbf6ee',
    swatchInk: '#14213d',
    swatchAccent: '#e8553d',
  },
  {
    id: 'soft',
    label: { en: 'Soft Light', ar: 'إضاءة ناعمة' },
    note: { en: 'Gentle cream background', ar: 'خلفية هادئة مريحة للعين' },
    swatchBg: '#fffdf8',
    swatchInk: '#243247',
    swatchAccent: '#18324f',
  },
  {
    id: 'dark',
    label: { en: 'Chalkboard Dark', ar: 'داكن (سبورة)' },
    note: { en: 'Comfortable at night', ar: 'مريح للقراءة الليلية' },
    swatchBg: '#13233f',
    swatchInk: '#fdf8f0',
    swatchAccent: '#ff7a5c',
  },
  {
    id: 'blue',
    label: { en: 'Blue Comfort', ar: 'أزرق هادئ' },
    note: { en: 'Calm sky-blue tones', ar: 'درجات أزرق هادئة للتركيز' },
    swatchBg: '#f1f7fb',
    swatchInk: '#17324d',
    swatchAccent: '#164b73',
  },
  {
    id: 'rose',
    label: { en: 'Rose', ar: 'وردي ناعم' },
    note: { en: 'Soft rose + berry tones', ar: 'درجات وردية دافئة' },
    swatchBg: '#fff7fa',
    swatchInk: '#402735',
    swatchAccent: '#8b3a62',
  },
  {
    id: 'lavender',
    label: { en: 'Lavender', ar: 'لافندر' },
    note: { en: 'Gentle purple tones', ar: 'درجات بنفسجية لطيفة' },
    swatchBg: '#faf8ff',
    swatchInk: '#352d4b',
    swatchAccent: '#65518c',
  },
  {
    id: 'mint',
    label: { en: 'Mint', ar: 'نعناعي' },
    note: { en: 'Fresh mint + teal tones', ar: 'درجات نعناع وفيروزي منعشة' },
    swatchBg: '#f4fbf8',
    swatchInk: '#203d37',
    swatchAccent: '#277363',
  },
  {
    id: 'contrast',
    label: { en: 'High Contrast', ar: 'تباين عالٍ' },
    note: { en: 'Maximum reading clarity', ar: 'أعلى درجة وضوح للنصوص' },
    swatchBg: '#ffffff',
    swatchInk: '#000000',
    swatchAccent: '#ffd400',
  },
];

export const TEXT_SIZES: { id: TextSizeId; label: string; desc: Bi }[] = [
  { id: 'small', label: 'A−', desc: { en: 'Compact', ar: 'مضغوط' } },
  { id: 'normal', label: 'A', desc: { en: 'Default', ar: 'افتراضي' } },
  { id: 'large', label: 'A+', desc: { en: 'Large', ar: 'كبير' } },
];

export const APPEARANCE_UI = {
  buttonLabel: { en: 'Appearance', ar: 'المظهر' },
  eyebrow: { en: 'Reading comfort', ar: 'راحة القراءة' },
  title: { en: 'Appearance & Text Size', ar: 'المظهر وحجم الخط' },
  subtitle: {
    en: 'Choose the colour palette and text size that feel most comfortable — synced across the portfolio and interactive lessons.',
    ar: 'اختر لوحة الألوان وحجم النص الأنسب لعينيك — تُطبَّق فوراً على الموقع والدروس التفاعلية.',
  },
  textSizeLabel: { en: 'Text size', ar: 'حجم النص' },
  close: { en: 'Close', ar: 'إغلاق' },
};

/* =========================================================================
   2. ACADEMY LESSONS, COURSES & SEARCH INDEX (23 lessons + GMAT + Labs)
   ========================================================================= */

export interface AcademyLesson {
  id: string;
  code: string;
  courseSlug: 'grade-12-calculus' | 'grade-11-precalculus';
  courseTitle: Bi;
  grade: Bi;
  title: Bi;
  keywords: string;
  hasLab?: boolean;
  href: string;
}

export const ACADEMY_LESSONS: AcademyLesson[] = [
  // Grade 12 Calculus (14 lessons)
  {
    id: 'p1',
    code: 'P.1',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Graphs and Models', ar: 'التمثيل البياني والنماذج الرياضية' },
    keywords: 'intercepts symmetry intersections parabola modeling',
    href: '/academy/courses/grade-12-calculus/lessons/p1/index.html',
  },
  {
    id: 'p3',
    code: 'P.3',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Functions and Their Graphs', ar: 'الدوال وتمثيلاتها البيانية' },
    keywords: 'domain range function notation transformations composite',
    href: '/academy/courses/grade-12-calculus/lessons/p3/index.html',
  },
  {
    id: '1-2',
    code: '1.2',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Finding Limits Graphically and Numerically', ar: 'إيجاد النهايات بيانياً وعددياً' },
    keywords: 'limits table graph one-sided existence',
    href: '/academy/courses/grade-12-calculus/lessons/1-2/index.html',
  },
  {
    id: '1-3',
    code: '1.3',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Evaluating Limits Analytically', ar: 'حساب النهايات جبرياً' },
    keywords: 'direct substitution factoring rationalizing squeeze theorem trig limits',
    href: '/academy/courses/grade-12-calculus/lessons/1-3/index.html',
  },
  {
    id: '1-4',
    code: '1.4',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Continuity and One-Sided Limits', ar: 'الاتصال والنهايات من جهة واحدة' },
    keywords: 'continuity removable jump discontinuity intermediate value theorem ivt',
    href: '/academy/courses/grade-12-calculus/lessons/1-4/index.html',
  },
  {
    id: '1-5',
    code: '1.5',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Infinite Limits', ar: 'النهايات اللانهائية والخطوط المقاربة' },
    keywords: 'vertical asymptotes infinity sign analysis unbounded',
    href: '/academy/courses/grade-12-calculus/lessons/1-5/index.html',
  },
  {
    id: 'chapter-1-review',
    code: 'Ch 1',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Chapter 1 Review · Limits and Their Properties', ar: 'مراجعة الفصل الأول · النهايات وخصائصها' },
    keywords: 'limits review synthesis continuity asymptotes',
    href: '/academy/courses/grade-12-calculus/lessons/chapter-1-review/index.html',
  },
  {
    id: '2-1',
    code: '2.1',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'The Derivative and the Tangent Line Problem', ar: 'المشتقة ومشكلة خط المماس' },
    keywords: 'secant tangent slope difference quotient limit definition derivative',
    href: '/academy/courses/grade-12-calculus/lessons/2-1/index.html',
  },
  {
    id: '2-2-2-3',
    code: '2.2–2.3',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Differentiation Rules (Power, Product, Quotient)', ar: 'قواعد الاشتقاق (القوة، الضرب، القسمة)' },
    keywords: 'power rule product rule quotient rule trig derivatives velocity',
    href: '/academy/courses/grade-12-calculus/lessons/2-2-2-3/index.html',
  },
  {
    id: 'piecewise-differentiability',
    code: 'Lab',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Piecewise Functions & Differentiability', ar: 'الدوال المتفرعة وقابلية الاشتقاق' },
    keywords: 'piecewise corner cusp continuity left right derivative lab',
    hasLab: true,
    href: '/academy/courses/grade-12-calculus/lessons/piecewise-differentiability/index.html',
  },
  {
    id: '2-4',
    code: '2.4',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'The Chain Rule · See the Layers', ar: 'قاعدة التسلسل · رؤية الطبقات' },
    keywords: 'chain rule composite outer inner general power rule lab',
    hasLab: true,
    href: '/academy/courses/grade-12-calculus/lessons/2-4/index.html',
  },
  {
    id: '2-5',
    code: '2.5',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Implicit Differentiation', ar: 'الاشتقاق الضمني' },
    keywords: 'implicit dy/dx curves circle folium tangent lab',
    hasLab: true,
    href: '/academy/courses/grade-12-calculus/lessons/2-5/index.html',
  },
  {
    id: '2-6',
    code: '2.6',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Related Rates', ar: 'المعدلات المرتبطة بالزمن' },
    keywords: 'related rates time rate of change modeling geometry cone ladder',
    href: '/academy/courses/grade-12-calculus/lessons/2-6/index.html',
  },
  {
    id: 'chapter-2-review',
    code: 'Ch 2',
    courseSlug: 'grade-12-calculus',
    courseTitle: { en: 'Calculus', ar: 'التفاضل والتكامل' },
    grade: { en: 'Grade 12', ar: 'الصف ١٢' },
    title: { en: 'Chapter 2 Review · Differentiation', ar: 'مراجعة الفصل الثاني · الاشتقاق' },
    keywords: 'differentiation review rules chain implicit related rates',
    href: '/academy/courses/grade-12-calculus/lessons/chapter-2-review/index.html',
  },

  // Grade 11 Precalculus (9 lessons)
  {
    id: 'pc-1-1',
    code: '1.1',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Real Numbers', ar: 'الأعداد الحقيقية' },
    keywords: 'real numbers sets intervals absolute value distance properties',
    href: '/academy/courses/grade-11-precalculus/lessons/1-1/index.html',
  },
  {
    id: 'pc-1-3',
    code: '1.3',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Algebraic Expressions', ar: 'المقادير الجبرية والتحليل' },
    keywords: 'polynomials factoring expanding special products difference of squares',
    href: '/academy/courses/grade-11-precalculus/lessons/1-3/index.html',
  },
  {
    id: 'pc-1-4',
    code: '1.4',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Rational Expressions', ar: 'المقادير النسبية والكسور الجبرية' },
    keywords: 'rational domain simplifying lcd complex fractions',
    href: '/academy/courses/grade-11-precalculus/lessons/1-4/index.html',
  },
  {
    id: 'pc-1-8',
    code: '1.8',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Inequalities', ar: 'المتباينات وجداول الإشارات' },
    keywords: 'linear nonlinear rational absolute value inequalities sign chart',
    href: '/academy/courses/grade-11-precalculus/lessons/1-8/index.html',
  },
  {
    id: 'pc-1-9',
    code: '1.9',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'الصف ١١' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'The Coordinate Plane & Circles', ar: 'المستوى الإحداثي ومعادلة الدائرة' },
    keywords: 'distance midpoint circle equation completing the square symmetry',
    href: '/academy/courses/grade-11-precalculus/lessons/1-9/index.html',
  },
  {
    id: 'pc-2-1',
    code: '2.1',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Functions', ar: 'الدوال والمجال' },
    keywords: 'function evaluation piecewise domain difference quotient',
    href: '/academy/courses/grade-11-precalculus/lessons/2-1/index.html',
  },
  {
    id: 'pc-2-2',
    code: '2.2',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Graphs of Functions', ar: 'التمثيل البياني للدوال' },
    keywords: 'vertical line test parent functions piecewise graphs',
    href: '/academy/courses/grade-11-precalculus/lessons/2-2/index.html',
  },
  {
    id: 'pc-2-3',
    code: '2.3',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Getting Information from the Graph', ar: 'استخلاص المعلومات من التمثيل البياني' },
    keywords: 'increasing decreasing local extrema domain range reading graphs',
    href: '/academy/courses/grade-11-precalculus/lessons/2-3/index.html',
  },
  {
    id: 'pc-2-6',
    code: '2.6',
    courseSlug: 'grade-11-precalculus',
    courseTitle: { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    grade: { en: 'Grade 11', ar: 'الصف ١١' },
    title: { en: 'Transformations of Functions', ar: 'تحويلات الدوال (الإزاحة والانعكاس والتمدد)' },
    keywords: 'shifts reflections stretches even odd symmetry transformations',
    href: '/academy/courses/grade-11-precalculus/lessons/2-6/index.html',
  },
];

export interface ExtraSearchEntry {
  id: string;
  code: string;
  badge: Bi;
  title: Bi;
  keywords: string;
  kind: 'academy' | 'studio' | 'arcade';
  href?: string;
  studioTool?: string;
  arcadeId?: string;
}

export const EXTRA_SEARCH_ENTRIES: ExtraSearchEntry[] = [
  {
    id: 'desmos-calc',
    code: 'LAB',
    badge: { en: 'Graphing Lab · Calculus', ar: 'مختبر الرسم · التفاضل' },
    title: { en: 'Desmos Graphing Calculator (Calculus)', ar: 'حاسبة Desmos البيانية (التفاضل)' },
    keywords: 'desmos graphing calculator plot tangent curve calculus',
    kind: 'academy',
    href: '/academy/courses/grade-12-calculus/desmos/index.html',
  },
  {
    id: 'desmos-precalc',
    code: 'LAB',
    badge: { en: 'Graphing Lab · Precalculus', ar: 'مختبر الرسم · ما قبل التفاضل' },
    title: { en: 'Desmos Graphing Calculator (Precalculus)', ar: 'حاسبة Desmos البيانية (ما قبل التفاضل)' },
    keywords: 'desmos graphing calculator precalculus functions transformations',
    kind: 'academy',
    href: '/academy/courses/grade-11-precalculus/desmos/index.html',
  },
  {
    id: 'ai-tutor',
    code: 'AI',
    badge: { en: 'Socratic Study Console', ar: 'المساعد الذكي للرياضيات' },
    title: { en: 'Mathematics AI Tutor Console', ar: 'المعلّم الذكي للرياضيات خطوة بخطوة' },
    keywords: 'ai tutor chat help calculus limits derivatives step by step',
    kind: 'academy',
    href: '/academy/tutor/index.html',
  },
  {
    id: 'gmat-hub',
    code: 'GMAT',
    badge: { en: '38 Topics · Quant & Data Insights', ar: '٣٨ موضوعاً · الكمي وتحليل البيانات' },
    title: { en: 'GMAT Quantitative & Data Insights Hub', ar: 'مركز تحضير GMAT الكمي وتحليل البيانات' },
    keywords: 'gmat quant data insights sufficiency ratios percent quadratics',
    kind: 'academy',
    href: '/academy/courses/gmat-preparation/index.html',
  },
  {
    id: 'gmat-ds',
    code: 'GMAT',
    badge: { en: 'GMAT · Data Insights', ar: 'GMAT · كفاية البيانات' },
    title: { en: 'Data Sufficiency Strategy & Practice', ar: 'استراتيجية وتدريبات كفاية البيانات (Data Sufficiency)' },
    keywords: 'gmat data sufficiency statements yes no value',
    kind: 'academy',
    href: '/academy/courses/gmat-preparation/data-sufficiency/index.html',
  },
  {
    id: 'gmat-quad',
    code: 'GMAT',
    badge: { en: 'GMAT · Algebra', ar: 'GMAT · الجبر' },
    title: { en: 'Quadratics & Discriminants (GMAT Quant)', ar: 'المعادلات التربيعية والمميز (GMAT)' },
    keywords: 'gmat quant quadratics roots factoring algebra',
    kind: 'academy',
    href: '/academy/courses/gmat-preparation/quant/quadratics/index.html',
  },
  {
    id: 'gmat-graphics',
    code: 'GMAT',
    badge: { en: 'GMAT · Data Insights', ar: 'GMAT · تفسير الرسوم' },
    title: { en: 'Graphics Interpretation & Table Analysis', ar: 'تفسير الرسوم البيانية وتحليل الجداول' },
    keywords: 'gmat charts scatter pie table analysis graphics interpretation',
    kind: 'academy',
    href: '/academy/courses/gmat-preparation/graphics-interpretation/index.html',
  },
  {
    id: 'studio-lab',
    code: 'STUDIO',
    badge: { en: 'AI Teacher Studio', ar: 'استوديو المعلم الذكي' },
    title: { en: 'AI Teacher Studio — 6-Tool Prompt Builder', ar: 'استوديو المعلم بالذكاء الاصطناعي — منشئ الأوامر' },
    keywords: 'ai teacher studio lesson planner presentation game whiteboard lab prompt',
    kind: 'studio',
    studioTool: 'lab',
  },
];

export const SEARCH_UI = {
  trigger: { en: 'Search lessons', ar: 'ابحث في الدروس' },
  title: { en: 'Find any lesson, lab, or game', ar: 'ابحث عن أي درس أو مختبر أو لعبة' },
  placeholder: {
    en: 'Try chain rule, limits, 2.4, desmos, GMAT, or transformations…',
    ar: 'جرّب: قاعدة التسلسل، النهايات، 2.4، Desmos، GMAT، أو التحويلات…',
  },
  empty: { en: 'No matching lessons or labs found.', ar: 'لم يتم العثور على دروس أو مختبرات مطابقة.' },
  hint: {
    en: 'Press / anywhere to search · ↑↓ to navigate · Enter to open · Esc to close',
    ar: 'اضغط / للبحث السريع · ↑↓ للتنقل · Enter للفتح · Esc للإغلاق',
  },
};

/* =========================================================================
   3. ANIMATED MATHEMATICAL MODELS ("See the Idea — Visual Mathematics")
   ========================================================================= */

export const VISUAL_MATH_UI = {
  tag: { en: 'Visual mathematics', ar: 'الرياضيات البصرية' },
  titlePrefix: { en: 'See the idea.', ar: 'شاهد الفكرة.' },
  titleAccent: { en: 'Build the intuition.', ar: 'وابنِ الحدس الرياضي.' },
  desc: {
    en: 'Five live mathematical models linking equations, tables, slopes, transformations and data — pause at any frame to inspect the structure.',
    ar: 'خمسة نماذج رياضية حية تربط المعادلات بالجداول والمماس والتحويلات والبيانات — أوقف الحركة في أي لحظة لتأمّل البنية.',
  },
  pauseAll: { en: 'Pause animations', ar: 'إيقاف الحركة' },
  playAll: { en: 'Play animations', ar: 'تشغيل الحركة' },
  pause: { en: 'Pause', ar: 'إيقاف' },
  play: { en: 'Play', ar: 'تشغيل' },
  featured: {
    topline: { en: 'MAKE THE CONNECTION', ar: 'اربط التمثيلات الثلاثة' },
    badge: { en: 'Equation ↔ Table ↔ Graph', ar: 'معادلة ↔ جدول ↔ منحنى' },
    modes: [
      {
        title: { en: 'Learn visually', ar: 'تعلّم بصرياً' },
        desc: { en: 'Watch each input x map directly onto the curve and table.', ar: 'شاهد كل مدخل x يرتبط مباشرة بنقطته على المنحنى والجدول.' },
      },
      {
        title: { en: 'Practise actively', ar: 'تدرّب بفاعلية' },
        desc: { en: '162 guided self-checks with hints and per-option coaching.', ar: '١٦٢ سؤال تحقق ذاتي مع تلميحات وتغذية راجعة لكل خيار.' },
      },
      {
        title: { en: 'Rate mastery', ar: 'قيّم إتقانك' },
        desc: { en: 'Track Review, Practice and Confident across every section.', ar: 'تابع مستوى المراجعة والتدريب والثقة في كل قسم.' },
      },
    ],
    cta: { en: 'Explore interactive courses', ar: 'استكشف الدورات التفاعلية' },
  },
  cards: [
    {
      id: 'calculus',
      topline: { en: 'GRADE 12 CALCULUS', ar: 'تفاضل الصف ١٢' },
      formula: 'Δx → 0',
      title: { en: 'Secant → Tangent Slope', ar: 'من القاطع إلى المماس' },
      caption: {
        en: 'Watch secant lines through (1, 1) converge to the instantaneous derivative f′(1) = 2.',
        ar: 'شاهد القواطع المارة بالنقطة (1, 1) تقترب من ميل المماس اللحظي f′(1) = 2.',
      },
      cta: { en: 'Open Calculus (14 lessons)', ar: 'افتح التفاضل (١٤ درساً)' },
      href: '/academy/courses/grade-12-calculus/index.html',
    },
    {
      id: 'precalculus',
      topline: { en: 'GRADE 11 PRECALCULUS', ar: 'ما قبل التفاضل · الصف ١١' },
      formula: 'x → x − 1',
      title: { en: 'Same Shape. New Position.', ar: 'الشكل ذاته في موضع جديد' },
      caption: {
        en: 'Horizontal shift of f(x) = x² to g(x) = (x − 1)² — structure before memorisation.',
        ar: 'إزاحة أفقية للدالة f(x) = x² إلى g(x) = (x − 1)² — الفهم البنيوي قبل الحفظ.',
      },
      cta: { en: 'Open Precalculus (9 lessons)', ar: 'افتح ما قبل التفاضل (٩ دروس)' },
      href: '/academy/courses/grade-11-precalculus/index.html',
    },
    {
      id: 'gmat',
      topline: { en: 'GMAT QUANT & DATA INSIGHTS', ar: 'GMAT الكمي وتحليل البيانات' },
      formula: 'A : C = 1 : 2',
      title: { en: 'Read. Compare. Reason.', ar: 'اقرأ. قارن. استنتج.' },
      caption: {
        en: '38 Quant & Data Insights modules: Data Sufficiency, Table Analysis & Graphics Interpretation.',
        ar: '٣٨ وحدة في الكمي وتحليل البيانات: كفاية البيانات وتحليل الجداول والرسوم.',
      },
      cta: { en: 'Open GMAT Hub (38 topics)', ar: 'افتح مركز GMAT (٣٨ موضوعاً)' },
      href: '/academy/courses/gmat-preparation/index.html',
    },
    {
      id: 'exam',
      topline: { en: 'INTERNATIONAL EXAM PREP', ar: 'التحضير للامتحانات الدولية' },
      formula: 'THINK ↔ VERIFY',
      title: { en: 'Connected Mathematical Strands', ar: 'ترابط فروع الرياضيات' },
      caption: {
        en: 'Algebra, Geometry, Number and Data working together for IGCSE, SAT, ACT and EST.',
        ar: 'الجبر والهندسة والأعداد والبيانات في منظومة واحدة لاختبارات IGCSE وSAT وACT وEST.',
      },
      cta: { en: 'Open Exam Strategy Hub', ar: 'افتح مركز استراتيجيات الاختبار' },
      href: '/academy/courses/kuwait-national-exam/discover/index.html',
    },
  ],
};

/* =========================================================================
   4. GUIDED SELF-CHECK & WORKED-STEPS SAMPLER (Native React)
   ========================================================================= */

export interface GuidedSampleProblem {
  id: string;
  strand: Bi;
  lessonCode: string;
  lessonTitle: Bi;
  lessonHref: string;
  workedTitle: Bi;
  workedProblem: string;
  workedSteps: { label: Bi; math: string; note: Bi }[];
  question: Bi;
  options: string[];
  correctIndex: number;
  hint: Bi;
  explanation: Bi;
  optionFeedback: (Bi | null)[];
}

export const GUIDED_SAMPLER_UI = {
  eyebrow: { en: 'Try it right here · Live lesson engine', ar: 'جرّبه الآن مباشرة · محرك الدروس التفاعلي' },
  title: { en: 'Worked Steps, Guided Self-Check & Mastery Rating', ar: 'خطوات الحل، التحقق الذاتي، وتقييم الإتقان' },
  desc: {
    en: 'Every lesson pairs step-by-step worked examples with coaching questions that explain why each distractor fails — try a real checkpoint below, or launch any of the 23 full lessons.',
    ar: 'يجمع كل درس بين أمثلة محلولة خطوة بخطوة وأسئلة تحقق تشرح سبب خطأ كل خيار بديل — جرّب نموذجاً حياً أدناه أو افتح أياً من الدروس الـ ٢٣ الكاملة.',
  },
  workedBadge: { en: 'Worked Example', ar: 'مثال محلول خطوة بخطوة' },
  showAllSteps: { en: 'Show all worked steps', ar: 'أظهر جميع خطوات الحل' },
  allStepsShown: { en: 'All worked steps shown.', ar: 'تم إظهار جميع خطوات الحل.' },
  resetSteps: { en: 'Hide steps & try yourself', ar: 'إخفاء الخطوات والمحاولة ذاتياً' },
  selfCheckBadge: { en: 'Confidence Self-Check', ar: 'تحقق ذاتي من الفهم' },
  checkAnswer: { en: 'Check answer', ar: 'تحقق من الإجابة' },
  showHint: { en: 'Show hint', ar: 'أظهر تلميحاً' },
  hideHint: { en: 'Hide hint', ar: 'إخفاء التلميح' },
  showExplanation: { en: 'Show explanation', ar: 'أظهر الشرح الكامل' },
  tryAgain: { en: 'Try again', ar: 'حاول مرة أخرى' },
  correctTitle: { en: 'Correct — here is why.', ar: 'إجابة صحيحة — إليك السبب.' },
  wrongTitle: { en: 'Not yet — try this next.', ar: 'ليس بعد — جرّب هذه الفكرة.' },
  openFullLesson: { en: 'Open full interactive lesson', ar: 'افتح الدرس التفاعلي كاملاً' },
  masteryTitle: { en: 'Rate your confidence on this topic:', ar: 'قيّم مدى ثقتك في هذا الموضوع:' },
  masteryLevels: [
    { id: 'review', label: { en: 'Need review', ar: 'أحتاج مراجعة' } },
    { id: 'practice', label: { en: 'Need practice', ar: 'أحتاج تدريباً' } },
    { id: 'confident', label: { en: 'Confident', ar: 'واثق ومتمكن' } },
  ] as const,
};

export const GUIDED_SAMPLER_ITEMS: GuidedSampleProblem[] = [
  {
    id: 'c1-transfer-local',
    strand: { en: 'Calculus · Limits & Continuity', ar: 'التفاضل · النهايات والاتصال' },
    lessonCode: '1.4',
    lessonTitle: { en: 'Continuity and One-Sided Limits', ar: 'الاتصال والنهايات من جهة واحدة' },
    lessonHref: '/academy/courses/grade-12-calculus/lessons/1-4/index.html',
    workedTitle: { en: 'Testing continuity at a point x = 2', ar: 'اختبار الاتصال عند النقطة x = 2' },
    workedProblem: 'f(x) = (x² − 4) / (x − 2)  for x ≠ 2,   and   f(2) = 1',
    workedSteps: [
      {
        label: { en: 'Step 1 · Check f(2)', ar: 'الخطوة ١ · تحقق من قيمة f(2)' },
        math: 'f(2) = 1   (defined)',
        note: { en: 'The function has an assigned output at x = 2.', ar: 'الدالة معرّفة ولها قيمة محددة عند x = 2.' },
      },
      {
        label: { en: 'Step 2 · Compute the two-sided limit', ar: 'الخطوة ٢ · احسب النهاية من الجهتين' },
        math: 'lim_{x→2} [(x − 2)(x + 2) / (x − 2)] = lim_{x→2} (x + 2) = 4',
        note: { en: 'For x ≠ 2 we cancel (x − 2), so both sides approach 4.', ar: 'عند x ≠ 2 نختصر (x − 2)، فتقترب الجهتان من 4.' },
      },
      {
        label: { en: 'Step 3 · Compare limit with value', ar: 'الخطوة ٣ · قارن النهاية بقيمة الدالة' },
        math: 'lim_{x→2} f(x) = 4 ≠ f(2) = 1  ⇒  Removable discontinuity',
        note: { en: 'The limit exists, yet continuity fails because the hole is filled at the wrong height.', ar: 'النهاية موجودة، لكن الاتصال ينكسر لأن القيمة المعطاة لا تساوي النهاية.' },
      },
    ],
    question: {
      en: 'Suppose lim_{x→2⁻} f(x) = lim_{x→2⁺} f(x) = 5, but f(2) = 1. Which conclusion is justified?',
      ar: 'إذا كان lim_{x→2⁻} f(x) = lim_{x→2⁺} f(x) = 5، ولكن f(2) = 1، فأي استنتاج مما يلي صحيح؟',
    },
    options: [
      'The limit is 1',
      'The limit is 5, but f is not continuous at 2',
      'The limit does not exist',
      'The function is continuous because both sides agree',
    ],
    correctIndex: 1,
    hint: {
      en: 'Check the two-sided limit first, then compare that limit with the actual function value f(2).',
      ar: 'افحص النهاية من الجهتين أولاً، ثم قارنها بالقيمة الفعلية للدالة f(2).',
    },
    explanation: {
      en: 'The two one-sided limits agree at 5, so lim_{x→2} f(x) = 5 exists. Because 5 ≠ f(2) = 1, f is not continuous at x = 2.',
      ar: 'النهايتان من اليمين واليسار تتفقان عند 5، إذن النهاية موجودة وتساوي 5. وبما أن 5 ≠ f(2) = 1 فإن الدالة غير متصلة عند x = 2.',
    },
    optionFeedback: [
      {
        en: 'An isolated point value f(2) = 1 does not determine what f(x) approaches near 2.',
        ar: 'القيمة المعزولة f(2) = 1 لا تحدد ما تقترب منه الدالة بالقرب من 2.',
      },
      null,
      {
        en: 'Both one-sided limits equal 5, so the two-sided limit definitely exists.',
        ar: 'النهايتان من اليمين واليسار تساويان 5، لذا فالنهاية موجودة حتماً.',
      },
      {
        en: 'Agreement of both sides gives a limit, not continuity — continuity also requires lim_{x→2} f(x) = f(2).',
        ar: 'اتفاق الجهتين يضمن وجود النهاية فقط، أما الاتصال فيشترط أيضاً أن تساوي النهاية قيمة f(2).',
      },
    ],
  },
  {
    id: 'c24-chain-layers',
    strand: { en: 'Calculus · The Chain Rule Lab', ar: 'التفاضل · مختبر قاعدة التسلسل' },
    lessonCode: '2.4',
    lessonTitle: { en: 'The Chain Rule · See the Layers', ar: 'قاعدة التسلسل · رؤية الطبقات' },
    lessonHref: '/academy/courses/grade-12-calculus/lessons/2-4/index.html',
    workedTitle: { en: 'Differentiating a nested power function', ar: 'اشتقاق دالة قوى مركّبة' },
    workedProblem: 'y = (3x² + 5)⁴',
    workedSteps: [
      {
        label: { en: 'Step 1 · Expose outer & inner layers', ar: 'الخطوة ١ · حدد الطبقة الخارجية والداخلية' },
        math: 'Outer: u⁴     |     Inner: u = 3x² + 5',
        note: { en: 'Rewrite mentally as y = u⁴ before differentiating.', ar: 'اكتب الدالة ذهنياً على الصورة y = u⁴ قبل الاشتقاق.' },
      },
      {
        label: { en: 'Step 2 · Differentiate outer, keep inner intact', ar: 'الخطوة ٢ · اشتق الخارجية مع إبقاء الداخلية كما هي' },
        math: 'dy/du = 4u³ = 4(3x² + 5)³',
        note: { en: 'Never differentiate inside the parentheses at the same time!', ar: 'لا تشتق ما بداخل القوس في اللحظة نفسها!' },
      },
      {
        label: { en: 'Step 3 · Multiply by the inner derivative du/dx', ar: 'الخطوة ٣ · اضرب في مشتقة الداخل du/dx' },
        math: 'dy/dx = 4(3x² + 5)³ · (6x) = 24x(3x² + 5)³',
        note: { en: 'Multiply outer coefficients cleanly: 4 · 6x = 24x.', ar: 'اضرب المعاملات الخارجية بوضوح: 4 · 6x = 24x.' },
      },
    ],
    question: {
      en: 'What is the derivative of f(x) = sin(5x² − 1) with respect to x?',
      ar: 'ما مشتقة الدالة f(x) = sin(5x² − 1) بالنسبة إلى x؟',
    },
    options: [
      'cos(10x)',
      '10x · cos(5x² − 1)',
      'cos(5x² − 1)',
      '−10x · cos(5x² − 1)',
    ],
    correctIndex: 1,
    hint: {
      en: 'Differentiate the outer sine function while keeping (5x² − 1) unchanged, then multiply by d/dx(5x² − 1).',
      ar: 'اشتق دالة الجيب الخارجية مع إبقاء الزاوية (5x² − 1) دون تغيير، ثم اضرب في مشتقة الداخل.',
    },
    explanation: {
      en: 'Outer derivative of sin(u) is cos(u) = cos(5x² − 1). Multiplying by u′ = 10x gives 10x · cos(5x² − 1).',
      ar: 'مشتقة الطبقة الخارجية sin(u) هي cos(5x² − 1)، وبالضرب في مشتقة الداخل 10x نحصل على 10x · cos(5x² − 1).',
    },
    optionFeedback: [
      {
        en: 'You replaced the inner angle with its derivative instead of keeping (5x² − 1) inside cos(…).',
        ar: 'لقد استبدلت الزاوية الداخلية بمشتقتها بدلاً من إبقاء (5x² − 1) داخل جيب التمام.',
      },
      null,
      {
        en: 'Close! You differentiated the outer layer, but forgot the chain factor d/dx(5x² − 1) = 10x.',
        ar: 'قريب جداً! اشتققت الطبقة الخارجية لكن نسيت الضرب في مشتقة الداخل 10x.',
      },
      {
        en: 'The derivative of sin(u) is +cos(u), not −cos(u).',
        ar: 'مشتقة sin(u) هي +cos(u) بإشارة موجبة وليست سالبة.',
      },
    ],
  },
  {
    id: 'pc-transform-shift',
    strand: { en: 'Precalculus · Transformations', ar: 'ما قبل التفاضل · تحويلات الدوال' },
    lessonCode: '2.6',
    lessonTitle: { en: 'Transformations of Functions', ar: 'تحويلات الدوال' },
    lessonHref: '/academy/courses/grade-11-precalculus/lessons/2-6/index.html',
    workedTitle: { en: 'Tracking vertex movement under shifts', ar: 'تتبّع رأس المنحنى تحت تأثير الإزاحات' },
    workedProblem: 'Parent: f(x) = x²  (vertex at (0, 0))   →   New: g(x) = (x − 3)² + 2',
    workedSteps: [
      {
        label: { en: 'Step 1 · Read the inside horizontal change', ar: 'الخطوة ١ · اقرأ التغيير الأفقي داخل القوس' },
        math: '(x − 3)²  sets zero at x = 3  ⇒  Shift RIGHT 3 units',
        note: { en: 'Inside changes act on x in the opposite sign direction.', ar: 'التغييرات داخل الدالة تؤثر أفقياً بعكس الإشارة.' },
      },
      {
        label: { en: 'Step 2 · Read the outside vertical change', ar: 'الخطوة ٢ · اقرأ التغيير الرأسي خارج القوس' },
        math: '+ 2  adds 2 to every output  ⇒  Shift UP 2 units',
        note: { en: 'Outside changes act directly on y.', ar: 'التغييرات خارج الدالة تؤثر رأسياً بنفس الإشارة.' },
      },
      {
        label: { en: 'Step 3 · Map the key point', ar: 'الخطوة ٣ · عيّن الموضع الجديد للنقطة المرجعية' },
        math: '(0, 0)  →  (0 + 3, 0 + 2) = (3, 2)',
        note: { en: 'Every point on f(x) moves right 3 and up 2.', ar: 'كل نقطة على المنحنى تنتقل ٣ وحدات يميناً ووحدتين للأعلى.' },
      },
    ],
    question: {
      en: 'If the point (2, 5) lies on y = f(x), which point must lie on y = f(x + 4) − 1?',
      ar: 'إذا كانت النقطة (2, 5) تقع على منحنى y = f(x)، فأي نقطة يجب أن تقع على منحنى y = f(x + 4) − 1؟',
    },
    options: [
      '(6, 4)',
      '(−2, 4)',
      '(−2, 6)',
      '(6, 6)',
    ],
    correctIndex: 1,
    hint: {
      en: 'We know f(2) = 5. Set the new input (x + 4) equal to 2 to find x, then subtract 1 from the output 5.',
      ar: 'نعلم أن f(2) = 5. اجعل المدخل الجديد (x + 4) يساوي 2 لإيجاد x، ثم اطرح 1 من المخرج 5.',
    },
    explanation: {
      en: 'Setting x + 4 = 2 gives x = −2 (a shift 4 units left). Then y = f(2) − 1 = 5 − 1 = 4, giving (−2, 4).',
      ar: 'بوضع x + 4 = 2 نحصل على x = −2 (إزاحة ٤ وحدات لليسار)، ويكون y = f(2) − 1 = 4، فتنتج النقطة (−2, 4).',
    },
    optionFeedback: [
      {
        en: 'Careful: f(x + 4) shifts 4 units LEFT (2 − 4 = −2), not right.',
        ar: 'انتبه: الدالة f(x + 4) تزيح المنحنى ٤ وحدات إلى اليسار (2 − 4 = −2) لا إلى اليمين.',
      },
      null,
      {
        en: 'You shifted x left correctly to −2, but −1 outside subtracts 1 from y (5 − 1 = 4).',
        ar: 'أحسنت في الإزاحة الأفقية إلى −2، لكن −1 خارج الدالة تطرح 1 من الإحداثي الصادي (5 − 1 = 4).',
      },
      {
        en: 'Both directions are reversed: x + 4 moves left to −2, and −1 moves down to 4.',
        ar: 'كلا الاتجاهين معكوس: x + 4 تتحرك يساراً إلى −2، و−1 تتحرك أسفل إلى 4.',
      },
    ],
  },
];

/* =========================================================================
   5. INTERACTIVE ACADEMY WORKSPACE CARDS (in #resources)
   ========================================================================= */

export const ACADEMY_WORKSPACE_UI = {
  eyebrow: { en: 'Interactive Mathematics Hub', ar: 'أكاديمية الرياضيات التفاعلية' },
  titlePrefix: { en: 'Explore full courses,', ar: 'استكشف الدورات الكاملة،' },
  titleAccent: { en: 'graphing labs & AI tutor', ar: 'مختبرات الرسم والمعلم الذكي' },
  desc: {
    en: '23 complete Precalculus & Calculus lessons, 38 GMAT Quant & Data Insights modules, embedded Desmos graphing calculators, and a Socratic AI Tutor — open any workspace right on this page.',
    ar: '٢٣ درساً تفاعلياً كاملاً في ما قبل التفاضل والتفاضل، و٣٨ وحدة GMAT، وحاسبة Desmos البيانية، والمعلم الذكي — افتح أي مساحة عمل مباشرة في هذه الصفحة.',
  },
  openHub: { en: 'Open Academy Home', ar: 'افتح الرئيسية للأكاديمية' },
  openTutor: { en: 'Ask the Math AI Tutor', ar: 'اسأل المعلم الذكي' },
  openDesmos: { en: 'Open Desmos Graphing Lab', ar: 'افتح مختبر Desmos البياني' },
  openNewTab: { en: 'Full screen', ar: 'ملء الشاشة' },
  close: { en: 'Close', ar: 'إغلاق' },
  quickNav: [
    { label: { en: 'Hub Home', ar: 'الرئيسية' }, href: '/academy/index.html' },
    { label: { en: 'Calculus (14)', ar: 'التفاضل (١٤)' }, href: '/academy/courses/grade-12-calculus/index.html' },
    { label: { en: 'Precalculus (9)', ar: 'ما قبل التفاضل (٩)' }, href: '/academy/courses/grade-11-precalculus/index.html' },
    { label: { en: 'GMAT (38)', ar: 'GMAT (٣٨)' }, href: '/academy/courses/gmat-preparation/index.html' },
    { label: { en: 'Desmos Lab', ar: 'مختبر Desmos' }, href: '/academy/courses/grade-12-calculus/desmos/index.html' },
    { label: { en: 'AI Tutor', ar: 'المعلم الذكي' }, href: '/academy/tutor/index.html' },
  ],
};

/* =========================================================================
   6. AI TEACHER STUDIO — 6-Tool Prompt & Teaching Brief Builder
   ========================================================================= */

export interface StudioTool {
  id: 'lesson' | 'presentation' | 'game' | 'whiteboard' | 'video' | 'lab';
  badge: Bi;
  title: Bi;
  desc: Bi;
  previewImage: string;
  previewCaption: Bi;
  recommendedTool: string;
  deliverables: Bi;
}

export interface StudioPreset {
  id: string;
  label: Bi;
  toolId: StudioTool['id'];
  subject: string;
  grade: string;
  lesson: string;
  curriculum: string;
  focus: string;
  notes: string;
}

export const AI_STUDIO_UI = {
  tag: { en: 'AI Teacher Studio', ar: 'استوديو المعلم بالذكاء الاصطناعي' },
  titlePrefix: { en: 'Your next lesson idea deserves', ar: 'فكرتك التدريسية القادمة تستحق' },
  titleAccent: { en: 'more than a worksheet', ar: 'أكثر من ورقة عمل' },
  desc: {
    en: 'An instructional-design workbench for educators: choose one of six creation workflows, inspect a real sample output, fill your teaching brief, and generate a structured, classroom-ready AI prompt in English or Arabic.',
    ar: 'منصة تصميم تعليمي للمعلمين: اختر واحداً من ستة مسارات إبداعية، استعرض نموذج مخرجات حقيقي، أدخل بيانات درسك، وولّد أمراً احترافياً جاهزاً للتنفيذ بالإنجليزية أو العربية.',
  },
  step1: { en: '01 · Choose what to create', ar: '٠١ · اختر نوع المخرج التعليمي' },
  step2: { en: '02 · Shape your teaching brief', ar: '٠٢ · صمم ملخص الدرس' },
  step3: { en: '03 · Ready-to-run AI prompt', ar: '٠٣ · الأمر الاحترافي الجاهز' },
  presetLabel: { en: 'Quick-fill a sample brief', ar: 'تعبئة سريعة بنموذج جاهز' },
  customPreset: { en: 'Custom lesson brief', ar: 'درس مخصص من اختيارك' },
  fields: {
    subject: { en: 'Subject', ar: 'المادة' },
    grade: { en: 'Grade / Level', ar: 'الصف / المستوى' },
    lesson: { en: 'Lesson Title', ar: 'عنوان الدرس' },
    language: { en: 'Prompt Output Language', ar: 'لغة الأمر المُولَّد' },
    curriculum: { en: 'Curriculum (IGCSE, American, IB…)', ar: 'المنهج (IGCSE، الأمريكي، البكالوريا…)' },
    focus: { en: 'Concept & Interaction Focus', ar: 'محور التفاعل والمفاهيم الأساسية' },
    notes: { en: 'Misconceptions & Classroom Constraints', ar: 'الأخطاء الشائعة وملاحظات الحصة' },
  },
  copyBtn: { en: 'Copy Prompt', ar: 'انسخ الأمر' },
  copiedBtn: { en: 'Copied to clipboard!', ar: 'تم النسخ!' },
  downloadBtn: { en: 'Export .txt', ar: 'تنزيل .txt' },
  previewLabel: { en: 'Sample output preview', ar: 'معاينة نموذج المخرجات' },
  recommendedLabel: { en: 'Recommended AI runtime:', ar: 'الأداة المقترحة للتنفيذ:' },
  deliverablesLabel: { en: 'Target deliverables:', ar: 'المخرجات المطلوبة:' },
  privacyNote: {
    en: 'Educator review stays essential · Never include student personal data in prompts.',
    ar: 'مراجعة المعلم تظل أساسية · لا تُدرج أي بيانات شخصية للطلاب داخل الأوامر.',
  },
};

export const STUDIO_TOOLS: StudioTool[] = [
  {
    id: 'lab',
    badge: { en: 'Signature Tool', ar: 'الأداة المميزة' },
    title: { en: 'Interactive Lab Builder', ar: 'منشئ المختبرات التفاعلية' },
    desc: {
      en: 'A precise mathematical or scientific simulation with sliders, prediction checkpoints, live graphs and testable assertions.',
      ar: 'محاكاة رياضية أو علمية دقيقة مع منزلقات تحكم ونقاط توقّع ورسوم بيانية حية وتغذية راجعة.',
    },
    previewImage: '/studio/tool-lab-output.webp',
    previewCaption: {
      en: 'Sample output: 80m Fence Calculus Optimization Lab (Geometry + Area curve + Derivative sign)',
      ar: 'نموذج مخرجات: مختبر تحسين مساحة سياج بطول 80m (الهندسة + منحنى المساحة + إشارة المشتقة)',
    },
    recommendedTool: 'Claude Artifacts · ChatGPT Canvas · Gemini Canvas',
    deliverables: { en: 'Self-contained runnable HTML + offline ZIP', ar: 'ملف HTML تفاعلي مستقل يعمل دون إنترنت' },
  },
  {
    id: 'lesson',
    badge: { en: '5E Architecture', ar: 'نموذج 5E' },
    title: { en: 'Lesson Planner', ar: 'مخطط الدروس التربوي' },
    desc: {
      en: 'A coherent 5E learning journey with diagnostic warm-ups, misconception checks, paired tasks and exit tickets.',
      ar: 'خطة درس متكاملة وفق نموذج 5E مع تشخيص قبلي ومعالجة المفاهيم الخاطئة وأنشطة ثنائية وبطاقة خروج.',
    },
    previewImage: '/studio/lesson.webp',
    previewCaption: {
      en: 'Sample output: Grade 12 Optimization 45-minute 5E lesson plan & diagnostic checks',
      ar: 'نموذج مخرجات: خطة درس تفاضل للصف ١٢ لمدة ٤٥ دقيقة مع أسئلة تشخيصية',
    },
    recommendedTool: 'ChatGPT · Claude · Gemini',
    deliverables: { en: 'Structured Lesson Plan (DOCX / PDF / Markdown)', ar: 'خطة درس منظمة قابلة للطباعة والتعديل' },
  },
  {
    id: 'presentation',
    badge: { en: 'Visual Story', ar: 'عرض بصري' },
    title: { en: 'Presentation Studio', ar: 'استوديو العروض التدريسية' },
    desc: {
      en: 'A slide-by-slide visual narrative with clean diagrams, board prompts, pacing cues and speaker notes.',
      ar: 'قصة تدريسية شريحة بشريحة مع رسوم توضيحية وأسئلة نقاش صفّي وملاحظات للمعلم.',
    },
    previewImage: '/studio/tool-presentation-output.webp',
    previewCaption: {
      en: 'Sample output: Worked Lewis molecular structure slide with pacing & teacher notes',
      ar: 'نموذج مخرجات: شريحة تفاعلية لبنية الجزيئات مع توقيت وملاحظات المعلم',
    },
    recommendedTool: 'Gamma · Claude Artifacts · PowerPoint Copilot',
    deliverables: { en: 'Editable Slide Deck (PPTX / Interactive HTML)', ar: 'عرض شرائح قابل للتعديل (PPTX / HTML)' },
  },
  {
    id: 'game',
    badge: { en: 'Gamification', ar: 'تلعيب التعلم' },
    title: { en: 'Educational Game Creator', ar: 'صانع الألعاب التعليمية' },
    desc: {
      en: 'Learning-first mechanics where every move tests a concept, with tiered levels, hints and projector-friendly play.',
      ar: 'ألعاب تعليمية تضع الفهم أولاً، بمستويات متدرجة وتلميحات ذكية وتصميم يناسب شاشة الفصل.',
    },
    previewImage: '/studio/tool-game-output.webp',
    previewCaption: {
      en: 'Sample output: Browser-based challenge game with hint system & instant coaching',
      ar: 'نموذج مخرجات: لعبة تحدٍّ تفاعلية في المتصفح مع نظام تلميحات وتصحيح فوري',
    },
    recommendedTool: 'Claude Artifacts · Arena Agent · ChatGPT Canvas',
    deliverables: { en: 'Playable Single-File HTML5 Game', ar: 'لعبة متصفح HTML5 جاهزة للعب الفوري' },
  },
  {
    id: 'whiteboard',
    badge: { en: 'Progressive Reveal', ar: 'رسم متدرج' },
    title: { en: 'Whiteboard Animation', ar: 'رسوم السبورة المتحركة' },
    desc: {
      en: 'A timed step-by-step visual explanation with progressive SVG drawing and prediction pauses for class discussion.',
      ar: 'شرح بصري متدرج يرسم المخطط خطوة بخطوة مع وقفات توقّع لإشراك الطلاب في النقاش.',
    },
    previewImage: '/studio/tool-whiteboard-output.webp',
    previewCaption: {
      en: 'Sample output: Interactive Net Force & Acceleration whiteboard experiment',
      ar: 'نموذج مخرجات: تجربة سبورة تفاعلية للقوة المحصلة والتسارع',
    },
    recommendedTool: 'Claude Artifacts · HTML/SVG Canvas',
    deliverables: { en: 'Playable Animated SVG Storyboard', ar: 'سبورة رسوم متحركة تفاعلية بالمتصفح' },
  },
  {
    id: 'video',
    badge: { en: 'Production Spec', ar: 'إنتاج مرئي' },
    title: { en: '3D & Educational Video', ar: 'لوحة إنتاج الفيديو التعليمي' },
    desc: {
      en: 'Scientifically grounded shot-by-shot storyboards with exact timing, narration word-count, captions and model limits.',
      ar: 'لوحة قصصية دقيقة لقطة بلقطة مع التوقيت والنص الصوتي والتسميات التوضيحية وحدود النموذج العلمي.',
    },
    previewImage: '/studio/video.webp',
    previewCaption: {
      en: 'Sample output: Divergent Plate Boundary 8-second shot-by-shot production package',
      ar: 'نموذج مخرجات: حزمة إنتاج مرئي لقطة بلقطة لحركة الصفائح التكتونية',
    },
    recommendedTool: 'Veo / Flow · Blender · Runway',
    deliverables: { en: 'Shot-by-Shot Production Script & Timing Table', ar: 'سيناريو وجدول لقطات إنتاجي متكامل' },
  },
];

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: 'optimization',
    label: { en: 'Mathematics · Grade 12 Calculus · Optimization', ar: 'الرياضيات · تفاضل الصف ١٢ · القيم القصوى (Optimization)' },
    toolId: 'lab',
    subject: 'Mathematics · Calculus',
    grade: 'Grade 12 / AP & A-Level',
    lesson: 'Applied Optimization — Maximum Area with Fixed Perimeter',
    curriculum: 'British A-Level / AP Calculus',
    focus: 'Link physical rectangle geometry, the area parabola A(x) = x(40 − x), and the derivative sign chart A′(x) = 40 − 2x.',
    notes: '45-minute lesson; include a prediction box before revealing the derivative proof; address the misconception that perimeter 80 means x + y = 80 instead of 2x + 2y = 80.',
  },
  {
    id: 'transformations',
    label: { en: 'Mathematics · IGCSE / Grade 11 · Function Transformations', ar: 'الرياضيات · IGCSE / الصف ١١ · تحويلات الدوال' },
    toolId: 'whiteboard',
    subject: 'Mathematics · Precalculus',
    grade: 'Grade 10–11 (IGCSE / American Diploma)',
    lesson: 'Inside vs Outside Function Transformations f(x − h) + k',
    curriculum: 'Cambridge & Edexcel IGCSE / SAT',
    focus: 'Contrast horizontal shifts f(x − h) against vertical shifts f(x) + k using a live coordinate table and vertex tracker.',
    notes: 'Include prediction pauses before each curve shift; highlight why f(x + 3) moves left rather than right.',
  },
  {
    id: 'fractions-game',
    label: { en: 'Mathematics · Grade 4–6 · Equivalent Fractions Game', ar: 'الرياضيات · الصف ٤–٦ · لعبة الكسور المتكافئة' },
    toolId: 'game',
    subject: 'Mathematics · Number & Fractions',
    grade: 'Grades 4–6',
    lesson: 'Equivalent Fractions & Visual Area Bars',
    curriculum: 'British National Curriculum / Flipped Classroom',
    focus: 'Players match visual fraction bars and number-line positions under gentle progressive difficulty, earning combo streaks for conceptual accuracy.',
    notes: 'Projector-friendly for whole-class play, keyboard & touch accessible, zero external dependencies.',
  },
  {
    id: 'gmat-ds',
    label: { en: 'Exam Prep · GMAT Focus · Data Sufficiency Lesson', ar: 'التحضير للاختبارات · GMAT · كفاية البيانات' },
    toolId: 'lesson',
    subject: 'Quantitative Reasoning · GMAT Focus',
    grade: 'University / Graduate Prep',
    lesson: 'Mastering Data Sufficiency Without Over-Calculating',
    curriculum: 'GMAT Focus Edition',
    focus: 'Train the AD/BCE elimination grid, testing Statement (2) independently after Statement (1), and distinguishing Value vs Yes/No questions.',
    notes: 'Include 4 trap examples where C looks tempting because students forget integer/positivity constraints.',
  },
];
