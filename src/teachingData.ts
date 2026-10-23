/**
 * Content for the mathematics teaching portfolio (`/teaching`).
 *
 * Every factual claim here is drawn from the existing portfolio data
 * (see src/data.ts) — credentials, workshops, competencies and client
 * organisations are Marwan's real ones. Items that had no real counterpart
 * (video channels, a resource storefront) are wired to the editable LINKS
 * block below rather than invented, so nothing on the page is a fabrication.
 */

/** A bilingual string: `en` is the fallback when a translation is missing. */
export type Bi = { en: string; ar: string };

/* -------------------------------------------------------------------------
   EDITABLE OUTBOUND LINKS
   Everything external funnels through this object. Swap the values and the
   whole page updates — no component edits needed.
   ------------------------------------------------------------------------- */
export const LINKS = {
  /** Verified profile used across the corporate portfolio. */
  linkedin: 'https://www.linkedin.com/in/marwan-abdulhady/',
  /** Verified contact address used across the corporate portfolio. */
  email: 'Marwanabdulhady@gmail.com',

  /**
   * Where "Browse Collection" / "Request the Resource Library" leads.
   * Default is a pre-filled mailto so the page is functional today.
   * TODO: replace with a real storefront (TPT / Gumroad / Drive folder).
   */
  resources: 'mailto:Marwanabdulhady@gmail.com?subject=Mathematics%20Resource%20Library%20Request',

  /** Marwan's corporate training & AI enablement portfolio. */
  corporate: 'https://marwan-abdulhady.vercel.app',
  /** Lesson channel on YouTube. */
  youtube: 'https://www.youtube.com/channel/UCJskFXSviblbJ4gm3Ejz0qQ',
  /** 30-minute call on Calendly (interviews and parent/student intro calls). */
  booking: 'https://calendly.com/marwanabdulhady/30min',
  /** WhatsApp number without + or spaces. */
  whatsapp: '966562572728',

  /** Interactive mathematics workspace embedded by the lab section. */
  labHome: 'https://www.geogebra.org/classic',
} as const;

export const mailto = (subject: string) =>
  `mailto:${LINKS.email}?subject=${encodeURIComponent(subject)}`;

/* -------------------------------------------------------------------------
   BRANDING
   ------------------------------------------------------------------------- */

export const BRAND = {
  wordmark: 'Marwan Abdulhady',
  wordmarkAr: 'مروان عبد الهادي',
  sub: 'Mathematics Educator',
  subAr: 'معلم رياضيات',
  role: 'Mathematics Educator & Instructional Designer',
  roleAr: 'معلم رياضيات ومصمم تعليمي',
} as const;

/* -------------------------------------------------------------------------
   NAVIGATION
   ------------------------------------------------------------------------- */

export const NAV_ITEMS: { id: string; label: Bi }[] = [
  { id: 'about', label: { en: 'About', ar: 'نبذة' } },
  { id: 'experience', label: { en: 'Experience', ar: 'الخبرة' } },
  { id: 'designs', label: { en: 'Designs', ar: 'التصاميم' } },
  { id: 'resources', label: { en: 'Resources', ar: 'الموارد' } },
  { id: 'lab', label: { en: 'Math Lab', ar: 'المختبر' } },
  { id: 'gallery', label: { en: 'Gallery', ar: 'المعرض' } },
];

/* -------------------------------------------------------------------------
   HERO
   ------------------------------------------------------------------------- */

export const HERO = {
  badge: {
    en: 'Mathematics Education • British Curriculum • STEM',
    ar: 'تعليم الرياضيات • المنهج البريطاني • STEM',
  },
  titleLine1: { en: 'Where Logic', ar: 'حيث يلتقي' },
  titleLine2: { en: 'Meets Mastery', ar: 'المنطق بالإتقان' },
  subtitle: {
    en: 'A mathematics teaching hub designed and delivered by',
    ar: 'منصة تعليم رياضيات صممها ويقدمها',
  },
  name: { en: 'Mr. Marwan Abdulhady', ar: 'الأستاذ مروان عبد الهادي' },
  desc: {
    en: 'Explore curriculum-aligned mathematics resources, interactive graphing labs, and gamified lesson materials crafted for curious minds. From algebra and geometry to statistics, mechanics and calculus — learn differently.',
    ar: 'استكشف موارد رياضيات مطابقة للمناهج، ومختبرات رسم بياني تفاعلية، ومواد درسية مبنية على الألعاب صُممت للعقول الفضولية. من الجبر والهندسة إلى الإحصاء والميكانيكا والتفاضل — تعلّم بأسلوب مختلف.',
  },
  ctaPrimary: { en: 'Work with me', ar: 'اعمل معي' },
  ctaSecondary: { en: 'See my designs', ar: 'شاهد تصاميمي' },
} as const;

