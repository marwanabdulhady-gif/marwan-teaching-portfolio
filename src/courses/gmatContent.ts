/**
 * What sits behind each GMAT topic tile: which lab draws it, the two ideas the
 * lab is meant to leave you with, and the rule worth keeping on screen.
 *
 * Every one of the 38 topics is covered — seventeen reuse a lab that already
 * exists in another course, ten have a lab built for the GMAT's own patterns
 * (percent bar, rate tank, Venn, number line, remainders, counting slots,
 * dot plot, truncated axis, two-part table, sufficiency verdict).
 */
import type { Bi } from '../teachingData';

export type GmatLabId =
  | 'percent'
  | 'rate'
  | 'sets'
  | 'numberline'
  | 'remainder'
  | 'counting'
  | 'stats'
  | 'chart'
  | 'table'
  | 'sufficiency'
  | 'exponents'
  | 'expressions'
  | 'factoring'
  | 'quadratics'
  | 'functions'
  | 'inequalities'
  | 'systems'
  | 'rational';

export interface GmatTopicContent {
  /** Two ideas the lab is built to leave you with. */
  ideas: Bi[];
  lab: GmatLabId;
  /** A rule or formula worth keeping on screen. */
  rule?: string;
}

export const GMAT_CONTENT: Record<string, GmatTopicContent> = {
  /* ------------------------------------------------------ quantitative */
  'absolute-value': {
    lab: 'numberline',
    rule: '|x − a| = distance from x to a',
    ideas: [
      {
        en: 'Absolute value is a distance, never a sign: |x − 3| < 2 means “within 2 of 3”.',
        ar: 'القيمة المطلقة مسافة لا إشارة: |x − 3| < 2 تعني «على بُعد أقل من ٢ من ٣».',
      },
      {
        en: 'Two-sided inequalities split into two ends of the number line; one-sided ones do not.',
        ar: 'المتباينات ذات الاتجاهين تنفصل إلى طرفين على خط الأعداد، أما أحادية الاتجاه فلا.',
      },
    ],
  },
  'algebraic-fractions': {
    lab: 'rational',
    rule: '(x + a)(x − a) / (x + b) simplifies only where the factor cancels',
    ideas: [
      {
        en: 'Factor first, cancel second. Cancelling across a sum (x + 3)/x → 3 is the classic trap.',
        ar: 'حلّل أولاً ثم اختصر. الاختزال عبر مجموع مثل (x + 3)/x ← ٣ هو الفخ الشائع.',
      },
      {
        en: 'A cancelled factor leaves a hole, not a point: the value stays undefined there.',
        ar: 'العامل المختزل يترك ثقباً لا نقطة: القيمة تبقى غير معرّفة عندها.',
      },
    ],
  },
  averages: {
    lab: 'stats',
    rule: 'weighted mean = Σ(value × weight) / Σ(weight)',
    ideas: [
      {
        en: 'A weighted mean sits closer to the heavier group — the bigger the weight, the harder it pulls.',
        ar: 'المتوسط المرجّح يقترب من المجموعة الأثقل وزناً، فكلما زاد الوزن زاد جذبه.',
      },
      {
        en: 'If every value rises by k, the mean rises by k; if every value doubles, the mean doubles.',
        ar: 'إذا زادت كل قيمة بمقدار k زاد المتوسط بمقدار k، وإذا تضاعفت كل قيمة تضاعف المتوسط.',
      },
    ],
  },
  counting: {
    lab: 'counting',
    rule: 'nPr = n!/(n − r)!   nCr = n!/(r!(n − r)!)',
    ideas: [
      {
        en: 'Multiply when the choices happen in sequence; divide by r! when order should not matter.',
        ar: 'اضرب عندما تأتي الاختيارات متتابعة، واقسم على r! عندما لا يهم الترتيب.',
      },
      {
        en: 'Draw the slots first. Writing “_ _ _” turns a word problem into arithmetic.',
        ar: 'ارسم الخانات أولاً. كتابة «_ _ _» تحوّل مسألة كلامية إلى حساب.',
      },
    ],
  },
  exponents: {
    lab: 'exponents',
    rule: 'aᵐ · aⁿ = aᵐ⁺ⁿ   (aᵐ)ⁿ = aᵐⁿ',
    ideas: [
      {
        en: 'Same base: add exponents when multiplying, subtract when dividing, multiply when powering.',
        ar: 'الأساس نفسه: اجمع الأسس عند الضرب، واطرحها عند القسمة، واضربها عند رفع قوة لقوة.',
      },
      {
        en: 'Different bases do not combine — rewrite them (9 = 3²) before you touch the exponents.',
        ar: 'الأسس المختلفة لا تُجمع؛ أعد كتابتها (9 = 3²) قبل التعامل مع الأسس.',
      },
    ],
  },
  expressions: {
    lab: 'expressions',
    rule: 'distribute before combining like terms',
    ideas: [
      {
        en: 'An expression has no equals sign, so “solving” it is the wrong move — simplify it.',
        ar: 'التعبير الجبري ليس فيه علامة يساوي، فالحل خطأ؛ المطلوب هو التبسيط.',
      },
      {
        en: 'The same expression evaluated twice must give the same number: substitute to check.',
        ar: 'التعبير نفسه عند تعويضه مرتين يعطي العدد نفسه: عوّض لتتحقق.',
      },
    ],
  },
  factoring: {
    lab: 'factoring',
    rule: 'x² + (p + q)x + pq = (x + p)(x + q)',
    ideas: [
      {
        en: 'Find two numbers that multiply to the constant and add to the middle coefficient.',
        ar: 'ابحث عن عددين حاصل ضربهما الحد الثابت ومجموعهما معامل الحد الأوسط.',
      },
      {
        en: 'Difference of squares factors on sight: a² − b² = (a − b)(a + b).',
        ar: 'فرق المربعين يُحلَّل بالنظر: a² − b² = (a − b)(a + b).',
      },
    ],
  },
  fractions: {
    lab: 'percent',
    rule: 'a/b < c/d ⇔ ad < bc (b, d > 0)',
    ideas: [
      {
        en: 'Fractions, decimals and percents are three names for one number — pick the easiest name.',
        ar: 'الكسور والأعداد العشرية والنسب المئوية ثلاثة أسماء لعدد واحد؛ اختر الأسهل.',
      },
      {
        en: 'Cross-multiplying compares two fractions without a common denominator.',
        ar: 'الضرب التبادلي يقارن كسرين دون توحيد المقام.',
      },
    ],
  },
  functions: {
    lab: 'functions',
    rule: 'f(g(x)): inside out',
    ideas: [
      {
        en: 'f(3) means “feed 3 in, take the output” — read the machine, not the graph.',
        ar: 'f(3) تعني «أدخل ٣ وخذ الناتج»؛ اقرأ الآلة لا الرسم.',
      },
      {
        en: 'Composition runs inside out: f(g(x)) does g first.',
        ar: 'التركيب يعمل من الداخل للخارج: f(g(x)) ينفّذ g أولاً.',
      },
    ],
  },
  inequalities: {
    lab: 'inequalities',
    rule: 'multiply or divide by a negative → flip the sign',
    ideas: [
      {
        en: 'Adding and subtracting never flip the sign; multiplying or dividing by a negative always does.',
        ar: 'الجمع والطرح لا يقلبان الإشارة أبداً، أما الضرب أو القسمة على سالب فيقلبانها دائماً.',
      },
      {
        en: 'Graph the boundary first, then decide which side survives a test point.',
        ar: 'ارسم الحد أولاً ثم حدّد الجهة التي تحققها نقطة اختبار.',
      },
    ],
  },
  integers: {
    lab: 'numberline',
    rule: 'factor × factor = number',
    ideas: [
      {
        en: 'Every factor comes in a pair, so factors are found up to the square root only.',
        ar: 'كل عامل يأتي مع نظيره، لذا يكفي البحث عن العوامل حتى الجذر التربيعي.',
      },
      {
        en: 'Multiples are infinite; factors are finite. Read the question twice for which one it wants.',
        ar: 'المضاعفات لا نهائية والعوامل محدودة؛ اقرأ السؤال مرتين لتعرف المطلوب.',
      },
    ],
  },
  mixtures: {
    lab: 'percent',
    rule: 'amount of solute = concentration × volume',
    ideas: [
      {
        en: 'Track the solute in grams, not the percentage: add the two amounts, divide by the new total.',
        ar: 'تابع كمية المادة المذابة بالجرامات لا النسبة: اجمع الكميتين واقسم على الحجم الجديد.',
      },
      {
        en: 'Diluting with pure water adds volume and zero solute — the concentration can only drop.',
        ar: 'التخفيف بالماء النقي يزيد الحجم ولا يضيف مذاباً، فالنسبة لا يمكن إلا أن تنخفض.',
      },
    ],
  },
  'number-line': {
    lab: 'numberline',
    rule: 'midpoint = (a + b)/2, distance = |a − b|',
    ideas: [
      {
        en: 'A point between two others sits at a weighted average of them.',
        ar: 'النقطة الواقعة بين نقطتين تقع عند متوسط مرجّح لهما.',
      },
      {
        en: 'Intervals are counted by their ends: (2, 5] holds 3 integers, [2, 5] holds 4.',
        ar: 'الفترات تُعدّ بأطرافها: (2, 5] تحوي ٣ أعداد صحيحة و[2, 5] تحوي ٤.',
      },
    ],
  },
  'overlapping-sets': {
    lab: 'sets',
    rule: '|A ∪ B| = |A| + |B| − |A ∩ B|',
    ideas: [
      {
        en: 'The union is never the sum: the overlap gets counted twice and must be removed once.',
        ar: 'الاتحاد ليس المجموع: التقاطع يُعدّ مرتين فيجب طرحه مرة.',
      },
      {
        en: 'Neither = total − union. That complement is where most two-set questions hide.',
        ar: 'خارج المجموعتين = المجموع − الاتحاد، وهذا المكمّل حيث تختبئ معظم أسئلة المجموعتين.',
      },
    ],
  },
  parity: {
    lab: 'numberline',
    rule: 'even ± even = even, odd × odd = odd',
    ideas: [
      {
        en: 'Only parity survives arithmetic: choose an odd and an even test number and you are done.',
        ar: 'الزوجية وحدها تصمد للحساب: اختر عدداً زوجياً وآخر فردياً وانتهِ.',
      },
      {
        en: 'Consecutive integers differ by 1, so exactly one of any two consecutive numbers is even.',
        ar: 'الأعداد المتتالية تختلف بمقدار ١، فأحد أي عددين متتاليين زوجي بالضرورة.',
      },
    ],
  },
  'percent-fundamentals': {
    lab: 'percent',
    rule: 'new = old × (1 + p/100)',
    ideas: [
      {
        en: '“Percent of” multiplies; “percent more/less” multiplies by a factor above or below 1.',
        ar: '«نسبة من» تعني الضرب، و«زيادة أو نقصان بنسبة» تعني الضرب في معامل أكبر أو أصغر من ١.',
      },
      {
        en: 'A 20% rise does not undo a 20% fall: 100 → 120 → 96.',
        ar: 'ارتفاع ٢٠٪ لا يلغي انخفاض ٢٠٪: 100 ← 120 ← 96.',
      },
    ],
  },
  probability: {
    lab: 'sets',
    rule: 'P(A or B) = P(A) + P(B) − P(A and B)',
    ideas: [
      {
        en: 'Probability is a ratio of counts: favourable outcomes over all equally likely outcomes.',
        ar: 'الاحتمال نسبة بين عددين: الحالات المواتية على مجموع الحالات المتساوية الاحتمال.',
      },
      {
        en: '“At least one” is easiest as 1 − P(none); “and” multiplies, “or” adds one overlap back.',
        ar: '«واحد على الأقل» أسهل بحساب 1 − احتمال لا شيء، و«و» ضرب و«أو» جمع مع طرح التقاطع.',
      },
    ],
  },
  quadratics: {
    lab: 'quadratics',
    rule: 'roots at x = −b/2a ± √(b² − 4ac)/2a',
    ideas: [
      {
        en: 'The vertex sits at x = −b/2a; the roots are symmetric about it.',
        ar: 'قمة القطع المكافئ عند x = −b/2a والجذور متماثلة حولها.',
      },
      {
        en: 'The discriminant decides the story: positive two roots, zero one, negative none real.',
        ar: 'المميّز يحدد الحالة: موجب جذران، صفر جذر واحد، سالب لا جذور حقيقية.',
      },
    ],
  },
  'rates-work': {
    lab: 'rate',
    rule: '1/t = 1/a + 1/b',
    ideas: [
      {
        en: 'Add rates, never times. Two workers take less time than either alone, but never half the time.',
        ar: 'اجمع المعدلات لا الأزمنة. عاملان يستغرقان أقل من كل منهما منفرداً، لكن ليس نصف الزمن.',
      },
      {
        en: 'Let the job be 1: the fraction finished in an hour is 1/t.',
        ar: 'اجعل العمل ١: الجزء المنجز في ساعة هو 1/t.',
      },
    ],
  },
  remainders: {
    lab: 'remainder',
    rule: 'n = qm + r, 0 ≤ r < m',
    ideas: [
      {
        en: 'A remainder version of equals still works: 17 ≡ 2 (mod 5) can be added and multiplied.',
        ar: 'البواقي تُجمع وتُضرب كالأعداد: 17 ≡ 2 (mod 5).',
      },
      {
        en: 'Units digits cycle: powers of 7 end 7, 9, 3, 1 and repeat every four.',
        ar: 'أرقام الآحاد تدور: قوى ٧ تنتهي ٧، ٩، ٣، ١ وتتكرر كل أربع.',
      },
    ],
  },
  sequences: {
    lab: 'remainder',
    rule: 'arithmetic: aₙ = a₁ + (n − 1)d',
    ideas: [
      {
        en: 'Write the first four terms. Patterns are far easier to see than to derive.',
        ar: 'اكتب الحدود الأربعة الأولى؛ رؤية النمط أسهل بكثير من استنتاجه.',
      },
      {
        en: 'Arithmetic sequences add a constant, geometric ones multiply by one.',
        ar: 'المتتالية الحسابية تضيف ثابتاً، والهندسية تضرب في ثابت.',
      },
    ],
  },
  statistics: {
    lab: 'stats',
    rule: 'median = middle value after sorting',
    ideas: [
      {
        en: 'The mean is dragged by one outlier; the median is not. That is the whole comparison.',
        ar: 'المتوسط يتأثر بقيمة شاذة واحدة أما الوسيط فلا، وهذا جوهر المقارنة.',
      },
      {
        en: 'Range is a spread of two numbers; the other values do not matter at all.',
        ar: 'المدى يعتمد على عددين فقط؛ بقية القيم لا تؤثر إطلاقاً.',
      },
    ],
  },
  systems: {
    lab: 'systems',
    rule: 'no solution ⇔ same slope, different intercept',
    ideas: [
      {
        en: 'One intersection means one solution. Parallel means none; the same line means infinitely many.',
        ar: 'تقاطع واحد يعني حلاً واحداً، والتوازي يعني لا حل، وتطابق الخطين يعني حلولاً لا نهائية.',
      },
      {
        en: 'Eliminate by matching coefficients, then subtract; substitution wins when a coefficient is 1.',
        ar: 'احذف متغيراً بتوحيد المعاملين ثم اطرح، والتعويض أفضل عندما يكون أحد المعاملين ١.',
      },
    ],
  },
  'word-problems': {
    lab: 'rate',
    rule: 'distance = rate × time',
    ideas: [
      {
        en: 'Name the unknown first, then write one equation per sentence — that is the whole method.',
        ar: 'سمِّ المجهول أولاً ثم اكتب معادلة لكل جملة؛ هذه هي الطريقة كاملة.',
      },
      {
        en: 'Ages advance together: in k years every age grows by k.',
        ar: 'الأعمار تتقدم معاً: بعد k سنة يزداد كل عمر بمقدار k.',
      },
    ],
  },

  /* ---------------------------------------------------- data insights */
  'di-mixed': {
    lab: 'table',
    rule: 'read the column header before the numbers',
    ideas: [
      {
        en: 'Mixed sets ask you to switch tools twice: one graph, one table, one conclusion.',
        ar: 'المجموعات المختلطة تطلب تبديل الأدوات مرتين: رسم وجدول واستنتاج واحد.',
      },
      {
        en: 'Answer only what the prompt asks; a true statement about the data is still wrong if unasked.',
        ar: 'أجب عما يطلبه السؤال فقط؛ العبارة الصحيحة عن البيانات تبقى خطأ إن لم تُطلب.',
      },
    ],
  },
  'ds-algebra': {
    lab: 'sufficiency',
    rule: 'sufficient = exactly one answer, not “an answer”',
    ideas: [
      {
        en: 'You never solve for the value; you decide whether the value is forced.',
        ar: 'لا تحسب القيمة؛ بل قرر هل هي مُلزَمة أم لا.',
      },
      {
        en: 'Test the edge cases first: zero, negative, fraction. If one survives twice, the statement fails.',
        ar: 'اختبر الحالات الحدّية أولاً: الصفر والسالب والكسر؛ إن نجحت حالتان مختلفتان فالشرط غير كافٍ.',
      },
    ],
  },
  'ds-number-properties': {
    lab: 'sufficiency',
    rule: 'integer? positive? ≠ 0?',
    ideas: [
      {
        en: 'A statement that allows a non-integer has not pinned down an integer question.',
        ar: 'الشرط الذي يسمح بعدد غير صحيح لا يحسم سؤالاً عن الأعداد الصحيحة.',
      },
      {
        en: 'Two statements are facts to combine only *after* testing each alone.',
        ar: 'الشرطان يُجمعان فقط بعد اختبار كل منهما منفرداً.',
      },
    ],
  },
  'ds-yes-no': {
    lab: 'sufficiency',
    rule: 'a definite “no” is still sufficient',
    ideas: [
      {
        en: 'For yes/no questions, a guaranteed no answers the question just as well as a yes.',
        ar: 'في أسئلة نعم/لا، الجواب «لا» المؤكد يكفي تماماً كـ«نعم».',
      },
      {
        en: 'You need a single verdict. A statement that sometimes says yes and sometimes no is useless.',
        ar: 'تحتاج حكماً واحداً؛ الشرط الذي يجيب أحياناً بنعم وأحياناً بلا لا قيمة له.',
      },
    ],
  },
  'graphics-axes': {
    lab: 'chart',
    rule: 'slope = rise / run on the drawn scale',
    ideas: [
      {
        en: 'Check where the axis starts. A truncated axis makes small changes look dramatic.',
        ar: 'تحقق من بداية المحور؛ المحور المقتطع يجعل التغيرات الصغيرة تبدو هائلة.',
      },
      {
        en: 'Read the units twice: thousands versus millions is the most common misread.',
        ar: 'اقرأ الوحدات مرتين؛ الخلط بين الآلاف والملايين هو أشهر خطأ قراءة.',
      },
    ],
  },
  'graphics-pie': {
    lab: 'chart',
    rule: 'angle = share × 360°',
    ideas: [
      {
        en: 'A pie shows shares of one whole; it can never compare two different totals.',
        ar: 'القطاع الدائري يبيّن أنصبة من كل واحد، ولا يقارن مجموعين مختلفين أبداً.',
      },
      {
        en: 'Stacked bars add up, pies do not: a category in two pies is two different wholes.',
        ar: 'الأعمدة المكدّسة تُجمع أما القطاعات فلا؛ الفئة في قطاعين تنتمي إلى كلين مختلفين.',
      },
    ],
  },
  'graphics-scatter': {
    lab: 'chart',
    rule: 'correlation ≠ causation',
    ideas: [
      {
        en: 'A trend line predicts, it does not prove. Look for the spread around it.',
        ar: 'خط الاتجاه يتوقع ولا يثبت؛ انظر إلى التشتت حوله.',
      },
      {
        en: 'One far outlier flips both the trend and the correlation sign.',
        ar: 'قيمة شاذة بعيدة تقلب الاتجاه وإشارة الارتباط معاً.',
      },
    ],
  },
  'msr-conflicts': {
    lab: 'table',
    rule: 'a conflict is a pair of statements that cannot both hold',
    ideas: [
      {
        en: 'Sort the sources by claim, not by tab: two documents often agree while a third disagrees.',
        ar: 'رتّب المصادر حسب الادعاء لا حسب التبويب؛ وثيقتان كثيراً ما تتفقان وتخالفهما ثالثة.',
      },
      {
        en: 'When sources conflict, the question usually asks which one the evidence supports — cite it.',
        ar: 'عند تعارض المصادر يسأل السؤال عادة أيّها يدعمه الدليل؛ استشهد به.',
      },
    ],
  },
  'multi-source-reasoning': {
    lab: 'table',
    rule: 'find the cell that only one source fills',
    ideas: [
      {
        en: 'Build a two-row grid: what each tab states about the same quantity.',
        ar: 'ابنِ شبكة بصفين: ما يذكره كل تبويب عن الكمية نفسها.',
      },
      {
        en: 'The answer is usually the intersection of two constraints, not either one alone.',
        ar: 'الجواب عادة تقاطع شرطين لا أحدهما منفرداً.',
      },
    ],
  },
  'multi-source-synthesis': {
    lab: 'table',
    rule: 'combine, then round once',
    ideas: [
      {
        en: 'Synthesise with arithmetic, not prose: one equation per source.',
        ar: 'ركّب بالحساب لا بالكلام: معادلة واحدة لكل مصدر.',
      },
      {
        en: 'Round at the end. Rounding each source first is how the answer lands off-list.',
        ar: 'قرّب في النهاية؛ تقريب كل مصدر أولاً هو سبب خروج الجواب عن الخيارات.',
      },
    ],
  },
  'table-derived': {
    lab: 'table',
    rule: 'derived = the ratio a column does not show',
    ideas: [
      {
        en: 'Derived metrics are ratios of two columns — compute them before reading the answer choices.',
        ar: 'المقاييس المشتقة نسب بين عمودين؛ احسبها قبل قراءة الخيارات.',
      },
      {
        en: 'Sort by the derived column, not the raw one: the biggest total is rarely the best rate.',
        ar: 'رتّب حسب العمود المشتق لا الأصلي؛ أكبر مجموع نادراً ما يكون أفضل معدل.',
      },
    ],
  },
  'two-part-analysis': {
    lab: 'table',
    rule: 'two unknowns need two constraints',
    ideas: [
      {
        en: 'Both columns must be satisfied at once: test candidate pairs, not each column alone.',
        ar: 'يجب تحقق العمودين معاً؛ اختبر الأزواج لا كل عمود منفرداً.',
      },
      {
        en: 'When the algebra stalls, the answer table is a legitimate search space — 5 × 5 is small.',
        ar: 'عندما يتعطل الحل الجبري يصبح جدول الخيارات فضاء بحث مشروعاً؛ ٥ × ٥ صغير.',
      },
    ],
  },
  'two-part-constraints': {
    lab: 'table',
    rule: 'integer + inequality = short candidate list',
    ideas: [
      {
        en: 'Round the constraint to integers first, then test the few survivors.',
        ar: 'اضبط الشرط على الأعداد الصحيحة أولاً ثم اختبر القليل الباقي.',
      },
      {
        en: 'A constraint like x + y = 10 is a line; the second constraint cuts it to a point.',
        ar: 'شرط مثل x + y = 10 خط مستقيم، والشرط الثاني يقطعه إلى نقطة.',
      },
    ],
  },
  'two-part-tables': {
    lab: 'table',
    rule: 'row total = sum of its cells',
    ideas: [
      {
        en: 'Total rows and total columns are free information — use them to fill the missing cell.',
        ar: 'صفوف وأعمدة المجاميع معلومات مجانية؛ استخدمها لملء الخانة الناقصة.',
      },
      {
        en: 'Check that your two picks add to the stated total before you commit.',
        ar: 'تحقق أن اختياريك يجمعان إلى المجموع المذكور قبل التأكيد.',
      },
    ],
  },
};

/** Topics that have a lab, in syllabus order (all 38). */
export const GMAT_LAB_COUNT = Object.keys(GMAT_CONTENT).length;
