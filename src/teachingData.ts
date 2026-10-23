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


  /** Marwan's corporate training & AI enablement portfolio. */
  corporate: 'https://marwan-abdulhady.vercel.app',
  /** Lesson channel on YouTube. */
  youtube: 'https://www.youtube.com/channel/UCJskFXSviblbJ4gm3Ejz0qQ',
  /** Worksheets (e.g. a shared Google Drive folder). Empty = "Coming soon". */
  worksheets: '',
  /** Teachers Pay Teachers store. Empty = "Coming soon". */
  tpt: '',
  /** 30-minute call on Calendly (interviews and parent/student intro calls). */
  booking: 'https://calendly.com/marwanabdulhady/30min',
  /** WhatsApp number without + or spaces. */
  whatsapp: '966562572728',

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
  { id: 'resources', label: { en: 'Lessons', ar: 'الدروس' } },
  { id: 'lab', label: { en: 'Math Arcade', ar: 'صالة الألعاب' } },
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
    en: 'Marwan Abdulhady is a mathematics teacher with more than eleven years of teaching experience, most recently in international schools, and an instructional designer holding a BSc in Mechanical Engineering from Benha University, a Diploma of Education from Ain Shams University and a PGCE from Liverpool John Moores University. He teaches mathematics at Dar Al Fikr Schools in Jeddah. He motivates students across the age and ability range, and has helped IGCSE and American Diploma students reach A* in Edexcel, CIE, SAT, ACT and EST mathematics.',
    ar: 'مروان عبد الهادي معلم رياضيات بخبرة تزيد على إحدى عشرة سنة في التدريس، آخرها في المدارس الدولية، ومصمم تعليمي حاصل على بكالوريوس الهندسة الميكانيكية من جامعة بنها، والدبلومة التربوية من جامعة عين شمس، ودبلومة التأهيل التربوي PGCE من جامعة ليفربول جون مورس. يدرّس الرياضيات في مدارس دار الفكر بجدة. يحفّز الطلاب على اختلاف أعمارهم ومستوياتهم، وساعد طلاب IGCSE والدبلومة الأمريكية على تحقيق A* في رياضيات Edexcel، CIE، SAT، ACT، EST.',
  },
  bio2: {
    en: 'Beyond the classroom he records short mathematics lessons on YouTube and builds the games his students play — the FIKR Math Arcade below is one of them — so a learner who has struggled elsewhere can still find a way in.',
    ar: 'خارج الفصل يسجّل دروس رياضيات قصيرة على يوتيوب ويبني الألعاب التي يلعبها طلابه — وصالة ألعاب فكر أدناه إحداها — ليجد أي متعلم واجه صعوبة في مكان آخر طريقه إلى الفهم.',
  },

  cta: { en: 'Watch my lessons on YouTube', ar: 'شاهد دروسي على يوتيوب' },
  /** Mosaic captions beside the About copy. */
  mosaic: [
    { en: 'In the classroom', ar: 'داخل الفصل' },
    { en: 'Step by step, at the board', ar: 'خطوة بخطوة أمام اللوح' },
    { en: 'Conic sections, one locus at a time', ar: 'القطوع المخروطية، محلاً واحداً في المرة' },
  ],
} as const;

/** Hero stats — from Marwan's teaching presentation (Oct 2026) and credentials. */
export const HERO_STATS: { value: string; label: Bi }[] = [
  { value: '11+', label: { en: 'Years Teaching', ar: 'سنوات في التدريس' } },
  { value: '4', label: { en: 'Schools in Egypt and Saudi Arabia', ar: 'مدارس في مصر والسعودية' } },
  { value: 'A*', label: { en: 'International Exam Results', ar: 'نتائج في الامتحانات الدولية' } },
  { value: '16+', label: { en: 'Verified Credentials', ar: 'اعتماد موثق' } },
];

/* -------------------------------------------------------------------------
   LESSONS & RESOURCES — YouTube lessons, worksheets and the TPT store.
   Paste links into LINKS (worksheets, tpt) and video ids into VIDEOS; a card
   without a link shows "Coming soon" instead of a dead button.
   ------------------------------------------------------------------------- */

/** YouTube lessons to feature: the 11-character id from youtube.com/watch?v=… */
export const VIDEOS: { id: string; title: Bi; topic: Bi }[] = [];

