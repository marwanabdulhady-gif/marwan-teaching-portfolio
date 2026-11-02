import type { AuthoredCourse } from './authored.algebra1';

export const GEOMETRY: AuthoredCourse = {
  id: 'geometry',
  slug: 'geometry',
  title: { en: 'Geometry', ar: 'الهندسة' },
  short: { en: 'Geometry', ar: 'الهندسة' },
  grade: { en: 'Grade 10', ar: 'الصف ١٠' },
  chapters: [
    {
      id: '1',
      title: { en: 'Chapter 1 · Foundations', ar: 'الفصل ١ · الأساسيات' },
      lessons: [
        {
          id: '1-1',
          code: '1.1',
          title: { en: 'Points, Lines and Planes', ar: 'النقاط والخطوط والمستويات' },
          topics: [
            { en: 'Naming points, lines, rays and segments', ar: 'تسمية النقاط والخطوط والأشعة والقطع' },
            { en: 'Betweenness and the segment addition postulate', ar: 'الوقوع بين نقطتين ومسلمة جمع القطع' },
            { en: 'Intersections', ar: 'التقاطعات' },
          ],
        },
        {
          id: '1-2',
          code: '1.2',
          title: { en: 'Angle Pairs and Measures', ar: 'أزواج الزوايا وقياساتها' },
          topics: [
            { en: 'Complementary and supplementary', ar: 'المتتامة والمتكاملة' },
            { en: 'Vertical angles and linear pairs', ar: 'الزوايا المتقابلة والأزواج الخطية' },
            { en: 'Transversals and parallel lines', ar: 'القاطعة والخطوط المتوازية' },
          ],
        },
        {
          id: '1-3',
          code: '1.3',
          title: { en: 'Distance and Midpoint', ar: 'المسافة ونقطة المنتصف' },
          topics: [
            { en: 'The distance formula', ar: 'قانون المسافة' },
            { en: 'The midpoint formula', ar: 'قانون نقطة المنتصف' },
            { en: 'Partitioning a segment', ar: 'تجزئة قطعة مستقيمة' },
          ],
        },
        {
          id: '1-4',
          code: '1.4',
          title: { en: 'Transformations in the Plane', ar: 'التحويلات في المستوى' },
          topics: [
            { en: 'Translations, rotations and reflections', ar: 'الانسحاب والدوران والانعكاس' },
            { en: 'Preserving distance and angle', ar: 'الحفاظ على المسافة والزاوية' },
            { en: 'Compositions and symmetry', ar: 'تركيب التحويلات والتماثل' },
          ],
        },
      ],
    },
    {
      id: '2',
      title: { en: 'Chapter 2 · Triangles', ar: 'الفصل ٢ · المثلثات' },
      lessons: [
        {
          id: '2-1',
          code: '2.1',
          title: { en: 'Triangle Angle Sum and Exterior Angles', ar: 'مجموع زوايا المثلث والزوايا الخارجية' },
          topics: [
            { en: 'Angles of a triangle sum to 180°', ar: 'مجموع زوايا المثلث ١٨٠°' },
            { en: 'The exterior angle theorem', ar: 'مبرهنة الزاوية الخارجية' },
            { en: 'Isosceles triangles', ar: 'المثلثات المتساوية الساقين' },
          ],
        },
        {
          id: '2-2',
          code: '2.2',
          title: { en: 'Congruent Triangles', ar: 'تطابق المثلثات' },
          topics: [
            { en: 'SSS, SAS, ASA and AAS', ar: 'SSS و SAS و ASA و AAS' },
            { en: 'CPCTC', ar: 'التناظر في الأجزاء المتقابلة' },
            { en: 'Why SSA is not enough', ar: 'لماذا لا تكفي SSA' },
          ],
        },
        {
          id: '2-3',
          code: '2.3',
          title: { en: 'Similarity and Proportions', ar: 'التشابه والتناسب' },
          topics: [
            { en: 'AA, SSS and SAS similarity', ar: 'التشابه AA و SSS و SAS' },
            { en: 'Scale factor and perimeter ratio', ar: 'معامل التكبير ونسبة المحيط' },
            { en: 'Area ratio is the square', ar: 'نسبة المساحة هي المربع' },
          ],
        },
        {
          id: '2-4',
          code: '2.4',
          title: { en: 'The Pythagorean Theorem', ar: 'مبرهنة فيثاغورس' },
          topics: [
            { en: 'Legs, hypotenuse and squares', ar: 'الساقان والوتر والمربعات' },
            { en: 'Converse and triples', ar: 'العكس والثلاثيات' },
            { en: '45-45-90 and 30-60-90', ar: '٤٥-٤٥-٩٠ و ٣٠-٦٠-٩٠' },
          ],
        },
        {
          id: '2-5',
          code: '2.5',
          title: { en: 'Right-Triangle Trigonometry', ar: 'حساب المثلثات للمثلث القائم' },
          topics: [
            { en: 'Sine, cosine and tangent', ar: 'الجيب وجيب التمام والظل' },
            { en: 'Solving for a side or an angle', ar: 'إيجاد ضلع أو زاوية' },
            { en: 'Angles of elevation and depression', ar: 'زوايا الارتفاع والانخفاض' },
          ],
        },
      ],
    },
    {
      id: '3',
      title: { en: 'Chapter 3 · Circles, Area and Volume', ar: 'الفصل ٣ · الدوائر والمساحة والحجم' },
      lessons: [
        {
          id: '3-1',
          code: '3.1',
          title: { en: 'Arcs, Chords and Inscribed Angles', ar: 'الأقواس والأوتار والزوايا المحيطية' },
          topics: [
            { en: 'Central angles and arcs', ar: 'الزوايا المركزية والأقواس' },
            { en: 'The inscribed angle theorem', ar: 'مبرهنة الزاوية المحيطية' },
            { en: 'Chords and perpendicular bisectors', ar: 'الأوتار والأعمدة المنصفة' },
          ],
        },
        {
          id: '3-2',
          code: '3.2',
          title: { en: 'Area and Perimeter', ar: 'المساحة والمحيط' },
          topics: [
            { en: 'Rectangles, triangles and parallelograms', ar: 'المستطيلات والمثلثات ومتوازيات الأضلاع' },
            { en: 'Trapezoids and composite figures', ar: 'شبه المنحرف والأشكال المركبة' },
            { en: 'Regular polygons', ar: 'المضلعات المنتظمة' },
          ],
        },
        {
          id: '3-3',
          code: '3.3',
          title: { en: 'Sectors and Arc Length', ar: 'القطاعات وطول القوس' },
          topics: [
            { en: 'Arc length from the central angle', ar: 'طول القوس من الزاوية المركزية' },
            { en: 'Area of a sector', ar: 'مساحة القطاع' },
            { en: 'Radians', ar: 'الراديان' },
          ],
        },
        {
          id: '3-4',
          code: '3.4',
          title: { en: 'Surface Area and Volume of Solids', ar: 'المساحة السطحية والحجم للمجسمات' },
          topics: [
            { en: 'Prisms and cylinders', ar: 'الموشورات والأسطوانات' },
            { en: 'Pyramids and cones', ar: 'الأهرامات والمخاريط' },
            { en: 'Spheres', ar: 'الكرات' },
          ],
        },
      ],
    },
    {
      id: '4',
      title: { en: 'Chapter 4 · Coordinates and Probability', ar: 'الفصل ٤ · الإحداثيات والاحتمال' },
      lessons: [
        {
          id: '4-1',
          code: '4.1',
          title: { en: 'Equations of Circles', ar: 'معادلات الدوائر' },
          topics: [
            { en: 'Standard form', ar: 'الصيغة القياسية' },
            { en: 'Completing the square', ar: 'إكمال المربع' },
            { en: 'Tangent lines to a circle', ar: 'المماسات للدائرة' },
          ],
        },
        {
          id: '4-2',
          code: '4.2',
          title: { en: 'Coordinate Proof and Slope Criteria', ar: 'البرهان الإحداثي ومعايير الميل' },
          topics: [
            { en: 'Midsegments and diagonals', ar: 'القطع المتوسطة والأقطار' },
            { en: 'Parallel and perpendicular criteria', ar: 'معايير التوازي والتعامد' },
            { en: 'Classifying quadrilaterals', ar: 'تصنيف الرباعيات' },
          ],
        },
        {
          id: '4-3',
          code: '4.3',
          title: { en: 'Geometric Probability', ar: 'الاحتمال الهندسي' },
          topics: [
            { en: 'Favourable area over total area', ar: 'المساحة الملائمة على المساحة الكلية' },
            { en: 'Targets and dartboards', ar: 'الأهداف ولوحات السهام' },
            { en: 'Estimating π by simulation', ar: 'تقدير π بالمحاكاة' },
          ],
        },
      ],
    },
  ],
};
