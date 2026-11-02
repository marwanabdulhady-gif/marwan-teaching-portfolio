/**
 * GMAT practice · quantitative topics.
 *
 * Two questions per topic, ids `gmat/<slug>::q<1|2>`. Same shape as the authored
 * course bank (`src/courses/data/authoredQuestions.ts`), so `questions.ts` can
 * merge them and `PracticeMini` needs no special case. Written short on purpose:
 * a GMAT question should be readable at first glance.
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

export const GMAT_QUANT_QUESTIONS: Question[] = [
  /* ---------------------------------------------------- absolute-value */
  item('absolute-value', 1, 'If $|x - 5| = 3$, which values can $x$ take?', ['$2$ and $8$', '$-2$ and $8$', '$-2$ and $-8$', '$8$ only'], 0, 'Distance 3 from 5, in both directions.', '5 − 3 = 2 and 5 + 3 = 8.'),
  item('absolute-value', 2, 'Which inequality says “$x$ is within 4 of 10”?', ['$|x - 10| \\le 4$', '$|x + 10| \\le 4$', '$|x - 4| \\le 10$', '$x - 10 \\le 4$'], 0, '“Within 4 of 10” is a distance sentence.', '|x − 10| ≤ 4, i.e. 6 ≤ x ≤ 14.'),

  /* ------------------------------------------------ algebraic-fractions */
  item('algebraic-fractions', 1, 'For $x \\ne 3$, $\\dfrac{x^2 - 9}{x - 3}$ equals…', ['$x + 3$', '$x - 3$', '$x^2 - 3$', '$3$'], 0, 'Factor the top as a difference of squares.', 'x² − 9 = (x − 3)(x + 3), so the expression is x + 3.'),
  item('algebraic-fractions', 2, 'Cancelling $x$ in $\\dfrac{x + 3}{x}$ gives…', ['$3$', '$1 + \\dfrac{3}{x}$', '$\\dfrac{3}{x}$', 'nothing may be cancelled'], 1, 'A sum in the numerator does not cancel term by term.', 'Split instead: (x + 3)/x = 1 + 3/x. Cancelling would wrongly give 1 + 3 = 4.'),

  /* ------------------------------------------------------------- averages */
  item('averages', 1, 'Three numbers have a mean of 12. Two of them are 10 and 15. The third is…', ['$9$', '$11$', '$12$', '$36$'], 1, 'The total of three numbers with mean 12 is 36.', '36 − 10 − 15 = 11.'),
  item('averages', 2, '20 students average 70 and 30 students average 80. The combined mean is…', ['$74$', '$75$', '$76$', '$78$'], 2, 'Weight each mean by its group size.', '(20·70 + 30·80) ÷ 50 = (1400 + 2400) ÷ 50 = 76.'),

  /* ------------------------------------------------------------- counting */
  item('counting', 1, 'How many ways are there to choose 2 students from 5?', ['$10$', '$20$', '$25$', '$120$'], 0, 'Order does not matter, so divide by 2!.', '5·4 ÷ 2 = 10.'),
  item('counting', 2, 'How many ways can 4 different books sit in a row?', ['$4$', '$12$', '$16$', '$24$'], 3, 'Four slots, each with one fewer choice.', '4·3·2·1 = 24.'),

  /* ------------------------------------------------------------ exponents */
  item('exponents', 1, '$2^3 \\cdot 2^4$ equals…', ['$2^7$', '$2^{12}$', '$4^7$', '$2^{1}$'], 0, 'Same base: add the exponents.', '2³⁺⁴ = 2⁷ = 128.'),
  item('exponents', 2, '$\\left(3^2\\right)^3$ equals…', ['$3^5$', '$3^6$', '$9^6$', '$3^9$'], 1, 'Power of a power multiplies the exponents.', '3^(2·3) = 3⁶ = 729.'),

  /* ---------------------------------------------------------- expressions */
  item('expressions', 1, 'If $x = 2$, the value of $3(2x - 4) + 5$ is…', ['$5$', '$7$', '$11$', '$-1$'], 0, 'Brackets first, then multiply, then add.', '3(4 − 4) + 5 = 0 + 5 = 5.'),
  item('expressions', 2, '$4x + 3 - 2x + 7$ simplifies to…', ['$2x + 10$', '$6x + 10$', '$2x + 4$', '$2x - 4$'], 0, 'Collect the x terms and the constants separately.', '4x − 2x = 2x and 3 + 7 = 10.'),

  /* ------------------------------------------------------------ factoring */
  item('factoring', 1, '$x^2 + 7x + 12$ factors as…', ['$(x + 3)(x + 4)$', '$(x + 2)(x + 6)$', '$(x - 3)(x - 4)$', '$(x + 12)(x + 1)$'], 0, 'Two numbers that multiply to 12 and add to 7.', '3 and 4: 3·4 = 12, 3 + 4 = 7.'),
  item('factoring', 2, '$x^2 - 16$ factors as…', ['$(x - 4)^2$', '$(x - 4)(x + 4)$', '$(x - 8)(x + 2)$', '$(x + 16)(x - 1)$'], 1, 'Difference of two squares.', 'a² − b² = (a − b)(a + b) with b = 4.'),

  /* ------------------------------------------------------------ fractions */
  item('fractions', 1, '$\\dfrac{3}{4}$ written as a percent is…', ['$34\\%$', '$43\\%$', '$75\\%$', '$80\\%$'], 2, 'Multiply by 100.', '3 ÷ 4 = 0.75 = 75%.'),
  item('fractions', 2, 'Which is largest: $\\frac{2}{3}$, $\\frac{3}{5}$, $\\frac{5}{8}$, $\\frac{7}{12}$?', ['$\\frac{2}{3}$', '$\\frac{3}{5}$', '$\\frac{5}{8}$', '$\\frac{7}{12}$'], 0, 'Compare as decimals, or cross-multiply.', '0.667, 0.600, 0.625, 0.583 — the largest is 2/3.'),

  /* ------------------------------------------------------------ functions */
  item('functions', 1, 'If $f(x) = 2x + 3$, then $f(f(1))$ equals…', ['$5$', '$8$', '$10$', '$13$'], 3, 'Work inside out: find f(1) first.', 'f(1) = 5, then f(5) = 13.'),
  item('functions', 2, 'If $g(x) = x^2 - 1$, then $g(-3)$ equals…', ['$-10$', '$-4$', '$8$', '$10$'], 2, 'Square first, then subtract.', '(−3)² − 1 = 9 − 1 = 8.'),

  /* --------------------------------------------------------- inequalities */
  item('inequalities', 1, 'Solving $-2x > 6$ gives…', ['$x > -3$', '$x < -3$', '$x > 3$', '$x < 3$'], 1, 'Dividing by a negative flips the sign.', 'Divide by −2 and flip: x < −3.'),
  item('inequalities', 2, 'Solving $3x - 4 \\le 8$ gives…', ['$x \\le 4$', '$x \\ge 4$', '$x \\le 12$', '$x \\le \\frac{4}{3}$'], 0, 'Add 4 to both sides, then divide by 3.', '3x ≤ 12, so x ≤ 4.'),

  /* ------------------------------------------------------------- integers */
  item('integers', 1, 'How many positive divisors does 36 have?', ['$6$', '$8$', '$9$', '$12$'], 2, 'List pairs up to the square root and double, minus the square root itself.', '1, 2, 3, 4, 6, 9, 12, 18, 36 — nine divisors.'),
  item('integers', 2, 'The least common multiple of 6 and 8 is…', ['$14$', '$24$', '$48$', '$2$'], 1, 'Multiples of 8: 8, 16, 24 — which is also a multiple of 6?', '24 is the first common multiple.'),

  /* ------------------------------------------------------------- mixtures */
  item('mixtures', 1, '4 litres of a 40% solution are diluted with 1 litre of water. The new strength is…', ['$30\\%$', '$32\\%$', '$35\\%$', '$40\\%$'], 1, 'The solute in litres does not change; the volume does.', 'Solute 1.6 L, volume 5 L → 32%.'),
  item('mixtures', 2, '2 L of 50% mixed with 2 L of 20% gives…', ['$30\\%$', '$35\\%$', '$40\\%$', '$70\\%$'], 1, 'Add the solute, add the volume, divide.', '(1.0 + 0.4) ÷ 4 = 35%.'),

  /* ----------------------------------------------------------- number-line */
  item('number-line', 1, 'The midpoint of $-6$ and $4$ is…', ['$-2$', '$-1$', '$1$', '$2$'], 1, 'Average the two endpoints.', '(−6 + 4) ÷ 2 = −1.'),
  item('number-line', 2, 'The distance between $-7$ and $5$ on the number line is…', ['$2$', '$6$', '$12$', '$35$'], 2, 'Distance is the absolute difference.', '|−7 − 5| = 12.'),

  /* ------------------------------------------------------ overlapping-sets */
  item('overlapping-sets', 1, 'Of 30 students, 18 take French, 15 take Spanish and 8 take both. How many take neither?', ['$3$', '$5$', '$7$', '$25$'], 1, 'Union first, then subtract from the total.', '18 + 15 − 8 = 25 take at least one, so 5 take neither.'),
  item('overlapping-sets', 2, 'If $|A| = 20$, $|B| = 14$ and $|A \\cap B| = 6$, then $|A \\cup B|$ is…', ['$26$', '$28$', '$34$', '$40$'], 1, 'The overlap has been counted twice.', '20 + 14 − 6 = 28.'),

  /* --------------------------------------------------------------- parity */
  item('parity', 1, 'If $n$ is odd, then $n^2 + n$ is…', ['always odd', 'always even', 'even only when $n = 1$', 'impossible to decide'], 1, 'Test n = 3 and n = 5.', '9 + 3 = 12 and 25 + 5 = 30 — odd × (odd + 1) always has an even factor.'),
  item('parity', 2, 'The product of two consecutive integers is…', ['always odd', 'always even', 'even only when both are even', 'sometimes odd'], 1, 'One of any two consecutive numbers is even.', 'An even factor makes the product even.'),

  /* --------------------------------------------------- percent-fundamentals */
  item('percent-fundamentals', 1, '80 increased by 25% is…', ['$90$', '$100$', '$105$', '$120$'], 1, 'A 25% rise multiplies by 1.25.', '80 · 1.25 = 100.'),
  item('percent-fundamentals', 2, 'After a 20% discount a jacket costs $64. Its original price was…', ['$76$', '$80$', '$84$', '$128$'], 1, 'The discount kept 80% of the price.', '64 ÷ 0.8 = 80.'),

  /* ----------------------------------------------------------- probability */
  item('probability', 1, 'A bag has 3 red and 5 blue marbles. The probability of drawing red is…', ['$\\frac{3}{5}$', '$\\frac{3}{8}$', '$\\frac{5}{8}$', '$\\frac{1}{3}$'], 1, 'Favourable outcomes over all outcomes.', '3 red out of 8 marbles.'),
  item('probability', 2, 'A fair die is rolled once. The probability of an even number is…', ['$\\frac{1}{6}$', '$\\frac{1}{3}$', '$\\frac{1}{2}$', '$\\frac{2}{3}$'], 2, 'Count the even faces: 2, 4, 6.', '3 of 6 outcomes.'),

  /* ------------------------------------------------------------ quadratics */
  item('quadratics', 1, 'The solutions of $x^2 - 5x + 6 = 0$ are…', ['$2$ and $3$', '$-2$ and $-3$', '$1$ and $6$', '$-1$ and $-6$'], 0, 'Two numbers multiplying to 6 and adding to 5.', '(x − 2)(x − 3) = 0.'),
  item('quadratics', 2, 'The vertex of $y = x^2 - 4x + 1$ has $x$-coordinate…', ['$-2$', '$1$', '$2$', '$4$'], 2, 'Vertex x = −b ÷ 2a.', '−(−4) ÷ 2 = 2.'),

  /* ------------------------------------------------------------- rates-work */
  item('rates-work', 1, 'A finishes a job in 4 hours and B in 6 hours. Together they take…', ['$2$ hours', '$2.4$ hours', '$5$ hours', '$10$ hours'], 1, 'Add the rates, then invert.', '1/4 + 1/6 = 5/12, so 12/5 = 2.4 hours.'),
  item('rates-work', 2, 'A car covers 240 km in 3 hours. Its average speed is…', ['$60$ km/h', '$72$ km/h', '$80$ km/h', '$120$ km/h'], 2, 'Speed = distance ÷ time.', '240 ÷ 3 = 80 km/h.'),

  /* ------------------------------------------------------------- remainders */
  item('remainders', 1, 'The remainder when 47 is divided by 5 is…', ['$1$', '$2$', '$3$', '$4$'], 1, '5 · 9 = 45, so how many are left?', '47 = 9·5 + 2.'),
  item('remainders', 2, 'The units digit of $7^3$ is…', ['$1$', '$3$', '$7$', '$9$'], 1, '7² = 49, so multiply 49 by 7.', '7³ = 343, units digit 3.'),

  /* -------------------------------------------------------------- sequences */
  item('sequences', 1, 'In the sequence 3, 7, 11, …, the tenth term is…', ['$39$', '$40$', '$43$', '$47$'], 0, 'Each term adds 4; the tenth adds 9 steps.', '3 + 9·4 = 39.'),
  item('sequences', 2, 'The next term of 2, 6, 18, … is…', ['$24$', '$36$', '$54$', '$72$'], 2, 'Each term is three times the one before.', '18 × 3 = 54.'),

  /* ------------------------------------------------------------- statistics */
  item('statistics', 1, 'The median of 4, 9, 2, 7, 5 is…', ['$4$', '$5$', '$5.4$', '$7$'], 1, 'Sort first: 2, 4, 5, 7, 9.', 'The middle value is 5.'),
  item('statistics', 2, 'Adding one very large value to a data set…', ['raises the mean and the median equally', 'raises the mean more than the median', 'raises the median more than the mean', 'leaves both unchanged'], 1, 'The median only counts position.', 'The mean moves towards the new value; the median barely shifts.'),

  /* ---------------------------------------------------------------- systems */
  item('systems', 1, 'If $x + y = 7$ and $x - y = 1$, then $x$ and $y$ are…', ['$4$ and $3$', '$3$ and $4$', '$7$ and $0$', '$5$ and $2$'], 0, 'Add the two equations to remove y.', '2x = 8 → x = 4, then y = 3.'),
  item('systems', 2, 'Two lines with the same slope and different intercepts have…', ['one solution', 'no solution', 'infinitely many solutions', 'two solutions'], 1, 'Same slope means they never meet.', 'Parallel lines: no solution.'),

  /* ----------------------------------------------------------- word-problems */
  item('word-problems', 1, 'A father is three times as old as his son. Their ages add to 48. The son is…', ['$12$', '$14$', '$16$', '$24$'], 0, 'Call the son’s age s and write one equation.', 's + 3s = 48 → s = 12.'),
  item('word-problems', 2, 'If 5 pens cost $60, then 8 pens cost…', ['$84$', '$90$', '$96$', '$100$'], 2, 'Find the price of one pen first.', '60 ÷ 5 = 12 each, so 8 × 12 = 96.'),
];