/* -------------------------------------------------------------------------
   CREDENTIALS BAR — real qualifications, verbatim from src/data.ts
   ------------------------------------------------------------------------- */

export const CREDENTIALS_BAR: { short: Bi; detail: Bi }[] = [
  {
    short: { en: 'Liverpool John Moores University', ar: 'جامعة ليفربول جون مورس' },
    detail: { en: 'PGCE — Postgraduate Certificate of Education', ar: 'دبلومة التأهيل التربوي PGCE' },
  },
  {
    short: { en: 'Benha University', ar: 'جامعة بنها' },
    detail: { en: 'BSc Mechanical Engineering', ar: 'بكالوريوس الهندسة الميكانيكية' },
  },
  {
    short: { en: 'Ain Shams University', ar: 'جامعة عين شمس' },
    detail: { en: 'Professional Educational Certificate — 175 hrs', ar: 'شهادة التأهيل المهني — ١٧٥ ساعة' },
  },
  {
    short: { en: 'STEM.org', ar: 'STEM.org' },
    detail: { en: 'Accredited STEM Educator (In Progress)', ar: 'اعتماد معلم STEM (جارٍ)' },
  },
  {
    short: { en: 'British Council', ar: 'المجلس الثقافي البريطاني' },
    detail: { en: 'Teaching for Success — 16 hrs', ar: 'التدريس من أجل النجاح — ١٦ ساعة' },
  },
  {
    short: { en: 'Harvard University', ar: 'جامعة هارفارد' },
    detail: { en: 'CS50 Computer Science Foundations — 16 hrs', ar: 'أساسيات علوم الحاسب CS50 — ١٦ ساعة' },
  },
  {
    short: { en: 'Elearning Academy', ar: 'أكاديمية التعليم الإلكتروني' },
    detail: { en: 'Instructional Design & Gamification Diplomas', ar: 'دبلومتا التصميم التعليمي والألعاب التعليمية' },
  },
  {
    short: { en: 'TEFL.org', ar: 'TEFL.org' },
    detail: { en: 'Core TEFL Certification — 50 hrs', ar: 'شهادة TEFL الأساسية — ٥٠ ساعة' },
  },
];

/* -------------------------------------------------------------------------
   ABOUT
   ------------------------------------------------------------------------- */

export const ABOUT = {
  tag: { en: 'About', ar: 'نبذة' },
  titlePrefix: { en: 'Meet', ar: 'التقوا بـ' },
  titleAccent: { en: 'Mr. Marwan Abdulhady', ar: 'الأستاذ مروان عبد الهادي' },
  bio1: {
    en: 'Marwan Abdulhady is a mathematics teacher with more than six years in international schools, and an instructional designer holding a BSc in Mechanical Engineering from Benha University and a PGCE from Liverpool John Moores University. He motivates students across the age and ability range, and has helped IGCSE and American Diploma students reach A* in Edexcel, CIE, SAT, ACT and EST mathematics.',
    ar: 'مروان عبد الهادي معلم رياضيات بخبرة تزيد على ست سنوات في المدارس الدولية، ومصمم تعليمي حاصل على بكالوريوس الهندسة الميكانيكية من جامعة بنها ودبلومة التأهيل التربوي PGCE من جامعة ليفربول جون مورس. يحفّز الطلاب على اختلاف أعمارهم ومستوياتهم، وساعد طلاب IGCSE والدبلومة الأمريكية على تحقيق A* في رياضيات Edexcel، CIE، SAT، ACT، EST.',
  },
  bio2: {
    en: 'Through this teaching hub he shares curriculum-aligned worksheets, interactive graphing and geometry labs, gamified practice loops and project-based investigations spanning algebra, geometry, trigonometry, statistics, mechanics and calculus — every one designed so that a learner who has struggled elsewhere can still find a way in.',
    ar: 'عبر هذه المنصة يشارك أوراق عمل مطابقة للمناهج، ومختبرات رسم بياني وهندسة تفاعلية، ودورات تدريب مبنية على الألعاب، ومشروعات بحثية تغطي الجبر والهندسة وحساب المثلثات والإحصاء والميكانيكا والتفاضل — كلها مصممة بحيث يجد أي متعلم واجه صعوبة في مكان آخر طريقه إلى الفهم.',
  },
  cta: { en: 'Request the Resource Library', ar: 'اطلب مكتبة الموارد' },
  /** Mosaic captions beside the About copy. */
  mosaic: [
    { en: 'In the classroom', ar: 'داخل الفصل' },
    { en: 'Step by step, at the board', ar: 'خطوة بخطوة أمام اللوح' },
    { en: 'Conic sections, one locus at a time', ar: 'القطوع المخروطية، محلاً واحداً في المرة' },
  ],
} as const;

