/**
 * GMAT practice · Data Insights topics.
 *
 * Two questions per topic. Data Sufficiency items keep the five official
 * answers, because the answer *is* the skill being tested.
 */
import type { Question } from '../questions';

const item = (slug: string, n: number, question: string, options: string[], correctIndex: number, hint: string, explanation: string): Question => ({
  id: `gmat/${slug}::q${n}`,
  question,
  options,
  correctIndex,
  hint,
  explanation,
});

const DS_OPTIONS = [
  'Statement (1) alone is sufficient',
  'Statement (2) alone is sufficient',
  'Both together are sufficient, but neither alone is',
  'Each statement alone is sufficient',
  'Even together the statements are not sufficient',
];

export const GMAT_DI_QUESTIONS: Question[] = [
  /* --------------------------------------------------------------- di-mixed */
  item('di-mixed', 1, 'A report gives sales in a chart and costs in a table. To find profit you must…', [
    'read the chart only',
    'read the table only',
    'combine a value from each source',
    'average the two sources',
  ], 2, 'Profit needs income and cost — one from each.', 'Mixed sets exist to make you join two sources.'),
  item('di-mixed', 2, 'A statement that is true about the data but does not answer the question is…', [
    'the best answer',
    'wrong',
    'acceptable if no other option fits',
    'true only in Data Insights',
  ], 1, 'Questions ask something specific.', 'True-but-unasked is a classic trap; only the asked claim counts.'),

  /* -------------------------------------------------------------- ds-algebra */
  item('ds-algebra', 1, 'Is $x > 0$?\n(1) $x^2 > 0$\n(2) $x^3 > 0$', DS_OPTIONS, 1, 'Try a negative number against (1).', '(1) allows −3, so it fails. (2) forces a positive number, so (2) alone works: B.'),
  item('ds-algebra', 2, 'What is the value of $x$?\n(1) $2x + 3 = 11$\n(2) $x^2 = 16$', DS_OPTIONS, 0, 'One equation, one unknown — or two answers?', '(1) gives x = 4 exactly. (2) gives ±4, two values, so it fails: A.'),

  /* -------------------------------------------------- ds-number-properties */
  item('ds-number-properties', 1, 'Is $n$ an integer?\n(1) $2n$ is an integer\n(2) $n/2$ is an integer', DS_OPTIONS, 1, 'Test n = 0.5 against (1).', '(1) allows 0.5 (2n = 1). (2) means n = 2k, an integer: B.'),
  item('ds-number-properties', 2, 'Is $n$ positive?\n(1) $n^2 = 9$\n(2) $n$ is an integer greater than $-5$', DS_OPTIONS, 4, 'A squared value hides the sign — try both signs.', '(1) allows −3 and 3, so it fails. (2) also allows both. Together n = ±3 still holds, so even combined they do not decide: E.'),

  /* ---------------------------------------------------------------- ds-yes-no */
  item('ds-yes-no', 1, 'Is $n$ even?\n(1) $n + 1$ is odd\n(2) $2n$ is even', DS_OPTIONS, 0, 'In (2), is that ever false?', '(1) forces n even, a definite yes. (2) is always true and settles nothing: A.'),
  item('ds-yes-no', 2, 'Is $x > y$?\n(1) $x - y > 0$\n(2) $x$ and $y$ are both positive', DS_OPTIONS, 0, '(1) is the question rewritten.', '(1) is exactly x > y. (2) says nothing about order: A.'),

  /* ----------------------------------------------------------- graphics-axes */
  item('graphics-axes', 1, 'A bar chart draws its axis from 100 to 120. A bar of 118 looks about ten times taller than a bar of 112, which is really…', [
    'ten times bigger',
    'about 5% bigger',
    'about 50% bigger',
    'the same size',
  ], 1, 'Compare the real values, not the drawn heights.', '118 vs 112 differ by about 5%; the cut axis exaggerates it.'),
  item('graphics-axes', 2, 'Before reading any number from a chart, check…', [
    'the colour of the bars',
    'the axis start value and the units',
    'the chart title only',
    'the number of gridlines',
  ], 1, 'Truncated axes and mixed units cause most chart errors.', 'Axis start plus units decides whether the comparison is fair.'),

  /* ------------------------------------------------------------ graphics-pie */
  item('graphics-pie', 1, 'A category is 25% of a pie chart. Its slice covers…', ['$25°$', '$45°$', '$90°$', '$180°$'], 2, 'A full circle is 360°.', '0.25 × 360 = 90°.'),
  item('graphics-pie', 2, 'Two pie charts show the same company in two years. Adding their matching slices is…', [
    'valid, slices are percentages',
    'invalid, the wholes may differ',
    'valid if both use the same colours',
    'valid only for four slices',
  ], 1, 'A pie compares parts of one whole.', '25% of a small total is not comparable to 25% of a large one without the totals.'),

  /* -------------------------------------------------------- graphics-scatter */
  item('graphics-scatter', 1, 'A scatterplot rises from left to right with one far outlier at the top left. The trend line will…', [
    'be unaffected',
    'flatten or even turn downwards',
    'always get steeper',
    'become vertical',
  ], 1, 'One extreme point pulls the fit line.', 'The outlier drags the line towards it, flattening or flipping the slope.'),
  item('graphics-scatter', 2, 'A strong trend line proves…', ['causation', 'a relationship worth predicting with', 'that the data are correct', 'nothing at all'], 1, 'Correlation is not causation.', 'It supports prediction within the data range, not cause.'),

  /* ------------------------------------------------------------ msr-conflicts */
  item('msr-conflicts', 1, 'Two sources disagree about a value. The next step is…', [
    'average them',
    'choose the longer text',
    'check which source the question asks you to use, or find a third that settles it',
    'ignore both',
  ], 2, 'The question usually names its source.', 'A conflict only matters relative to what is being asked.'),
  item('msr-conflicts', 2, 'A claim supported by exactly one of three sources is…', [
    'the answer, because it is unique',
    'not necessarily the answer',
    'false',
    'true by majority',
  ], 1, 'Uniqueness is not support.', 'Check what the question asks before treating a lone claim as established.'),

  /* ---------------------------------------------------- multi-source-reasoning */
  item('multi-source-reasoning', 1, 'Source A gives a total of 500 units; source B says 40% came from the east. East units are…', ['$40$', '$120$', '$200$', '$460$'], 2, 'Take 40% of 500.', '0.4 × 500 = 200.'),
  item('multi-source-reasoning', 2, 'Two tabs give the same quantity with different values. The most useful move is to…', [
    'pick the larger number',
    'look for a third statement that constrains which one can be right',
    'stop, the set is broken',
    'average them',
  ], 1, 'Sets are built so one constraint separates the versions.', 'A third fact usually eliminates one of the two versions.'),

  /* ----------------------------------------------------- multi-source-synthesis */
  item('multi-source-synthesis', 1, 'Budget 1.2 million split 35% / 40% / 25%. The largest share is…', ['$300{,}000$', '$420{,}000$', '$480{,}000$', '$600{,}000$'], 2, 'Largest percentage of the total.', '0.40 × 1.2M = 480,000.'),
  item('multi-source-synthesis', 2, 'When a question asks for a rounded answer, round…', [
    'each source before calculating',
    'once, at the end',
    'never',
    'downwards always',
  ], 1, 'Early rounding compounds.', 'Round the final result; intermediate rounding moves you off the answer list.'),

  /* ---------------------------------------------------------- table-derived */
  item('table-derived', 1, 'A table gives revenue and cost by month. Profit margin is…', [
    'a column in the table',
    'a ratio of two columns',
    'the sum of two columns',
    'the larger column',
  ], 1, 'Derived metrics are computed, not printed.', '(revenue − cost) ÷ revenue is a ratio of the table’s columns.'),
  item('table-derived', 2, 'A store sells 900 units in a 30-day month. Its derived daily rate is…', [
    '$20$',
    '$25$',
    '$30$',
    '$45$',
  ], 2, 'Divide the column by the days.', '900 ÷ 30 = 30 units per day.'),

  /* ------------------------------------------------------- two-part-analysis */
  item('two-part-analysis', 1, 'A pair of numbers must satisfy $x + y = 10$ and $x - y = 4$. The pair is…', ['$6$ and $4$', '$7$ and $3$', '$5$ and $5$', '$8$ and $2$'], 1, 'Add the two constraints.', '2x = 14 → x = 7, y = 3.'),
  item('two-part-analysis', 2, 'In a two-part question, an answer is correct when…', [
    'either column is right',
    'both columns are right at the same time',
    'the first column is right',
    'the options look symmetric',
  ], 1, 'The pair, not each cell, is the answer.', 'Both selections must hold simultaneously.'),

  /* ---------------------------------------------------- two-part-constraints */
  item('two-part-constraints', 1, 'Positive integers $x$ and $y$ satisfy $x + y = 9$ and $x > 6$. The number of possible pairs is…', ['$1$', '$2$', '$3$', '$4$'], 1, 'List x = 7, 8, 9…', 'x = 7 → y = 2; x = 8 → y = 1; x = 9 → y = 0 (not positive). So two pairs.'),
  item('two-part-constraints', 2, 'A constraint “at least 2 and fewer than 5 whole units” allows…', [
    '$2, 3, 4$',
    '$2, 3, 4, 5$',
    '$3, 4$',
    '$1, 2, 3, 4$',
  ], 0, '“Fewer than 5” excludes 5.', '2 ≤ n < 5 gives 2, 3, 4.'),

  /* -------------------------------------------------------- two-part-tables */
  item('two-part-tables', 1, 'A table’s row totals are 30 and 45, and one column total is 40. The other column total is…', ['$25$', '$35$', '$40$', '$75$'], 1, 'All cells add to the grand total.', '30 + 45 = 75 total; 75 − 40 = 35.'),
  item('two-part-tables', 2, 'A row reads: Jan 12, Feb 15, total 30. This row is…', [
    'consistent',
    'inconsistent',
    'missing the March value',
    'impossible to check',
  ], 1, 'Check the arithmetic of the totals.', '12 + 15 = 27, not 30 — one cell or the total is wrong.'),
];