export const RESOURCES = {
  tag: { en: 'Lessons & resources', ar: 'الدروس والموارد' },
  titlePrefix: { en: 'Learn with my', ar: 'تعلّم مع' },
  titleAccent: { en: 'lessons and resources', ar: 'دروسي ومواردي' },
  desc: {
    en: 'Short mathematics lessons on YouTube, plus worksheets and classroom resources you can use straight away.',
    ar: 'دروس رياضيات قصيرة على يوتيوب، مع أوراق عمل وموارد صفية تستخدمها مباشرة.',
  },
  youtube: {
    title: { en: 'Mathematics lessons on YouTube', ar: 'دروس الرياضيات على يوتيوب' },
    desc: {
      en: 'Clear, step-by-step explanations for IGCSE and American curriculum students — watch, pause and practise at your own pace.',
      ar: 'شرح واضح خطوة بخطوة لطلاب IGCSE والمنهج الأمريكي — شاهد وتوقف وتدرّب بالسرعة التي تناسبك.',
    },
    cta: { en: 'Watch on YouTube', ar: 'شاهد على يوتيوب' },
  },
  worksheets: {
    title: { en: 'Worksheets', ar: 'أوراق العمل' },
    desc: {
      en: 'Practice sheets with answers, organised by topic, ready to print or assign.',
      ar: 'أوراق تدريب مع الإجابات، مرتبة حسب الموضوع، جاهزة للطباعة أو الإرسال.',
    },
    cta: { en: 'Open the worksheets', ar: 'افتح أوراق العمل' },
  },
  tpt: {
    title: { en: 'Teachers Pay Teachers store', ar: 'متجر Teachers Pay Teachers' },
    desc: {
      en: 'Classroom-ready games, task cards and lesson packs for teachers.',
      ar: 'ألعاب وبطاقات مهام وحزم دروس جاهزة للمعلمين.',
    },
    cta: { en: 'Visit the store', ar: 'زر المتجر' },
  },
  soon: { en: 'Coming soon', ar: 'قريباً' },
};

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
      id: 'fikr',
      years: '2026 – present',
      yearsAr: 'من ٢٠٢٦ إلى الآن',
      school: { en: 'Dar Al Fikr Schools, Jeddah', ar: 'مدارس دار الفكر، جدة' },
      role: { en: 'Mathematics teacher', ar: 'معلم رياضيات' },
      detail: { en: 'Grade 4 maths, taught as a flipped programme. The FIKR dashboard and the Math Arcade on this page were built for these classes.', ar: 'رياضيات الصف الرابع بأسلوب الفصل المقلوب. لوحة فكر وصالة الألعاب في هذه الصفحة بُنيت لهذه الفصول.' },
      photos: [],
    },
    {
      id: 'andalus',
      years: '2024 – 2026',
      yearsAr: 'من ٢٠٢٤ إلى ٢٠٢٦',
      school: { en: 'Al-Andalus International School, Jeddah', ar: 'مدارس الأندلس الدولية، جدة' },
      role: { en: 'English and Mathematics teacher', ar: 'معلم اللغة الإنجليزية والرياضيات' },
      photos: [
        { src: '/photos/andalus-award.webp', caption: { en: 'Recognised on stage at the end-of-term ceremony', ar: 'تكريم على المسرح في حفل نهاية الفصل' } },
        { src: '/photos/andalus-ceremony.webp', caption: { en: '“Little Steps Lead to Huge Success” — end of term', ar: '«خطوات صغيرة تقود إلى نجاح كبير» — نهاية الفصل' } },
      ],
    },
    {
      id: 'mhs',
      years: '2022 – 2024',
      yearsAr: 'من ٢٠٢٢ إلى ٢٠٢٤',
      school: { en: 'Manor House International School (MHS), Giza', ar: 'مدرسة مانور هاوس الدولية (MHS)، الجيزة' },
      role: { en: 'Mathematics teacher', ar: 'معلم رياضيات' },
      photos: [
        { src: '/photos/mhs-trip.webp', caption: { en: 'On the road with my MHS class', ar: 'في رحلة مع طلابي في MHS' } },
        { src: '/photos/mhs-playground.webp', caption: { en: 'Prize winners at MHS', ar: 'الفائزون بالجوائز في MHS' } },
        { src: '/photos/mhs-class.webp', caption: { en: 'A class selfie at MHS', ar: 'صورة جماعية مع الفصل في MHS' } },
      ],
    },
    {
      id: 'ris',
      years: '2020 – 2022',
      yearsAr: 'من ٢٠٢٠ إلى ٢٠٢٢',
      school: { en: 'Roots International School (RIS), Cairo', ar: 'مدرسة روتس الدولية (RIS)، القاهرة' },
      role: { en: 'Mathematics teacher, Years 6–8, British curriculum', ar: 'معلم رياضيات، الصفوف ٦–٨، المنهج البريطاني' },
      photos: [
        { src: '/photos/ris-class.webp', caption: { en: 'With my RIS students', ar: 'مع طلابي في RIS' } },
        { src: '/photos/ris-sports-day.webp', caption: { en: 'Sports day at RIS', ar: 'اليوم الرياضي في RIS' } },
        { src: '/photos/ris-trip.webp', caption: { en: 'A school trip with RIS', ar: 'رحلة مدرسية مع RIS' } },
      ],
    },
    {
      id: 'exams',
      years: '2021 – present',
      yearsAr: 'من ٢٠٢١ إلى الآن',
      school: { en: 'International exam preparation', ar: 'التحضير للامتحانات الدولية' },
      role: { en: 'IGCSE, O and A Level, American Diploma and EmSAT mathematics', ar: 'رياضيات IGCSE، المستوى O والمستوى A، الدبلومة الأمريكية، EmSAT' },
      detail: { en: 'Freelance IGCSE tutor (Edexcel and CIE) since 2021 · Island Academy, O and A Level · ExpertEase Education, IGCSE · Future Fluxes, EmSAT · Nile Training Centre, Algebra, Geometry and Precalculus for Grades 9–11, with SAT and ACT preparation.', ar: 'مدرّس IGCSE حر (Edexcel، CIE) منذ ٢٠٢١ · Island Academy للمستوى O والمستوى A · ExpertEase Education لـ IGCSE · Future Fluxes لـ EmSAT · مركز النيل للتدريب: الجبر والهندسة وما قبل التفاضل للصفوف ٩–١١ مع التحضير لـ SAT، ACT.' },
      photos: [],
    },
    {
      id: 'early',
      years: '2019 – 2023',
      yearsAr: 'من ٢٠١٩ إلى ٢٠٢٣',
      school: { en: 'Online tutoring, coding and English', ar: 'تدريس عبر الإنترنت وبرمجة ولغة إنجليزية' },
      role: { en: 'Maths tutor, coding instructor for kids, English instructor', ar: 'مدرّس رياضيات، ومدرّب برمجة للأطفال، ومدرّب لغة إنجليزية' },
      detail: { en: 'Online maths tutor at Etap · Years 7–8 homeschoolers in the United States with Rahman Institute · coding and STEM for kids at Timedoor · English and business-English courses, including technicians at National Oilwell Varco Egypt.', ar: 'مدرّس رياضيات عبر الإنترنت في Etap · طلاب التعليم المنزلي في الولايات المتحدة للصفين ٧–٨ مع Rahman Institute · البرمجة والعلوم (STEM) للأطفال في Timedoor · دورات اللغة الإنجليزية وإنجليزية الأعمال، منها فنيو National Oilwell Varco مصر.' },
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
   MATH ARCADE — the general games from FIKR's MathPlay hub, shipped as a
   self-contained copy in public/arcade (no lesson games, no pupil data)
   ------------------------------------------------------------------------- */

export type ArcadeTier = 'easy' | 'medium' | 'hard' | 'class';

export const ARCADE = {
  tag: { en: 'FIKR Math Arcade', ar: 'ألعاب فكر للرياضيات' },
  titlePrefix: { en: 'Play the', ar: 'العب في' },
  titleAccent: { en: 'Math Arcade', ar: 'صالة ألعاب الرياضيات' },
  desc: {
    en: 'The game arcade I built for my FIKR classes: 18 math games, five levels each, playable right here. No account, no download.',
    ar: 'صالة الألعاب التي بنيتها لفصول فكر: ١٨ لعبة رياضيات، بخمسة مستويات لكل لعبة، تلعبها هنا مباشرة. بلا حساب وبلا تنزيل.',
  },
  heading: { en: 'Enter the arcade', ar: 'ادخل صالة الألعاب' },
  body: {
    en: 'Daily Dash, a practice trainer and every game below in one place. Projector-friendly, so a whole class can play Tug of War or Math Football together.',
    ar: 'التحدي اليومي ومدرّب التدريب وكل الألعاب أدناه في مكان واحد. مناسبة لجهاز العرض، فيلعب الفصل كله شد الحبل أو كرة القدم الرياضية معاً.',
  },
  launch: { en: 'Open the arcade', ar: 'افتح صالة الألعاب' },
  openNewTab: { en: 'Full screen', ar: 'ملء الشاشة' },
  close: { en: 'Close', ar: 'إغلاق' },
  frameTitle: { en: 'FIKR Math Arcade', ar: 'ألعاب فكر للرياضيات' },
  home: '/arcade/index.html#/arcade',
  play: (id: string) => `/arcade/index.html#/play/${id}`,
  tiers: {
    easy: { en: 'Easy · K–2', ar: 'سهل · الروضة–٢' },
    medium: { en: 'Medium · 2–4', ar: 'متوسط · ٢–٤' },
    hard: { en: 'Hard · 4–6', ar: 'صعب · ٤–٦' },
    class: { en: 'Whole-class duels', ar: 'منافسات للفصل كله' },
  } as Record<ArcadeTier, Bi>,
  games: [
    { id: 'odd-even', tier: 'easy', icon: '⚖️', title: { en: 'Odd or Even', ar: 'زوجي أم فردي' }, desc: { en: 'Sort each number into the right bin', ar: 'صنّف كل عدد في سلته الصحيحة' } },
    { id: 'greater-less', tier: 'easy', icon: '🐊', title: { en: 'Greater or Less', ar: 'أكبر أم أصغر' }, desc: { en: 'Find the bigger side before time runs out', ar: 'اعثر على الجهة الأكبر قبل انتهاء الوقت' } },
    { id: 'skip-count', tier: 'easy', icon: '🚂', title: { en: 'Skip Count Train', ar: 'قطار العدّ بالقفز' }, desc: { en: 'Find the missing wagon', ar: 'اعثر على العربة الناقصة' } },
    { id: 'math-bubbles', tier: 'easy', icon: '🫧', title: { en: 'Math Bubbles', ar: 'فقاعات الرياضيات' }, desc: { en: 'Pop the bubble with the answer', ar: 'افقع الفقاعة التي تحمل الجواب' } },
    { id: 'memory-match', tier: 'easy', icon: '🃏', title: { en: 'Memory Match', ar: 'لعبة الذاكرة' }, desc: { en: 'Pair each equation with its answer', ar: 'طابق كل معادلة مع جوابها' } },
    { id: 'fraction-frenzy', tier: 'medium', icon: '🥧', title: { en: 'Fraction Frenzy', ar: 'جنون الكسور' }, desc: { en: 'Match shaded pies to fraction names', ar: 'طابق الدوائر المظللة مع أسماء الكسور' } },
    { id: 'balance-scale', tier: 'medium', icon: '⚖️', title: { en: 'Balance Scale', ar: 'الميزان' }, desc: { en: 'Choose the weight that levels the beam', ar: 'اختر الوزن الذي يوازن الميزان' } },
    { id: 'number-sort', tier: 'medium', icon: '🏃', title: { en: 'Number Sort Dash', ar: 'سباق ترتيب الأعداد' }, desc: { en: 'Tap ten numbers smallest to biggest', ar: 'رتّب عشرة أعداد من الأصغر للأكبر' } },
    { id: 'equation-builder', tier: 'medium', icon: '🧱', title: { en: 'Equation Builder', ar: 'باني المعادلات' }, desc: { en: 'Build a true number sentence', ar: 'ابنِ جملة عددية صحيحة' } },
    { id: 'sum-mines', tier: 'medium', icon: '💣', title: { en: 'Sum Minesweeper', ar: 'كاسحة الألغام الحسابية' }, desc: { en: 'Safe tiles equal the target', ar: 'المربعات الآمنة تساوي الهدف' } },
    { id: 'prime-patrol', tier: 'hard', icon: '🛡️', title: { en: 'Prime Patrol', ar: 'دورية الأعداد الأولية' }, desc: { en: 'Tap only the primes', ar: 'المس الأعداد الأولية فقط' } },
    { id: 'math-grid', tier: 'hard', icon: '🔢', title: { en: 'Math Grid', ar: 'شبكة الأرقام' }, desc: { en: '1–4 in every row and column, no repeats', ar: '١–٤ في كل صف وعمود دون تكرار' } },
    { id: 'number-path', tier: 'hard', icon: '🧵', title: { en: 'Number Path', ar: 'مسار الأعداد' }, desc: { en: 'Tap the numbers in order, each touching the last', ar: 'المس الأعداد بالترتيب، كلٌّ يلامس السابق' } },
    { id: 'number-maze', tier: 'hard', icon: '🌀', title: { en: 'Number Maze', ar: 'متاهة الأعداد' }, desc: { en: 'Draw a path that adds to the target', ar: 'ارسم مساراً مجموعه يساوي الهدف' } },
    { id: 'word-hunt', tier: 'hard', icon: '🔎', title: { en: 'Number Word Hunt', ar: 'البحث عن كلمات الأعداد' }, desc: { en: 'Find the number words in the grid', ar: 'اعثر على كلمات الأعداد في الشبكة' } },
    { id: 'tug-of-war', tier: 'class', icon: '🪢', title: { en: 'Math Tug of War', ar: 'شد الحبل الرياضي' }, desc: { en: 'Two crews, one rope, right answers pull', ar: 'فريقان وحبل واحد، الإجابة الصحيحة تشد' } },
    { id: 'math-football', tier: 'class', icon: '⚽', title: { en: 'Math Football', ar: 'كرة القدم الرياضية' }, desc: { en: 'Right answers carry the ball up the pitch', ar: 'الإجابات الصحيحة تتقدم بالكرة في الملعب' } },
    { id: 'math-fighter', tier: 'class', icon: '🥋', title: { en: 'Math Fighter', ar: 'المقاتل الرياضي' }, desc: { en: 'Every right answer is a move', ar: 'كل إجابة صحيحة حركة قتالية' } },
  ] as { id: string; tier: ArcadeTier; icon: string; title: Bi; desc: Bi }[],
};

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
  strandsTitle: { en: 'Play & learn', ar: 'العب وتعلّم' },
  contactTitle: { en: 'Contact', ar: 'تواصل' },
  copyright: {
    en: '© 2026 Marwan Abdulhady — Mathematics Educator & Instructional Designer',
    ar: '© ٢٠٢٦ مروان عبد الهادي — معلم رياضيات ومصمم تعليمي',
  },
  tagline: { en: 'Made with ❤️ for curious minds', ar: 'صُنع بـ❤️ من أجل عقول فضولية' },
  basedIn: { en: 'Jeddah, Saudi Arabia — Cairo, Egypt', ar: 'جدة، المملكة العربية السعودية — القاهرة، مصر' },
  backToTraining: { en: 'Corporate Training Portfolio', ar: 'ملف التدريب المؤسسي' },
} as const;