/** Hero stats — from Marwan's teaching presentation (Oct 2026) and credentials. */
export const HERO_STATS: { value: string; label: Bi }[] = [
  { value: '6+', label: { en: 'Years Teaching', ar: 'سنوات في التدريس' } },
  { value: '3', label: { en: 'International Schools', ar: 'مدارس دولية' } },
  { value: 'A*', label: { en: 'International Exam Results', ar: 'نتائج في الامتحانات الدولية' } },
  { value: '16+', label: { en: 'Verified Credentials', ar: 'اعتماد موثق' } },
];

/* -------------------------------------------------------------------------
   RESOURCE LIBRARY
   ------------------------------------------------------------------------- */

export const RESOURCES = {
  tag: { en: 'Resources', ar: 'الموارد' },
  titlePrefix: { en: 'Mathematics', ar: 'مكتبة' },
  titleAccent: { en: 'Resource Library', ar: 'موارد الرياضيات' },
  desc: {
    en: 'Classroom-ready mathematics materials aligned to British and American curriculum standards. Downloadable, editable, and ready to use.',
    ar: 'مواد رياضيات جاهزة للصف ومطابقة لمعايير المنهجين البريطاني والأمريكي. قابلة للتنزيل والتعديل والاستخدام الفوري.',
  },
  main: {
    icon: '🧮',
    title: { en: 'Full Resource Library', ar: 'المكتبة الكاملة للموارد' },
    desc: {
      en: 'Browse the complete collection of mathematics materials — worksheets, investigations, assessments, posters and interactive labs across every strand.',
      ar: 'استعرض المجموعة الكاملة من مواد الرياضيات — أوراق عمل، ومشروعات بحثية، وتقويمات، وملصقات، ومختبرات تفاعلية في كل فرع.',
    },
    cta: { en: 'Request Full Access', ar: 'اطلب الوصول الكامل' },
  },
  strands: [
    {
      id: 'algebra',
      icon: '📐',
      gradient: 'linear-gradient(135deg,#00b4d8,#0077b6)',
      title: { en: 'Algebra & Equations', ar: 'الجبر والمعادلات' },
      desc: {
        en: 'Linear and quadratic relations, simultaneous equations, inequalities and algebraic manipulation for every key stage.',
        ar: 'العلاقات الخطية والتربيعية، والمعادلات الآنية، والمتباينات، والتلاعب الجبري لكل مرحلة دراسية.',
      },
    },
    {
      id: 'geometry',
      icon: '📏',
      gradient: 'linear-gradient(135deg,#48cae4,#0096c7)',
      title: { en: 'Geometry & Trigonometry', ar: 'الهندسة وحساب المثلثات' },
      desc: {
        en: 'Angles, congruence and similarity, circle theorems, vectors and trigonometric ratios anchored in construction-based tasks.',
        ar: 'الزوايا، والتطابق والتشابه، ونظريات الدائرة، والمتجهات، والنسب المثلثية، مؤسسة على مهام إنشائية.',
      },
    },
    {
      id: 'functions',
      icon: '📈',
      gradient: 'linear-gradient(135deg,#f4a11d,#e76f51)',
      title: { en: 'Functions & Calculus', ar: 'الدوال والتفاضل والتكامل' },
      desc: {
        en: 'Function notation, transformations, limits, differentiation and integration built graphical intuition first, symbols second.',
        ar: 'ترميز الدوال، والتحويلات، والنهايات، والتفاضل والتكامل — تبدأ بالحدس البياني ثم تأتي الرموز.',
      },
    },
    {
      id: 'statistics',
      icon: '📊',
      gradient: 'linear-gradient(135deg,#6a0dad,#9b5de5)',
      title: { en: 'Statistics & Probability', ar: 'الإحصاء والاحتمالات' },
      desc: {
        en: 'Data handling, distributions, sampling, correlation and probability trees drawn from data the class collects itself.',
        ar: 'معالجة البيانات، والتوزيعات، والعينات، والارتباط، وأشجار الاحتمالات — من بيانات يجمعها الصف بنفسه.',
      },
    },
    {
      id: 'mechanics',
      icon: '⚙️',
      gradient: 'linear-gradient(135deg,#2d6a4f,#52b788)',
      title: { en: 'Mechanics & Applied Maths', ar: 'الميكانيكا والرياضيات التطبيقية' },
      desc: {
        en: 'Kinematics, forces, moments and mathematical modelling — where a mechanical-engineering degree meets the classroom.',
        ar: 'علم الحركة، والقوى، والعزوم، والنمذجة الرياضية — حيث تلتقي شهادة الهندسة الميكانيكية بالفصل الدراسي.',
      },
    },
    {
      id: 'investigations',
      icon: '🧭',
      gradient: 'linear-gradient(135deg,#03045e,#0077b6)',
      title: { en: 'Mathematical Investigations', ar: 'المشروعات البحثية الرياضية' },
      desc: {
        en: 'Open-ended, project-based tasks that anchor abstract topics in real-life scenarios and measurable outcomes.',
        ar: 'مهام مفتوحة قائمة على المشروعات تؤسس المفاهيم المجردة على سيناريوهات واقعية ونتائج قابلة للقياس.',
      },
    },
  ],
} as const;

