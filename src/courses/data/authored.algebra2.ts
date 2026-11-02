import type { AuthoredCourse } from './authored.algebra1';

export const ALGEBRA_2: AuthoredCourse = {
  id: 'algebra2',
  slug: 'algebra-2',
  title: { en: 'Algebra 2', ar: 'الجبر ٢' },
  short: { en: 'Algebra 2', ar: 'الجبر ٢' },
  grade: { en: 'Grade 11', ar: 'الصف ١١' },
  chapters: [
    {
      id: '1',
      title: { en: 'Chapter 1 · Functions Revisited', ar: 'الفصل ١ · الدوال مرة أخرى' },
      lessons: [
        {
          id: '1-1',
          code: '1.1',
          title: { en: 'Transformations of Functions', ar: 'تحويلات الدوال' },
          topics: [
            { en: 'Shifts and reflections', ar: 'الإزاحات والانعكاسات' },
            { en: 'Stretches and compressions', ar: 'التوسع والانضغاط' },
            { en: 'Order of transformations', ar: 'ترتيب التحويلات' },
          ],
        },
        {
          id: '1-2',
          code: '1.2',
          title: { en: 'Composite and Inverse Functions', ar: 'الدوال المركبة والعكسية' },
          topics: [
            { en: 'f(g(x)) and its domain', ar: 'f(g(x)) ومجالها' },
            { en: 'One-to-one functions', ar: 'الدوال التباينية' },
            { en: 'Finding an inverse', ar: 'إيجاد الدالة العكسية' },
          ],
        },
        {
          id: '1-3',
          code: '1.3',
          title: { en: 'Absolute Value Equations and Inequalities', ar: 'معادلات القيمة المطلقة ومتبايناتها' },
          topics: [
            { en: 'Two cases for |x| = k', ar: 'حالتان لـ |x| = k' },
            { en: 'Distance on the number line', ar: 'المسافة على خط الأعداد' },
            { en: 'Compound inequalities', ar: 'المتباينات المركبة' },
          ],
        },
        {
          id: '1-4',
          code: '1.4',
          title: { en: 'Piecewise and Step Functions', ar: 'الدوال المتشعبة والدرجية' },
          topics: [
            { en: 'Reading a piecewise rule', ar: 'قراءة القاعدة المتشعبة' },
            { en: 'The greatest integer function', ar: 'دالة الجزء الصحيح' },
            { en: 'Continuity at the join', ar: 'الاتصال عند نقطة الوصل' },
          ],
        },
      ],
    },
    {
      id: '2',
      title: { en: 'Chapter 2 · Quadratics and Complex Numbers', ar: 'الفصل ٢ · التربيعيات والأعداد المركبة' },
      lessons: [
        {
          id: '2-1',
          code: '2.1',
          title: { en: 'Completing the Square and Vertex Form', ar: 'إكمال المربع وصيغة الرأس' },
          topics: [
            { en: 'From standard to vertex form', ar: 'من الصيغة القياسية إلى صيغة الرأس' },
            { en: 'The vertex and the axis of symmetry', ar: 'الرأس ومحور التماثل' },
            { en: 'Maximum and minimum values', ar: 'القيم العظمى والصغرى' },
          ],
        },
        {
          id: '2-2',
          code: '2.2',
          title: { en: 'The Quadratic Formula', ar: 'الصيغة التربيعية' },
          topics: [
            { en: 'Deriving and using the formula', ar: 'اشتقاق الصيغة واستخدامها' },
            { en: 'The discriminant', ar: 'المميز' },
            { en: 'Number and type of roots', ar: 'عدد الجذور ونوعها' },
          ],
        },
        {
          id: '2-3',
          code: '2.3',
          title: { en: 'Complex Numbers', ar: 'الأعداد المركبة' },
          topics: [
            { en: 'The imaginary unit i', ar: 'الوحدة التخيلية i' },
            { en: 'Adding, multiplying and conjugates', ar: 'الجمع والضرب والمرافق' },
            { en: 'Powers of i', ar: 'قوى i' },
          ],
        },
        {
          id: '2-4',
          code: '2.4',
          title: { en: 'Quadratic Systems and Inequalities', ar: 'النظم التربيعية والمتباينات' },
          topics: [
            { en: 'A line meeting a parabola', ar: 'تقاطع خط مع قطع مكافئ' },
            { en: 'Number of solutions', ar: 'عدد الحلول' },
            { en: 'Shading a quadratic inequality', ar: 'تظليل متباينة تربيعية' },
          ],
        },
      ],
    },
    {
      id: '3',
      title: { en: 'Chapter 3 · Polynomials and Rational Functions', ar: 'الفصل ٣ · كثيرات الحدود والدوال النسبية' },
      lessons: [
        {
          id: '3-1',
          code: '3.1',
          title: { en: 'Polynomial Graphs', ar: 'تمثيلات كثيرات الحدود' },
          topics: [
            { en: 'End behaviour', ar: 'سلوك الأطراف' },
            { en: 'Zeros and multiplicity', ar: 'الأصفار والتعدد' },
            { en: 'Turning points', ar: 'نقاط الاستدارة' },
          ],
        },
        {
          id: '3-2',
          code: '3.2',
          title: { en: 'Dividing Polynomials', ar: 'قسمة كثيرات الحدود' },
          topics: [
            { en: 'Long division', ar: 'القسمة المطولة' },
            { en: 'Synthetic division', ar: 'القسمة التركيبية' },
            { en: 'The remainder theorem', ar: 'مبرهنة الباقي' },
          ],
        },
        {
          id: '3-3',
          code: '3.3',
          title: { en: 'Rational Functions and Asymptotes', ar: 'الدوال النسبية والخطوط التقاربية' },
          topics: [
            { en: 'Vertical asymptotes and holes', ar: 'الخطوط التقاربية الرأسية والفتحات' },
            { en: 'Horizontal and slant asymptotes', ar: 'الخطوط الأفقية والمائلة' },
            { en: 'End behaviour', ar: 'سلوك الأطراف' },
          ],
        },
        {
          id: '3-4',
          code: '3.4',
          title: { en: 'Rational Equations', ar: 'المعادلات النسبية' },
          topics: [
            { en: 'Multiplying by the common denominator', ar: 'الضرب في المقام المشترك' },
            { en: 'Extraneous solutions', ar: 'الحلول الدخيلة' },
            { en: 'Applications', ar: 'التطبيقات' },
          ],
        },
      ],
    },
    {
      id: '4',
      title: { en: 'Chapter 4 · Exponential, Logarithmic and Sequences', ar: 'الفصل ٤ · الأسية واللوغاريتمية والمتتابعات' },
      lessons: [
        {
          id: '4-1',
          code: '4.1',
          title: { en: 'Exponential Growth and Decay', ar: 'النمو والتلاشي الأسي' },
          topics: [
            { en: 'Growth and decay factors', ar: 'معاملا النمو والتلاشي' },
            { en: 'Doubling time and half-life', ar: 'زمن التضاعف وعمر النصف' },
            { en: 'Continuous growth e^kt', ar: 'النمو المستمر e^kt' },
          ],
        },
        {
          id: '4-2',
          code: '4.2',
          title: { en: 'Logarithms and Their Graphs', ar: 'اللوغاريتمات وتمثيلاتها' },
          topics: [
            { en: 'Logs as inverse exponentials', ar: 'اللوغاريتم كعكس الأسية' },
            { en: 'Log laws', ar: 'قوانين اللوغاريتم' },
            { en: 'Solving exponential equations', ar: 'حل المعادلات الأسية' },
          ],
        },
        {
          id: '4-3',
          code: '4.3',
          title: { en: 'Sequences and Series', ar: 'المتتابعات والمتسلسلات' },
          topics: [
            { en: 'Arithmetic and geometric sequences', ar: 'المتتابعات الحسابية والهندسية' },
            { en: 'Recursive and explicit rules', ar: 'القواعد التكرارية والصريحة' },
            { en: 'Sums of finite series', ar: 'مجموع المتسلسلات المنتهية' },
          ],
        },
      ],
    },
  ],
};