/* ---------------- ⚔ Live rooms (Math Lab) ---------------- */
export const ROOMS = {
  tag: { en: 'Live rooms', ar: 'غرف مباشرة' },
  title: { en: 'Challenge a friend, live', ar: 'تحدَّ صديقك مباشرة' },
  desc: {
    en: 'Make a room, share the 4-letter code, and play the real Math Fighter or Tug of War on two devices. Every right answer hits or pulls on both screens.',
    ar: 'أنشئ غرفة وشارك رمزها المكوّن من ٤ أحرف، والعبا المقاتل الرياضي أو شد الحبل على جهازين. كل إجابة صحيحة تضرب أو تشد على الشاشتين.',
  },
  name: { en: 'Your name', ar: 'اسمك' },
  namePh: { en: 'e.g. Sara', ar: 'مثلاً: سارة' },
  game: { en: 'Game', ar: 'اللعبة' },
  level: { en: 'Maths', ar: 'نوع الرياضيات' },
  time: { en: 'Match length', ar: 'مدة المباراة' },
  minutes: { en: 'min', ar: 'د' },
  make: { en: 'Make a room', ar: 'أنشئ غرفة' },
  or: { en: 'or join a friend’s room', ar: 'أو انضم إلى غرفة صديقك' },
  codePh: { en: 'Code', ar: 'الرمز' },
  join: { en: 'Join', ar: 'انضم' },
  robot: { en: 'No one to play with? Practise against a robot', ar: 'لا يوجد من يلعب معك؟ تدرّب ضد الروبوت' },
  skills: [
    { en: 'Rookie', ar: 'مبتدئ' },
    { en: 'Racer', ar: 'سريع' },
    { en: 'Master', ar: 'محترف' },
  ],
  connecting: { en: 'Opening the room…', ar: 'جارٍ فتح الغرفة…' },
  roomIs: { en: 'Your room code', ar: 'رمز غرفتك' },
  tell: { en: 'Send your friend this code or the link. They open this page, type the code and press Join.', ar: 'أرسل لصديقك هذا الرمز أو الرابط. يفتح هذه الصفحة ويكتب الرمز ويضغط انضم.' },
  copy: { en: 'Copy invite link', ar: 'انسخ رابط الدعوة' },
  copied: { en: 'Link copied', ar: 'تم نسخ الرابط' },
  waiting: { en: 'Waiting for your friend…', ar: 'بانتظار صديقك…' },
  vs: { en: 'vs', ar: 'ضد' },
  start: { en: 'Start the match', ar: 'ابدأ المباراة' },
  waitHost: { en: 'Waiting for {n} to start…', ar: 'بانتظار {n} ليبدأ…' },
  leave: { en: 'Leave room', ar: 'غادر الغرفة' },
  back: { en: 'Room', ar: 'الغرفة' },
  exit: { en: 'Exit', ar: 'خروج' },
  fs: { en: 'Full screen', ar: 'ملء الشاشة' },
  notes: {
    full: { en: 'That room already has two players.', ar: 'في هذه الغرفة لاعبان بالفعل.' },
    noRoom: { en: 'No one in that room yet. Check the code with your friend.', ar: 'لا أحد في هذه الغرفة بعد. تأكد من الرمز مع صديقك.' },
    offline: { en: 'Live rooms need the internet. Try again in a moment.', ar: 'الغرف المباشرة تحتاج إلى الإنترنت. حاول بعد قليل.' },
    oppLeft: { en: '{n} left the match.', ar: 'غادر {n} المباراة.' },
    won: { en: '🏆 You won! Rematch?', ar: '🏆 فزت! مباراة أخرى؟' },
    lost: { en: '{n} won this one. Rematch?', ar: 'فاز {n} هذه المرة. مباراة أخرى؟' },
    robotWon: { en: '🏆 You beat the robot!', ar: '🏆 هزمت الروبوت!' },
    robotLost: { en: 'The robot won. Try again!', ar: 'فاز الروبوت. حاول مرة أخرى!' },
  },
  games: [
    { id: 'math-fighter', icon: '🥋', title: { en: 'Math Fighter', ar: 'المقاتل الرياضي' }, rule: { en: 'Right answers are moves. Most K.O.s at the bell wins.', ar: 'الإجابات الصحيحة حركات. الأكثر ضربات قاضية عند الجرس يفوز.' } },
    { id: 'tug-of-war', icon: '🪢', title: { en: 'Tug of War', ar: 'شد الحبل' }, rule: { en: 'Right answers pull the rope. Most pulls over your line wins.', ar: 'الإجابات الصحيحة تشد الحبل. الأكثر سحباً عبر خطك يفوز.' } },
  ] as { id: 'math-fighter' | 'tug-of-war'; icon: string; title: Bi; rule: Bi }[],
  levels: [
    { v: 2, label: { en: 'Add & subtract (Grades 1–2)', ar: 'جمع وطرح (الصف ١–٢)' } },
    { v: 3, label: { en: 'Times & divide (Grades 3–5)', ar: 'ضرب وقسمة (الصف ٣–٥)' } },
    { v: 4, label: { en: 'Missing numbers (Grades 6–8)', ar: 'الأعداد المفقودة (الصف ٦–٨)' } },
    { v: 5, label: { en: 'Speed mix', ar: 'خليط سريع' } },
  ] as { v: number; label: Bi }[],
  lengths: [2, 3, 5],
};