/* -------------------------------------------------------------------------
   EXPERIENCE — schools and roles, from Marwan's teaching presentation
   ------------------------------------------------------------------------- */

export const EXPERIENCE = {
  tag: { en: 'Experience', ar: 'الخبرة' },
  titlePrefix: { en: 'Where I have', ar: 'أين' },
  titleAccent: { en: 'taught', ar: 'درّست' },
  results: {
    en: 'IGCSE and American Diploma students reached A* in Edexcel, CIE, SAT, ACT and EST mathematics.',
    ar: 'حقق طلاب IGCSE والدبلومة الأمريكية A* في رياضيات Edexcel، CIE، SAT، ACT، EST.',
  },
  roles: [
    {
      id: 'andalus',
      years: '2024 – present',
      yearsAr: '٢٠٢٤ – الآن',
      school: { en: 'Al Andalus International School', ar: 'مدارس الأندلس الدولية' },
      role: { en: 'Mathematics teacher', ar: 'معلم رياضيات' },
      photos: [
        { src: '/photos/andalus-award.webp', caption: { en: 'Recognised on stage at the end-of-term ceremony', ar: 'تكريم على المسرح في حفل نهاية الفصل' } },
        { src: '/photos/andalus-ceremony.webp', caption: { en: '“Little Steps Lead to Huge Success” — end of term', ar: '«خطوات صغيرة تقود إلى نجاح كبير» — نهاية الفصل' } },
      ],
    },
    {
      id: 'mhs',
      years: '2022 – 2024',
      yearsAr: '٢٠٢٢ – ٢٠٢٤',
      school: { en: 'MHS American International School', ar: 'مدرسة MHS الأمريكية الدولية' },
      role: { en: 'Mathematics teacher', ar: 'معلم رياضيات' },
      photos: [],
    },
    {
      id: 'ris',
      years: '2020 – 2022',
      yearsAr: '٢٠٢٠ – ٢٠٢٢',
      school: { en: 'RIS British International School', ar: 'مدرسة RIS البريطانية الدولية' },
      role: { en: 'Mathematics teacher', ar: 'معلم رياضيات' },
      photos: [],
    },
    {
      id: 'tutor',
      years: '2021 – present',
      yearsAr: '٢٠٢١ – الآن',
      school: { en: 'Freelance', ar: 'عمل حر' },
      role: { en: 'IGCSE mathematics tutor', ar: 'مدرّس رياضيات IGCSE' },
      photos: [],
    },
  ],
};

/* -------------------------------------------------------------------------
   WORK WITH ME — two paths: schools hiring, and parents/students learning
   ------------------------------------------------------------------------- */

