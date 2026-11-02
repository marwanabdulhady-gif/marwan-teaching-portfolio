/**
 * Authored course content for the courses the academy app does not ship.
 *
 * These lessons have no static page: the lesson panel *is* the lesson, built
 * from the explorer, the topic checklist and the practice questions. Algebra 1,
 * Algebra 2 and Geometry live here so the map, progress and practice layers
 * treat them exactly like the Calculus and Precalculus lessons.
 */
import type { Bi } from '../../teachingData';

export interface AuthoredLesson {
  id: string;
  code: string;
  title: Bi;
  topics: Bi[];
}

export interface AuthoredChapter {
  id: string;
  title: Bi;
  lessons: AuthoredLesson[];
}

export interface AuthoredCourse {
  id: 'algebra1' | 'algebra2' | 'geometry';
  /** Lesson-key prefix, e.g. `algebra-1/2-3`. */
  slug: string;
  title: Bi;
  short: Bi;
  grade: Bi;
  chapters: AuthoredChapter[];
}

export const ALGEBRA_1: AuthoredCourse = {
  id: 'algebra1',
  slug: 'algebra-1',
  title: { en: 'Algebra 1', ar: 'الجبر ١' },
  short: { en: 'Algebra 1', ar: 'الجبر ١' },
  grade: { en: 'Grade 9', ar: 'الصف ٩' },
  chapters: [
    {
      id: '1',
      title: { en: 'Chapter 1 · Foundations of Algebra', ar: 'الفصل ١ · أساسيات الجبر' },
      lessons: [
        {
          id: '1-1',
          code: '1.1',
          title: { en: 'Variables and Expressions', ar: 'المتغيرات والتعابير' },
          topics: [
            { en: 'Variables and algebraic expressions', ar: 'المتغيرات والتعابير الجبرية' },
            { en: 'Evaluating expressions', ar: 'إيجاد قيمة التعابير' },
            { en: 'Translating words into algebra', ar: 'ترجمة الكلمات إلى جبر' },
          ],
        },
        {
          id: '1-2',
          code: '1.2',
          title: { en: 'Order of Operations and Properties', ar: 'ترتيب العمليات والخواص' },
          topics: [
            { en: 'The order of operations', ar: 'ترتيب العمليات' },
            { en: 'Commutative and associative properties', ar: 'الخاصية التبديلية والتجميعية' },
            { en: 'The distributive property', ar: 'الخاصية التوزيعية' },
          ],
        },
        {
          id: '1-3',
          code: '1.3',
          title: { en: 'Solving One- and Two-Step Equations', ar: 'حل المعادلات بخطوة وخطوتين' },
          topics: [
            { en: 'Inverse operations', ar: 'العمليات العكسية' },
            { en: 'Keeping both sides balanced', ar: 'الحفاظ على توازن الطرفين' },
            { en: 'Checking a solution', ar: 'التحقق من الحل' },
          ],
        },
        {
          id: '1-4',
          code: '1.4',
          title: { en: 'Literal Equations and Formulas', ar: 'المعادلات الحرفية والصيغ' },
          topics: [
            { en: 'Solving for a named variable', ar: 'الحل لمتغير معين' },
            { en: 'Rearranging formulas', ar: 'إعادة ترتيب الصيغ' },
            { en: 'Applications in geometry and science', ar: 'تطبيقات في الهندسة والعلوم' },
          ],
        },
      ],
    },
    {
      id: '2',
      title: { en: 'Chapter 2 · Linear Functions', ar: 'الفصل ٢ · الدوال الخطية' },
      lessons: [
        {
          id: '2-1',
          code: '2.1',
          title: { en: 'Slope and Rate of Change', ar: 'الميل ومعدل التغير' },
          topics: [
            { en: 'Rise over run', ar: 'الصعود على الأفقي' },
            { en: 'Slope from two points', ar: 'الميل من نقطتين' },
            { en: 'Rate of change in context', ar: 'معدل التغير في السياق' },
          ],
        },
        {
          id: '2-2',
          code: '2.2',
          title: { en: 'Graphing Linear Equations', ar: 'تمثيل المعادلات الخطية' },
          topics: [
            { en: 'Slope–intercept form', ar: 'صيغة الميل والمقطع' },
            { en: 'Intercepts and tables', ar: 'المقاطع والجداول' },
            { en: 'Graphing from an equation', ar: 'الرسم من المعادلة' },
          ],
        },
        {
          id: '2-3',
          code: '2.3',
          title: { en: 'Writing Linear Equations', ar: 'كتابة المعادلات الخطية' },
          topics: [
            { en: 'Point–slope form', ar: 'صيغة النقطة والميل' },
            { en: 'From two points to an equation', ar: 'من نقطتين إلى معادلة' },
            { en: 'Modelling with lines', ar: 'النمذجة بالخطوط' },
          ],
        },
        {
          id: '2-4',
          code: '2.4',
          title: { en: 'Parallel and Perpendicular Lines', ar: 'الخطوط المتوازية والمتعامدة' },
          topics: [
            { en: 'Equal slopes', ar: 'تساوي الميلين' },
            { en: 'Negative reciprocal slopes', ar: 'الميلان المتعاكسان' },
            { en: 'Vertical and horizontal lines', ar: 'الخطوط الرأسية والأفقية' },
          ],
        },
        {
          id: '2-5',
          code: '2.5',
          title: { en: 'Linear Inequalities', ar: 'المتباينات الخطية' },
          topics: [
            { en: 'Solving inequalities', ar: 'حل المتباينات' },
            { en: 'Flipping the sign', ar: 'قلب إشارة المتباينة' },
            { en: 'Interval and graph notation', ar: 'تدوين الفترة والتمثيل' },
          ],
        },
      ],
    },
    {
      id: '3',
      title: { en: 'Chapter 3 · Systems and Functions', ar: 'الفصل ٣ · النظم والدوال' },
      lessons: [
        {
          id: '3-1',
          code: '3.1',
          title: { en: 'Systems of Equations by Graphing', ar: 'حل النظم بالتمثيل البياني' },
          topics: [
            { en: 'One solution, none, or infinitely many', ar: 'حل واحد أو لا حل أو عدد لا نهائي' },
            { en: 'The intersection as the solution', ar: 'نقطة التقاطع هي الحل' },
            { en: 'Estimating from a graph', ar: 'التقدير من التمثيل' },
          ],
        },
        {
          id: '3-2',
          code: '3.2',
          title: { en: 'Substitution and Elimination', ar: 'التعويض والحذف' },
          topics: [
            { en: 'Solving by substitution', ar: 'الحل بالتعويض' },
            { en: 'Solving by elimination', ar: 'الحل بالحذف' },
            { en: 'Choosing the easier method', ar: 'اختيار الطريقة الأسهل' },
          ],
        },
        {
          id: '3-3',
          code: '3.3',
          title: { en: 'Systems of Inequalities', ar: 'نظم المتباينات' },
          topics: [
            { en: 'Shading half-planes', ar: 'تظليل أنصاف المستويات' },
            { en: 'Solid and dashed boundaries', ar: 'الحدود الصلبة والمتقطعة' },
            { en: 'The feasible region', ar: 'المنطقة الممكنة' },
          ],
        },
        {
          id: '3-4',
          code: '3.4',
          title: { en: 'Functions and Function Notation', ar: 'الدوال وترميزها' },
          topics: [
            { en: 'Inputs, outputs and f(x)', ar: 'المدخلات والمخرجات و f(x)' },
            { en: 'Domain and range', ar: 'المجال والمدى' },
            { en: 'Graphs of functions', ar: 'التمثيل البياني للدوال' },
          ],
        },
      ],
    },
    {
      id: '4',
      title: { en: 'Chapter 4 · Exponents, Polynomials and Quadratics', ar: 'الفصل ٤ · الأسس وكثيرات الحدود والمعادلات التربيعية' },
      lessons: [
        {
          id: '4-1',
          code: '4.1',
          title: { en: 'Rules of Exponents', ar: 'قوانين الأسس' },
          topics: [
            { en: 'Product and quotient rules', ar: 'قاعدتا الضرب والقسمة' },
            { en: 'Power of a power', ar: 'قوة القوة' },
            { en: 'Zero and negative exponents', ar: 'الأس صفر والأسس السالبة' },
          ],
        },
        {
          id: '4-2',
          code: '4.2',
          title: { en: 'Polynomial Operations', ar: 'عمليات كثيرات الحدود' },
          topics: [
            { en: 'Adding and subtracting', ar: 'الجمع والطرح' },
            { en: 'Multiplying binomials', ar: 'ضرب ذات الحدين' },
            { en: 'Special products', ar: 'حالات الضرب الخاصة' },
          ],
        },
        {
          id: '4-3',
          code: '4.3',
          title: { en: 'Factoring Trinomials', ar: 'تحليل ثلاثيات الحدود' },
          topics: [
            { en: 'Greatest common factor', ar: 'العامل المشترك الأكبر' },
            { en: 'x² + bx + c', ar: 'x² + bx + c' },
            { en: 'Difference of squares', ar: 'فرق المربعين' },
          ],
        },
        {
          id: '4-4',
          code: '4.4',
          title: { en: 'Quadratic Equations', ar: 'المعادلات التربيعية' },
          topics: [
            { en: 'Roots and the graph', ar: 'الجذور والتمثيل البياني' },
            { en: 'Solving by factoring', ar: 'الحل بالتحليل' },
            { en: 'The vertex as a maximum or minimum', ar: 'الرأس كقيمة عظمى أو صغرى' },
          ],
        },
      ],
    },
    {
      id: '5',
      title: { en: 'Chapter 5 · Data and Modelling', ar: 'الفصل ٥ · البيانات والنمذجة' },
      lessons: [
        {
          id: '5-1',
          code: '5.1',
          title: { en: 'Scatter Plots and Lines of Fit', ar: 'المخططات المبعثرة وخطوط الملاءمة' },
          topics: [
            { en: 'Correlation and trend', ar: 'الارتباط والاتجاه' },
            { en: 'Drawing a line of fit', ar: 'رسم خط الملاءمة' },
            { en: 'Interpolation and extrapolation', ar: 'الاستدلال الداخلي والخارجي' },
          ],
        },
        {
          id: '5-2',
          code: '5.2',
          title: { en: 'Centre and Spread of Data', ar: 'التمركز والتشتت في البيانات' },
          topics: [
            { en: 'Mean, median and mode', ar: 'المتوسط والوسيط والمنوال' },
            { en: 'Range and outliers', ar: 'المدى والقيم الشاذة' },
            { en: 'Choosing a summary', ar: 'اختيار المقياس المناسب' },
          ],
        },
      ],
    },
  ],
};