export const WORK = {
  tag: { en: 'Work with me', ar: 'اعمل معي' },
  titlePrefix: { en: 'Two ways to', ar: 'طريقتان' },
  titleAccent: { en: 'work together', ar: 'للعمل معاً' },
  desc: {
    en: 'Whether you are building a mathematics department or helping one learner fall in love with numbers, it starts with a 30-minute call.',
    ar: 'سواء كنت تبني قسم رياضيات أو تساعد متعلماً واحداً على حب الأرقام، البداية مكالمة مدتها ٣٠ دقيقة.',
  },
  schools: {
    tag: { en: 'For schools', ar: 'للمدارس' },
    title: { en: 'Hire me for your team', ar: 'انضم إلى فريقكم' },
    desc: {
      en: 'A mathematics teacher who designs the learning, not just delivers it — and brings the games, apps and dashboards to prove it.',
      ar: 'معلم رياضيات يصمم التعلم ولا يكتفي بتقديمه — ويأتي بالألعاب والتطبيقات ولوحات المتابعة التي تثبت ذلك.',
    },
    points: [
      { en: 'PGCE from Liverpool John Moores University, BSc in Mechanical Engineering', ar: 'دبلومة PGCE من جامعة ليفربول جون مورس، وبكالوريوس الهندسة الميكانيكية' },
      { en: 'Gamified practice and teacher dashboards that show each student’s progress', ar: 'تدريب قائم على التلعيب ولوحات للمعلم تُظهر تقدم كل طالب' },
      { en: 'Teaching and training in English and Arabic', ar: 'تدريس وتدريب بالإنجليزية والعربية' },
      { en: 'Course development, instructional design and teacher training', ar: 'تطوير المقررات والتصميم التعليمي وتدريب المعلمين' },
    ],
    cta: { en: 'Book an interview call', ar: 'احجز مكالمة تعارف' },
    note: 'School / teaching role — interview call',
  },
  learn: {
    tag: { en: 'For parents & students', ar: 'لأولياء الأمور والطلاب' },
    title: { en: 'Learn with me', ar: 'تعلّم معي' },
    desc: {
      en: 'Mathematics that finally makes sense: clear explanations, practice that feels like a game, and progress you can see.',
      ar: 'رياضيات تصبح مفهومة أخيراً: شرح واضح، وتدريب يشبه اللعب، وتقدم تراه بعينك.',
    },
    points: [
      { en: 'From algebra and geometry to statistics, mechanics and calculus', ar: 'من الجبر والهندسة إلى الإحصاء والميكانيكا والتفاضل' },
      { en: 'Exam preparation: IGCSE, SAT, ACT and EST', ar: 'التحضير للامتحانات: IGCSE، SAT، ACT، EST' },
      { en: 'Lessons built around the student’s own gaps, not a fixed script', ar: 'دروس مبنية على فجوات الطالب نفسه، لا على نص ثابت' },
      { en: 'Coding for kids, and general and business English', ar: 'البرمجة للأطفال، والإنجليزية العامة وللأعمال' },
      { en: 'Games and short practice between sessions, in English or Arabic', ar: 'ألعاب وتدريب قصير بين الجلسات، بالإنجليزية أو العربية' },
    ],
    cta: { en: 'Book an intro call', ar: 'احجز مكالمة تعريفية' },
    note: 'Parent / student — mathematics learning',
    whatsapp: {
      en: 'Hi Marwan, I saw your teaching portfolio and would like to ask about mathematics sessions.',
      ar: 'مرحباً أ. مروان، شاهدت ملفك التعليمي وأود السؤال عن جلسات الرياضيات.',
    },
  },
};

/* -------------------------------------------------------------------------
   LEARNING-EXPERIENCE DESIGNS — real projects; screenshots in public/designs
   ------------------------------------------------------------------------- */

export interface Design {
  id: string;
  date: string;
  title: Bi;
  kind: Bi;
  what: Bi;
  /** Who it is for and what changes for them. */
  forWho: Bi;
  stack: string;
  device: 'desktop' | 'phone';
  steps: { image: string; label: Bi }[];
  link?: string;
}

export const DESIGNS_HEADER = {
  tag: { en: 'Learning-experience design', ar: 'تصميم تجارب التعلم' },
  titlePrefix: { en: 'Learning I have', ar: 'تجارب تعلم' },
  titleAccent: { en: 'designed and built', ar: 'صممتها وبنيتها' },
  desc: {
    en: 'Games, apps and courses I designed from the learner up, then built myself. Tap any step to walk the learner’s journey.',
    ar: 'ألعاب وتطبيقات ودورات صممتها انطلاقاً من المتعلم ثم بنيتها بنفسي. اضغط على أي خطوة لتعيش رحلة المتعلم.',
  },
};

export const DESIGNS: Design[] = [
  {
    id: 'fikr',
    date: 'Oct 2026',
    title: { en: 'FIKR Math Games', ar: 'ألعاب فكر للرياضيات' },
    kind: { en: 'Gamified math platform', ar: 'منصة رياضيات قائمة على التلعيب' },
    what: {
      en: 'A road of sixteen lesson gates, each unlocked by a game: build rooms on a blueprint, dive the Red Sea with decimals, race the Daily Dash. Plus an adaptive trainer and a teacher dashboard.',
      ar: 'طريق من ستة عشر باباً، كل باب تفتحه لعبة: ابنِ الغرف على مخطط، واغطس في البحر الأحمر بالكسور العشرية، وتسابق في التحدي اليومي. مع مدرّب تكيفي ولوحة للمعلم.',
    },
    forWho: {
      en: 'For students who switch off in practice time, and the teachers who want to see each one’s progress.',
      ar: 'للطلاب الذين يفقدون الحماس وقت التدريب، وللمعلمين الذين يريدون رؤية تقدم كل طالب.',
    },
    stack: 'JavaScript · Supabase · Vercel',
    device: 'desktop',
    steps: [
      { image: '/designs/fikr-1.webp', label: { en: 'Pick a gate', ar: 'اختر باباً' } },
      { image: '/designs/fikr-2.webp', label: { en: 'Build the area', ar: 'ابنِ المساحة' } },
      { image: '/designs/fikr-3.webp', label: { en: 'Dive the decimals', ar: 'اغطس في الكسور' } },
      { image: '/designs/fikr-4.webp', label: { en: 'Daily Dash', ar: 'التحدي اليومي' } },
    ],
  },
  {
    id: 'quran',
    date: 'Sep 2026',
    title: { en: 'Quran Garden', ar: 'حديقة القرآن' },
    kind: { en: 'Children’s learning app', ar: 'تطبيق تعليمي للأطفال' },
    what: {
      en: 'An installable app where children grow four gardens — letters, numbers, Quran and English — one short daily visit at a time, with stories, listening and badges.',
      ar: 'تطبيق قابل للتثبيت ينمّي فيه الأطفال أربع حدائق — الحروف والأرقام والقرآن والإنجليزية — بزيارة يومية قصيرة، مع القصص والاستماع والأوسمة.',
    },
    forWho: {
      en: 'For young children and their parents: a calm daily habit instead of long screen sessions.',
      ar: 'للأطفال الصغار وأهلهم: عادة يومية هادئة بدلاً من جلسات طويلة أمام الشاشة.',
    },
    stack: 'React · PWA',
    device: 'phone',
    steps: [
      { image: '/designs/quran-1.webp', label: { en: 'Today’s visit', ar: 'زيارة اليوم' } },
      { image: '/designs/quran-2.webp', label: { en: 'Letters path', ar: 'رحلة الحروف' } },
      { image: '/designs/quran-3.webp', label: { en: 'A letter’s day', ar: 'يوم الحرف' } },
      { image: '/designs/quran-4.webp', label: { en: 'Surah story', ar: 'قصة السورة' } },
    ],
  },
  {
    id: 'clinic',
    date: 'Oct 2026',
    title: { en: 'Healthcare induction e-learning', ar: 'تعلم إلكتروني لتهيئة موظفي قطاع صحي' },
    kind: { en: 'Instructional design · SCORM', ar: 'تصميم تعليمي · SCORM' },
    what: {
      en: 'Six SCORM courses built from a clinic’s manuals, decks and videos: 207 storyboarded screens, 26 scenarios, role-based tips and two guide characters.',
      ar: 'ست دورات SCORM مبنية من أدلة وعروض وفيديوهات عيادة: ٢٠٧ شاشة بلوحات قصصية و٢٦ سيناريو ونصائح حسب الدور وشخصيتان مرشدتان.',
    },
    forWho: {
      en: 'For new staff in their first week: decisions to practise, not slides to click through.',
      ar: 'للموظفين الجدد في أسبوعهم الأول: قرارات يتدربون عليها، لا شرائح يتصفحونها.',
    },
    stack: 'Action Mapping · SCORM 1.2/2004 · WCAG 2.2 AA',
    device: 'desktop',
    steps: [
      { image: '/designs/clinic-1.webp', label: { en: 'Meet the guide', ar: 'تعرّف على المرشدة' } },
      { image: '/designs/clinic-2.webp', label: { en: 'Order the controls', ar: 'رتّب الضوابط' } },
      { image: '/designs/clinic-3.webp', label: { en: 'Read the hazard', ar: 'اقرأ الخطر' } },
    ],
  },
  {
    id: 'compass',
    date: 'Jun 2026',
    title: { en: 'ID Compass', ar: 'بوصلة التصميم التعليمي' },
    kind: { en: 'AI copilot for instructional designers', ar: 'مساعد ذكي للمصممين التعليميين' },
    what: {
      en: 'A bilingual instructional-design copilot: a phase-by-phase project workspace, an encyclopedia of 330+ AI tools for educators, and a 2026 playbook for AI video production.',
      ar: 'مساعد تصميم تعليمي ثنائي اللغة: مساحة مشاريع مرحلة بمرحلة، وموسوعة لأكثر من ٣٣٠ أداة ذكاء اصطناعي للمعلمين، ودليل ٢٠٢٦ لإنتاج الفيديو بالذكاء الاصطناعي.',
    },
    forWho: {
      en: 'For teachers and designers who want to plan a course with AI, step by step.',
      ar: 'للمعلمين والمصممين الذين يريدون تخطيط دورة بالذكاء الاصطناعي خطوة بخطوة.',
    },
    stack: 'React · Gemini API · Firebase',
    device: 'desktop',
    steps: [
      { image: '/designs/compass-1.webp', label: { en: 'Home', ar: 'الرئيسية' } },
      { image: '/designs/compass-2.webp', label: { en: '330+ AI tools', ar: '+٣٣٠ أداة' } },
      { image: '/designs/compass-3.webp', label: { en: 'Video playbook', ar: 'دليل الفيديو' } },
    ],
    link: 'https://id-compass-1.vercel.app/',
  },
];

/* -------------------------------------------------------------------------
   INTERACTIVE MATHEMATICS LAB
   ------------------------------------------------------------------------- */

export const LAB = {
  tag: { en: 'Interactive', ar: 'تفاعلي' },
  titlePrefix: { en: 'Interactive', ar: 'مختبر' },
  titleAccent: { en: 'Mathematics Lab', ar: 'الرياضيات التفاعلي' },
  desc: {
    en: 'Graph it, drag it, and watch the algebra follow. Live construction and visualisation for learners who need to see a concept move before they can own it.',
    ar: 'ارسمها، واسحبها، وشاهد الجبر يتبعها. بناء وتصوير حيّ للمتعلمين الذين يحتاجون رؤية المفهوم يتحرك قبل أن يمتلكوه.',
  },
  icon: '🧮',
  heading: { en: 'Enter the Mathematics Lab', ar: 'ادخل مختبر الرياضيات' },
  body: {
    en: 'Plot functions, construct figures, spin solids in three dimensions and run probability simulations — all inside the page, no installation and no account.',
    ar: 'ارسم الدوال، وأنشئ الأشكال، وأدر المجسمات في ثلاثة أبعاد، وشغّل محاكاة الاحتمالات — كل ذلك داخل الصفحة، دون تثبيت ودون حساب.',
  },
  launch: { en: 'Launch Interactive Lab', ar: 'تشغيل المختبر التفاعلي' },
  openNewTab: { en: 'Open in New Tab', ar: 'افتح في تبويب جديد' },
  close: { en: 'Close', ar: 'إغلاق' },
  frameTitle: { en: 'Marwan Abdulhady — Interactive Mathematics Lab', ar: 'مروان عبد الهادي — مختبر الرياضيات التفاعلي' },
  apps: [
    {
      id: 'graphing',
      icon: '📈',
      title: { en: 'Graphing & Algebra', ar: 'الرسم والجبر' },
      desc: { en: 'Plot, solve, transform', ar: 'ارسم، حل، حوّل' },
      url: 'https://www.geogebra.org/graphing',
    },
    {
      id: 'geometry',
      icon: '📐',
      title: { en: 'Geometry', ar: 'الهندسة' },
      desc: { en: 'Constructions & proofs', ar: 'الإنشاءات والبراهين' },
      url: 'https://www.geogebra.org/geometry',
    },
    {
      id: '3d',
      icon: '🧊',
      title: { en: '3D Calculator', ar: 'الحاسبة ثلاثية الأبعاد' },
      desc: { en: 'Solids, planes, vectors', ar: 'المجسمات والمستويات والمتجهات' },
      url: 'https://www.geogebra.org/3d',
    },
    {
      id: 'probability',
      icon: '🎲',
      title: { en: 'Probability', ar: 'الاحتمالات' },
      desc: { en: 'Distributions & sampling', ar: 'التوزيعات والعينات' },
      url: 'https://www.geogebra.org/probability',
    },
    {
      id: 'cas',
      icon: '∫',
      title: { en: 'CAS & Calculus', ar: 'الجبر الرمزي والتفاضل' },
      desc: { en: 'Symbolic manipulation', ar: 'معالجة رمزية' },
      url: 'https://www.geogebra.org/cas',
    },
  ],
} as const;

/* -------------------------------------------------------------------------
   CLASSROOM GALLERY
   ------------------------------------------------------------------------- */

export const GALLERY = {
  tag: { en: 'Gallery', ar: 'المعرض' },
  titlePrefix: { en: 'The Classroom', ar: 'عالم' },
  titleAccent: { en: 'Universe', ar: 'الصف الدراسي' },
  desc: {
    en: 'Six sides of the same teacher — from the whiteboard to the boardroom, always teaching, always building.',
    ar: 'ستة أوجه لمعلم واحد — من السبورة إلى غرفة الاجتماعات، يعلم دائماً ويبني دائماً.',
  },
  roles: [
    {
      id: 'solver',
      icon: '🧭',
      label: { en: 'The Problem Solver', ar: 'حلال المشكلات' },
      note: { en: 'Project-based investigations', ar: 'مشروعات بحثية قائمة على حل المشكلات' },
      /** Which generated motif to draw. */
      art: 'spiral',
      gradient: 'linear-gradient(160deg,#0d2444,#0a1628)',
    },
    {
      id: 'geometer',
      icon: '📐',
      label: { en: 'The Geometer', ar: 'المهندس الهندسي' },
      note: { en: 'Constructions before formulas', ar: 'الإنشاءات قبل الصيغ' },
      art: 'conics',
      gradient: 'linear-gradient(160deg,#10315c,#0a1628)',
    },
    {
      id: 'analyst',
      icon: '📊',
      label: { en: 'The Analyst', ar: 'المحلل' },
      note: { en: 'Data-driven assessment', ar: 'تقويم قائم على البيانات' },
      art: 'chart',
      gradient: 'linear-gradient(160deg,#0b3b3b,#0a1628)',
    },
    {
      id: 'gamifier',
      icon: '🎲',
      label: { en: 'The Gamifier', ar: 'صانع الألعاب التعليمية' },
      note: { en: 'Gamification diplomas, applied', ar: 'دبلومات الألعاب التعليمية مطبقة' },
      art: 'dice',
      gradient: 'linear-gradient(160deg,#2a1246,#0a1628)',
    },
    {
      id: 'designer',
      icon: '🎯',
      label: { en: 'The Instructional Designer', ar: 'المصمم التعليمي' },
      note: { en: 'ADDIE, scenario mapping, PBL', ar: 'ADDIE، خرائط السيناريو، التعلم بالمشروعات' },
      art: 'compass',
      gradient: 'linear-gradient(160deg,#3a2410,#0a1628)',
    },
    {
      id: 'ai',
      icon: '🤖',
      label: { en: 'The AI-Enabled Educator', ar: 'المعلم الممكّن بالذكاء الاصطناعي' },
      note: { en: 'AI for rapid content creation', ar: 'الذكاء الاصطناعي لإنتاج المحتوى السريع' },
      art: 'network',
      gradient: 'linear-gradient(160deg,#0e2340,#0a1628)',
    },
  ],
} as const;

/* -------------------------------------------------------------------------
   FOOTER
   ------------------------------------------------------------------------- */

export const FOOTER = {
  blurb: {
    en: 'A mathematics teaching hub by Marwan Abdulhady — making abstract structure visible, tactile, and genuinely learnable.',
    ar: 'منصة تعليم رياضيات من مروان عبد الهادي — تجعل البنية المجردة مرئية وملموسة وقابلة للتعلم حقاً.',
  },
  exploreTitle: { en: 'Explore', ar: 'استكشف' },
  strandsTitle: { en: 'Mathematical Strands', ar: 'فروع الرياضيات' },
  contactTitle: { en: 'Contact', ar: 'تواصل' },
  copyright: {
    en: '© 2026 Marwan Abdulhady — Mathematics Educator & Instructional Designer',
    ar: '© ٢٠٢٦ مروان عبد الهادي — معلم رياضيات ومصمم تعليمي',
  },
  tagline: { en: 'Made with ❤️ for curious minds', ar: 'صُنع بـ❤️ من أجل عقول فضولية' },
  basedIn: { en: 'Jeddah, Saudi Arabia — Cairo, Egypt', ar: 'جدة، المملكة العربية السعودية — القاهرة، مصر' },
  backToTraining: { en: 'Corporate Training Portfolio', ar: 'ملف التدريب المؤسسي' },
} as const;
