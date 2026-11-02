/**
 * Practice questions for the authored courses (Algebra 1, Algebra 2, Geometry).
 *
 * Ids follow `<lessonKey>::q<n>`, which is what `courseGraph` assumes when it
 * builds each lesson's `questionIds`. Loaded lazily by `questions.ts`, so this
 * never enters the initial bundle.
 */
import type { Question } from '../questions';

const item = (
  lesson: string,
  n: number,
  question: string,
  options: string[],
  correctIndex: number,
  hint: string,
  explanation: string,
): Question => ({ id: `${lesson}::q${n}`, question, options, correctIndex, hint, explanation });

const A1 = 'algebra-1';
const A2 = 'algebra-2';
const G = 'geometry';

const QUESTIONS: Question[] = [
  /* ---------------------------------------------------------- Algebra 1 · 1 */
  item(`${A1}/1-1`, 1, 'Evaluate $3x + 5$ when $x = 4$.', ['12', '17', '23', '9'], 1, 'Replace x with 4, then multiply before adding.', '3(4) + 5 = 12 + 5 = 17.'),
  item(`${A1}/1-1`, 2, 'Which expression means “five less than twice a number $n$”?', ['$5 - 2n$', '$2n - 5$', '$2(n - 5)$', '$5n - 2$'], 1, '“Twice a number” is 2n; “five less than” subtracts 5 from it.', 'Twice n is 2n, and five less than that is 2n − 5.'),
  item(`${A1}/1-1`, 3, 'Evaluate $2(a + 3b)$ when $a = 4$ and $b = 2$.', ['14', '16', '20', '28'], 2, 'Work inside the brackets first.', '2(4 + 6) = 2(10) = 20.'),

  item(`${A1}/1-2`, 1, 'Simplify $8 + 2 \\cdot 3^2$.', ['26', '90', '44', '38'], 0, 'Exponents before multiplication, multiplication before addition.', '3² = 9, then 2·9 = 18, then 8 + 18 = 26.'),
  item(`${A1}/1-2`, 2, 'Which property justifies $4(x + 3) = 4x + 12$?', ['Commutative', 'Associative', 'Distributive', 'Identity'], 2, 'The 4 multiplies each term inside the brackets.', 'Multiplication distributes over addition.'),
  item(`${A1}/1-2`, 3, 'Simplify $20 - 4 \\div 2 + 3$.', ['11', '21', '13', '7'], 1, 'Division comes before subtraction and addition.', '4 ÷ 2 = 2, so 20 − 2 + 3 = 21.'),

  item(`${A1}/1-3`, 1, 'Solve $5x - 7 = 18$.', ['$x = 2$', '$x = 5$', '$x = 5.4$', '$x = 25$'], 1, 'Add 7 to both sides, then divide by 5.', '5x = 25, so x = 5.'),
  item(`${A1}/1-3`, 2, 'Solve $\\frac{x}{4} + 3 = 9$.', ['$x = 1.5$', '$x = 6$', '$x = 24$', '$x = 48$'], 2, 'Subtract 3 first, then undo the division.', 'x/4 = 6, so x = 24.'),
  item(`${A1}/1-3`, 3, 'Solve $-3x = 21$.', ['$x = 7$', '$x = -7$', '$x = 18$', '$x = -18$'], 1, 'Divide both sides by −3.', 'x = 21 ÷ (−3) = −7.'),

  item(`${A1}/1-4`, 1, 'Solve $P = 2L + 2W$ for $W$.', ['$W = \\frac{P - 2L}{2}$', '$W = P - 2L$', '$W = \\frac{P}{2} - L$', '$W = 2P - L$'], 0, 'Subtract 2L, then divide everything by 2.', 'W = (P − 2L)/2. Both forms P/2 − L and this one are equal; the grouped form shows the division most clearly.'),
  item(`${A1}/1-4`, 2, 'Solve $A = \\frac{1}{2}bh$ for $h$.', ['$h = \\frac{A}{2b}$', '$h = \\frac{2A}{b}$', '$h = 2Ab$', '$h = \\frac{b}{2A}$'], 1, 'Multiply by 2 first to clear the fraction.', '2A = bh, so h = 2A/b.'),
  item(`${A1}/1-4`, 3, 'Solve $y = mx + b$ for $x$.', ['$x = \\frac{y - b}{m}$', '$x = \\frac{y + b}{m}$', '$x = y - \\frac{b}{m}$', '$x = \\frac{m}{y - b}$'], 0, 'Subtract b, then divide by m.', 'y − b = mx, so x = (y − b)/m.'),

  /* ---------------------------------------------------------- Algebra 1 · 2 */
  item(`${A1}/2-1`, 1, 'Find the slope through $(2, 3)$ and $(6, 11)$.', ['$\\frac{1}{2}$', '$2$', '$-2$', '$\\frac{8}{3}$'], 1, 'Slope is the change in y over the change in x.', '(11 − 3)/(6 − 2) = 8/4 = 2.'),
  item(`${A1}/2-1`, 2, 'What is the slope of a horizontal line?', ['Undefined', '$1$', '$0$', '$-1$'], 2, 'A horizontal line never rises.', 'No rise, so the slope is 0.'),
  item(`${A1}/2-1`, 3, 'A line drops 3 units for every 5 units it moves right. What is its slope?', ['$\\frac{3}{5}$', '$-\\frac{5}{3}$', '$-\\frac{3}{5}$', '$\\frac{5}{3}$'], 2, 'Falling means a negative slope.', 'Rise is −3 over run 5: slope −3/5.'),

  item(`${A1}/2-2`, 1, 'For $y = -2x + 4$, what are the slope and y-intercept?', ['slope 4, intercept −2', 'slope −2, intercept 4', 'slope 2, intercept 4', 'slope −2, intercept −4'], 1, 'In y = mx + b, m is the slope.', 'm = −2 and b = 4.'),
  item(`${A1}/2-2`, 2, 'Find the x-intercept of $3x + 2y = 12$.', ['$(0, 6)$', '$(4, 0)$', '$(6, 0)$', '$(0, 4)$'], 1, 'Set y = 0 and solve for x.', '3x = 12 gives x = 4, so the point is (4, 0).'),
  item(`${A1}/2-2`, 3, 'Which equation is a line through the origin with slope 3?', ['$y = 3x + 1$', '$y = 3x$', '$y = -3x$', '$x = 3$'], 1, '“Through the origin” means the y-intercept is 0.', 'Only y = 3x has slope 3 and b = 0.'),

  item(`${A1}/2-3`, 1, 'Write the line through $(1, 2)$ with slope 3.', ['$y = 3x - 1$', '$y = 3x + 2$', '$y = 3x + 5$', '$y = x + 1$'], 0, 'Start with y − 2 = 3(x − 1) and simplify.', 'y = 3x − 3 + 2 = 3x − 1.'),
  item(`${A1}/2-3`, 2, 'Write the line through $(2, 5)$ and $(4, 9)$.', ['$y = 2x + 1$', '$y = 2x + 3$', '$y = \\frac{1}{2}x + 4$', '$y = 4x - 3$'], 0, 'Find the slope first, then substitute a point.', 'Slope (9 − 5)/(4 − 2) = 2; 5 = 2(2) + b gives b = 1.'),
  item(`${A1}/2-3`, 3, 'Rewrite $y - 4 = -2(x + 1)$ in slope–intercept form.', ['$y = -2x + 2$', '$y = -2x + 4$', '$y = -2x + 6$', '$y = 2x + 2$'], 0, 'Distribute the −2, then add 4.', 'y − 4 = −2x − 2, so y = −2x + 2.'),

  item(`${A1}/2-4`, 1, 'Which slope is parallel to $y = \\frac{3}{4}x + 2$?', ['$-\\frac{4}{3}$', '$\\frac{3}{4}$', '$-\\frac{3}{4}$', '$\\frac{4}{3}$'], 1, 'Parallel lines share a slope.', 'Same slope: 3/4.'),
  item(`${A1}/2-4`, 2, 'Which slope is perpendicular to $y = 2x - 5$?', ['$2$', '$-2$', '$-\\frac{1}{2}$', '$\\frac{1}{2}$'], 2, 'Perpendicular slopes are negative reciprocals.', 'The negative reciprocal of 2 is −1/2.'),
  item(`${A1}/2-4`, 3, 'A line is perpendicular to a horizontal line. Its slope is…', ['$0$', '$1$', 'undefined', '$-1$'], 2, 'The perpendicular to a horizontal line is vertical.', 'A vertical line has undefined slope.'),

  item(`${A1}/2-5`, 1, 'Solve $-2x > 8$.', ['$x > -4$', '$x < -4$', '$x > 4$', '$x < 4$'], 1, 'Dividing by a negative flips the sign.', 'x < −4.'),
  item(`${A1}/2-5`, 2, 'Solve $3x - 5 \\le 10$.', ['$x \\le 5$', '$x \\ge 5$', '$x \\le 15$', '$x \\le \\frac{5}{3}$'], 0, 'Add 5, then divide by 3 (positive).', '3x ≤ 15, so x ≤ 5.'),
  item(`${A1}/2-5`, 3, 'Write $x \\ge 2$ and $x < 7$ in interval notation.', ['$(2, 7)$', '$[2, 7)$', '$[2, 7]$', '$(2, 7]$'], 1, 'A square bracket includes the endpoint.', '2 is included, 7 is not: [2, 7).'),

  /* ---------------------------------------------------------- Algebra 1 · 3 */
  item(`${A1}/3-1`, 1, 'Where do $y = x + 1$ and $y = -x + 5$ meet?', ['$(2, 3)$', '$(3, 4)$', '$(1, 2)$', '$(0, 5)$'], 0, 'Set the two rules equal.', 'x + 1 = −x + 5 gives x = 2, so y = 3.'),
  item(`${A1}/3-1`, 2, 'Two different lines have the same slope. How many solutions does the system have?', ['Exactly one', 'None', 'Infinitely many', 'Two'], 1, 'Parallel lines never meet.', 'No intersection, so no solution.'),
  item(`${A1}/3-1`, 3, 'If both equations describe the same line, the system has…', ['No solution', 'One solution', 'Infinitely many solutions', 'Two solutions'], 2, 'Every point of the line satisfies both equations.', 'Infinitely many solutions.'),

  item(`${A1}/3-2`, 1, 'Solve $x + y = 10$ and $x - y = 4$.', ['$(7, 3)$', '$(6, 4)$', '$(3, 7)$', '$(5, 5)$'], 0, 'Adding the equations removes y.', '2x = 14, so x = 7 and y = 3.'),
  item(`${A1}/3-2`, 2, 'In $2x + 3y = 12$, if $x = 3$, what is $y$?', ['$1$', '$2$', '$3$', '$6$'], 1, 'Substitute x = 3 first.', '6 + 3y = 12, so y = 2.'),
  item(`${A1}/3-2`, 3, 'Solve $3x + 2y = 16$ and $3x - 2y = 8$.', ['$(4, 2)$', '$(2, 4)$', '$(4, -2)$', '$(6, -1)$'], 0, 'Adding eliminates y.', '6x = 24, so x = 4 and then y = 2.'),

  item(`${A1}/3-3`, 1, 'Which point satisfies both $y > x$ and $y < 4$?', ['$(5, 2)$', '$(1, 3)$', '$(3, 3)$', '$(0, 5)$'], 1, 'Test each point in both inequalities.', '(1, 3): 3 > 1 ✓ and 3 < 4 ✓.'),
  item(`${A1}/3-3`, 2, 'A dashed boundary line means…', ['The line is included', 'The line is not included', 'The region is empty', 'The inequality is an equation'], 1, 'Solid includes, dashed excludes.', 'A dashed line is not part of the solution.'),
  item(`${A1}/3-3`, 3, 'Which region does $y \\le 2x + 1$ shade?', ['Above the line', 'Below and including the line', 'Below the line only', 'Right of the line'], 1, '“y ≤” means y is smaller than the line height.', 'Below the line, line included.'),

  item(`${A1}/3-4`, 1, 'If $f(x) = 3x - 2$, find $f(-1)$.', ['$-5$', '$-1$', '$1$', '$5$'], 0, 'Substitute −1 for x.', '3(−1) − 2 = −5.'),
  item(`${A1}/3-4`, 2, 'What is the domain of $f(x) = \\frac{1}{x - 4}$?', ['All reals', 'All reals except 4', '$x > 4$', '$x \\ge 4$'], 1, 'The denominator cannot be zero.', 'x = 4 is excluded.'),
  item(`${A1}/3-4`, 3, 'Which relation is **not** a function?', ['$\\{(1,2),(2,3),(3,4)\\}$', '$\\{(1,2),(1,3),(2,4)\\}$', '$\\{(0,0),(1,1)\\}$', '$\\{(2,5),(3,5)\\}$'], 1, 'A function gives one output per input.', 'x = 1 has two outputs, so it is not a function.'),

  /* ---------------------------------------------------------- Algebra 1 · 4 */
  item(`${A1}/4-1`, 1, 'Simplify $x^5 \\cdot x^3$.', ['$x^{15}$', '$x^8$', '$x^2$', '$2x^8$'], 1, 'Multiply: add the exponents.', 'x^(5+3) = x⁸.'),
  item(`${A1}/4-1`, 2, 'Simplify $(2x^3)^2$.', ['$2x^6$', '$4x^6$', '$4x^5$', '$2x^9$'], 1, 'Square both the 2 and the x³.', '(2)²(x³)² = 4x⁶.'),
  item(`${A1}/4-1`, 3, 'Evaluate $5^0 + 2^{-2}$.', ['$\\frac{5}{4}$', '$\\frac{3}{4}$', '$1$', '$\\frac{9}{4}$'], 0, 'Anything to the power 0 is 1; a negative exponent means reciprocal.', '1 + 1/4 = 5/4.'),

  item(`${A1}/4-2`, 1, 'Subtract: $(3x^2 + 2x - 1) - (x^2 - 4x + 2)$.', ['$2x^2 - 2x + 1$', '$2x^2 + 6x - 3$', '$2x^2 - 2x - 3$', '$4x^2 - 2x + 1$'], 1, 'Distribute the minus sign to every term.', '3x² − x² = 2x²; 2x + 4x = 6x; −1 − 2 = −3.'),
  item(`${A1}/4-2`, 2, 'Multiply $(x + 4)(x - 3)$.', ['$x^2 + x - 12$', '$x^2 - x - 12$', '$x^2 + 7x - 12$', '$x^2 - 12$'], 0, 'Use FOIL or the distributive property.', 'x² − 3x + 4x − 12 = x² + x − 12.'),
  item(`${A1}/4-2`, 3, 'Expand $(2x - 1)^2$.', ['$4x^2 + 1$', '$4x^2 - 4x + 1$', '$4x^2 - 1$', '$2x^2 - 4x + 1$'], 1, 'Square the binomial; the middle term is not zero.', '4x² − 4x + 1.'),

  item(`${A1}/4-3`, 1, 'Factor $x^2 - 9$.', ['$(x - 3)^2$', '$(x - 3)(x + 3)$', '$(x + 9)(x - 1)$', '$(x - 9)(x + 1)$'], 1, 'This is a difference of squares.', 'x² − 9 = (x − 3)(x + 3).'),
  item(`${A1}/4-3`, 2, 'Factor $x^2 + 7x + 12$.', ['$(x + 3)(x + 4)$', '$(x + 2)(x + 6)$', '$(x + 1)(x + 12)$', '$(x + 6)(x + 6)$'], 0, 'Find two numbers that multiply to 12 and add to 7.', '3 · 4 = 12 and 3 + 4 = 7.'),
  item(`${A1}/4-3`, 3, 'Factor out the greatest common factor: $6x^3 + 9x^2$.', ['$3x^2(2x + 3)$', '$3x(2x^2 + 3x)$', '$6x^2(x + 3)$', '$x^2(6x + 9)$'], 0, 'Take the largest number and the smallest power of x.', '3x²(2x + 3).'),

  item(`${A1}/4-4`, 1, 'Solve $x^2 - 5x + 6 = 0$.', ['$x = 2, 3$', '$x = -2, -3$', '$x = 1, 6$', '$x = -1, 6$'], 0, 'Factor into two brackets and set each to zero.', '(x − 2)(x − 3) = 0, so x = 2 or 3.'),
  item(`${A1}/4-4`, 2, 'What is the vertex of $y = (x - 2)^2 - 3$?', ['$(2, -3)$', '$(-2, -3)$', '$(2, 3)$', '$(3, -2)$'], 0, 'Vertex form is $y = (x - h)^2 + k$.', 'The vertex is (2, −3), a minimum.'),
  item(`${A1}/4-4`, 3, 'A parabola has roots $x = -1$ and $x = 4$. Which equation fits?', ['$y = x^2 - 3x - 4$', '$y = x^2 + 3x - 4$', '$y = x^2 - 3x + 4$', '$y = x^2 + 5x + 4$'], 0, 'Build (x + 1)(x − 4) and expand.', 'x² − 3x − 4.'),

  /* ---------------------------------------------------------- Algebra 1 · 5 */
  item(`${A1}/5-1`, 1, 'A scatter plot shows a negative correlation. That means…', ['Both variables rise together', 'As one rises the other tends to fall', 'There is no pattern', 'The data are wrong'], 1, 'Negative correlation means opposite directions.', 'One variable tends to fall as the other rises.'),
  item(`${A1}/5-1`, 2, 'A line of fit passes through $(0, 5)$ and $(4, 13)$. What is its equation?', ['$y = 2x + 5$', '$y = 5x + 2$', '$y = 8x + 5$', '$y = 2x - 5$'], 0, 'Slope from the two points, then read the intercept.', 'Slope 8/4 = 2 and intercept 5.'),
  item(`${A1}/5-1`, 3, 'Why is extrapolating far beyond the data risky?', ['The line is always wrong', 'The pattern may not continue', 'Correlation cannot be measured', 'Slopes change sign'], 1, 'A fitted line describes the data you have.', 'Outside the data range the trend may break down.'),

  item(`${A1}/5-2`, 1, 'Find the mean and median of $4, 6, 8, 10, 12$.', ['both 8', 'mean 8, median 10', 'mean 10, median 8', 'both 10'], 0, 'The data are symmetric.', 'Sum 40 over 5 gives 8; the middle value is 8.'),
  item(`${A1}/5-2`, 2, 'What is the median of $3, 7, 7, 10, 20$?', ['$7$', '$9.4$', '$10$', '$7.5$'], 0, 'Order the values and take the middle one.', 'The middle value is 7.'),
  item(`${A1}/5-2`, 3, 'Adding one very large outlier affects which summary the most?', ['The median', 'The mode', 'The mean', 'The minimum'], 2, 'The mean uses every value.', 'A large outlier pulls the mean far more than the median.'),

  /* ---------------------------------------------------------- Algebra 2 · 1 */
  item(`${A2}/1-1`, 1, 'How does $y = f(x - 3)$ change the graph of $f$?', ['Left 3', 'Right 3', 'Up 3', 'Down 3'], 1, 'Inside the brackets acts on x in the opposite direction.', 'Shift right by 3.'),
  item(`${A2}/1-1`, 2, 'The graph of $y = -f(x)$ is…', ['Shifted down', 'Reflected in the y-axis', 'Reflected in the x-axis', 'Stretched vertically'], 2, 'A minus outside multiplies the outputs.', 'Every y-value changes sign: reflection in the x-axis.'),
  item(`${A2}/1-1`, 3, 'Which transformation stretches $f$ vertically by 2?', ['$f(2x)$', '$2f(x)$', '$f(x) + 2$', '$f(x/2)$'], 1, 'Vertical stretch multiplies the output.', '2f(x) doubles every height.'),

  item(`${A2}/1-2`, 1, 'If $f(x) = x + 1$ and $g(x) = x^2$, find $f(g(3))$.', ['$7$', '$10$', '$16$', '$9$'], 1, 'Work out the inner function first.', 'g(3) = 9, then f(9) = 10.'),
  item(`${A2}/1-2`, 2, 'A function has an inverse only when it is…', ['Linear', 'One-to-one', 'Increasing', 'Continuous'], 1, 'The inverse must also pass the vertical line test.', 'One-to-one (passes the horizontal line test).'),
  item(`${A2}/1-2`, 3, 'Find the inverse of $f(x) = 2x - 6$.', ['$f^{-1}(x) = \\frac{x + 6}{2}$', '$f^{-1}(x) = 2x + 6$', '$f^{-1}(x) = \\frac{x}{2} - 6$', '$f^{-1}(x) = \\frac{x - 6}{2}$'], 0, 'Swap x and y, then solve for y.', 'x = 2y − 6 gives y = (x + 6)/2.'),

  item(`${A2}/1-3`, 1, 'Solve $|x - 3| = 5$.', ['$x = 8$ only', '$x = -2$ only', '$x = 8$ or $x = -2$', '$x = 2$ or $x = -8$'], 2, 'Two cases: inside equals 5 or −5.', 'x − 3 = 5 or x − 3 = −5.'),
  item(`${A2}/1-3`, 2, 'Solve $|x| < 4$.', ['$x < 4$', '$-4 < x < 4$', '$x > -4$', '$x < -4$ or $x > 4$'], 1, '“Less than” becomes a between inequality.', 'Distance from 0 below 4: −4 < x < 4.'),
  item(`${A2}/1-3`, 3, 'Solve $|x + 2| \\ge 1$.', ['$-3 \\le x \\le -1$', '$x \\ge -1$', '$x \\le -3$ or $x \\ge -1$', '$x \\le -1$'], 2, '“Greater than” splits into two directions.', 'Outside the interval: x ≤ −3 or x ≥ −1.'),

  item(`${A2}/1-4`, 1, 'For $f(x) = 2x$ when $x < 0$ and $f(x) = x + 1$ when $x \\ge 0$, find $f(-2)$.', ['$-4$', '$-1$', '$3$', '$1$'], 0, 'Choose the rule that matches the input.', '−2 < 0, so use 2x: f(−2) = −4.'),
  item(`${A2}/1-4`, 2, 'The greatest integer function $\\lfloor x \\rfloor$ returns…', ['The nearest integer', 'The largest integer ≤ x', 'The smallest integer ≥ x', 'The fractional part'], 1, 'It always rounds down.', 'Floor: the greatest integer not exceeding x.'),
  item(`${A2}/1-4`, 3, 'A piecewise graph has a jump at $x = 2$. That means…', ['It is continuous', 'The one-sided limits differ', 'It has a vertical asymptote', 'It is undefined everywhere'], 1, 'Continuity needs the sides to agree.', 'The two pieces approach different values.'),

  /* ---------------------------------------------------------- Algebra 2 · 2 */
  item(`${A2}/2-1`, 1, 'Write $y = x^2 - 6x + 5$ in vertex form.', ['$(x - 3)^2 - 4$', '$(x - 3)^2 + 4$', '$(x + 3)^2 - 4$', '$(x - 6)^2 + 5$'], 0, 'Half of −6 is −3; subtract 3² and add it back.', 'x² − 6x + 9 − 4 = (x − 3)² − 4.'),
  item(`${A2}/2-1`, 2, 'The vertex of $y = (x + 1)^2 + 2$ is…', ['$(1, 2)$', '$(-1, 2)$', '$(1, -2)$', '$(-1, -2)$'], 1, 'Vertex form is $(x - h)^2 + k$.', 'h = −1, k = 2.'),
  item(`${A2}/2-1`, 3, 'A parabola opens upward, so its vertex is a…', ['Maximum', 'Minimum', 'Zero', 'Axis of symmetry'], 1, 'Opening up means the vertex is the lowest point.', 'Minimum.'),
  item(`${A2}/2-2`, 1, 'The discriminant of $x^2 - 4x + 4 = 0$ is…', ['$0$', '$8$', '$-8$', '$32$'], 0, 'b² − 4ac.', '16 − 16 = 0: one repeated root.'),
  item(`${A2}/2-2`, 2, 'If the discriminant is negative, the equation has…', ['Two real roots', 'One real root', 'Two complex roots', 'No roots at all'], 2, 'A negative square root gives imaginary values.', 'Two complex conjugate roots.'),
  item(`${A2}/2-2`, 3, 'Solve $x^2 + 2x - 3 = 0$ using the formula.', ['$x = 1, -3$', '$x = -1, 3$', '$x = 1, 3$', '$x = -1, -3$'], 0, 'a = 1, b = 2, c = −3.', 'x = (−2 ± 4)/2 gives 1 and −3.'),
  item(`${A2}/2-3`, 1, 'Simplify $i^2$.', ['$1$', '$-1$', '$i$', '$-i$'], 1, 'The unit imaginary number squares to −1.', 'i² = −1.'),
  item(`${A2}/2-3`, 2, 'What is $(3 + 2i) + (1 - 5i)$?', ['$4 - 3i$', '$4 + 7i$', '$2 + 3i$', '$4 - 7i$'], 0, 'Add real parts and imaginary parts separately.', '4 − 3i.'),
  item(`${A2}/2-3`, 3, 'Which is the conjugate of $2 - 7i$?', ['$2 + 7i$', '$-2 - 7i$', '$-2 + 7i$', '$7 - 2i$'], 0, 'Flip the sign of the imaginary part.', '2 + 7i.'),
  item(`${A2}/2-4`, 1, 'A line and a parabola can meet in at most…', ['1 point', '2 points', '3 points', '4 points'], 1, 'A line crosses a parabola twice at most.', 'At most two intersection points.'),
  item(`${A2}/2-4`, 2, 'If the line misses the parabola, the system has…', ['One solution', 'Two solutions', 'No real solutions', 'Infinitely many'], 2, 'No intersection means no real solution.', 'No real solutions (the intersections are complex).'),
  item(`${A2}/2-4`, 3, 'The solution of $y > x^2$ is the region…', ['Inside the parabola', 'Outside (above) the parabola', 'To the right of the parabola', 'Below the parabola'], 1, '“y greater than” means above the curve.', 'Above the parabola, boundary dashed.'),

  /* ---------------------------------------------------------- Algebra 2 · 3 */
  item(`${A2}/3-1`, 1, 'A polynomial of even degree with a positive leading coefficient has…', ['Both ends down', 'Both ends up', 'One end up, one down', 'No turning points'], 1, 'Even degree: the ends agree; positive: both up.', 'Both ends up.'),
  item(`${A2}/3-1`, 2, 'A zero of multiplicity 2 behaves how at the axis?', ['Crosses', 'Touches and turns back', 'Has an asymptote', 'Disappears'], 1, 'An even multiplicity means no sign change.', 'The graph touches the axis and turns.'),
  item(`${A2}/3-1`, 3, 'A degree 4 polynomial can have at most how many turning points?', ['$1$', '$2$', '$3$', '$4$'], 2, 'At most n − 1 turning points.', '4 − 1 = 3.'),
  item(`${A2}/3-2`, 1, 'Divide $x^2 - 5x + 6$ by $x - 2$.', ['$x - 3$', '$x + 3$', '$x - 5$', '$x^2 - 3$'], 0, 'What multiplies (x − 2) to give the dividend?', '(x − 2)(x − 3) = x² − 5x + 6.'),
  item(`${A2}/3-2`, 2, 'By the remainder theorem, $f(3)$ equals…', ['The quotient', 'The remainder when dividing by $x - 3$', 'The leading coefficient', 'The degree'], 1, 'Evaluate at the zero of the divisor.', 'f(3) is exactly that remainder.'),
  item(`${A2}/3-2`, 3, 'If $x - 4$ divides a polynomial exactly, then…', ['$f(4) = 1$', '$f(4) = 0$', '$f(0) = 4$', '$f(-4) = 0$'], 1, 'A zero remainder means a root.', 'x = 4 is a root.'),
  item(`${A2}/3-3`, 1, 'Where is the vertical asymptote of $y = \\frac{1}{x - 5}$?', ['$x = 0$', '$x = 5$', '$y = 5$', '$x = -5$'], 1, 'The denominator must not be zero.', 'x = 5.'),
  item(`${A2}/3-3`, 2, 'If the numerator and denominator share a factor, the graph has…', ['A vertical asymptote', 'A hole', 'A horizontal asymptote only', 'No features'], 1, 'A cancelled factor leaves a hole.', 'A removable discontinuity (hole).'),
  item(`${A2}/3-3`, 3, 'For $y = \\frac{2x^2 + 1}{x^2 - 3}$, the horizontal asymptote is…', ['$y = 0$', '$y = 2$', '$y = 1$', 'none'], 1, 'Equal degrees: ratio of leading coefficients.', 'y = 2.'),
  item(`${A2}/3-4`, 1, 'Solve $\\frac{3}{x} = \\frac{6}{x - 1}$.', ['$x = -1$', '$x = 1$', '$x = 2$', '$x = -2$'], 0, 'Cross-multiply, then check the denominators.', '3(x − 1) = 6x gives −3 = 3x, so x = −1.'),
  item(`${A2}/3-4`, 2, 'Why can a rational equation produce an extraneous solution?', ['The algebra is wrong', 'A value makes a denominator zero', 'The equation is quadratic', 'It has two roots'], 1, 'Multiplying by the denominator can admit forbidden values.', 'Values that zero a denominator must be discarded.'),
  item(`${A2}/3-4`, 3, 'Solve $\\frac{1}{x} + \\frac{1}{2} = 1$.', ['$x = 2$', '$x = 1$', '$x = \\frac{1}{2}$', '$x = -2$'], 0, 'Multiply every term by 2x.', '2 + x = 2x, so x = 2.'),

  /* ---------------------------------------------------------- Algebra 2 · 4 */
  item(`${A2}/4-1`, 1, 'A quantity doubles every 3 years. What is the growth factor per year?', ['$2$', '$2^{1/3}$', '$3^{2}$', '$\\frac{1}{3}$'], 1, 'The factor compounds to 2 over three years.', 'b³ = 2, so b = 2^(1/3).'),
  item(`${A2}/4-1`, 2, 'For $y = 500(0.8)^t$, the quantity is…', ['Growing 20% per unit', 'Decaying 20% per unit', 'Growing 80% per unit', 'Constant'], 1, 'A base below 1 means decay.', 'Each step keeps 80%, so it loses 20%.'),
  item(`${A2}/4-1`, 3, 'The half-life is 10 hours. After 30 hours, how much remains?', ['$\\frac{1}{2}$', '$\\frac{1}{4}$', '$\\frac{1}{8}$', '$\\frac{1}{16}$'], 2, 'Three half-lives pass.', '(1/2)³ = 1/8.'),
  item(`${A2}/4-2`, 1, 'Rewrite $2^5 = 32$ in logarithmic form.', ['$\\log_5 32 = 2$', '$\\log_2 32 = 5$', '$\\log_{32} 2 = 5$', '$\\log_2 5 = 32$'], 1, 'The base stays the base.', 'log₂ 32 = 5.'),
  item(`${A2}/4-2`, 2, 'Simplify $\\log_3 9 + \\log_3 3$.', ['$2$', '$3$', '$9$', '$27$'], 1, 'Convert each term, then add.', '2 + 1 = 3.'),
  item(`${A2}/4-2`, 3, 'Solve $3^x = 27$.', ['$x = 2$', '$x = 3$', '$x = 9$', '$x = 27$'], 1, 'Write 27 as a power of 3.', '3³ = 27.'),
  item(`${A2}/4-3`, 1, 'The sequence $5, 8, 11, 14$ is…', ['Geometric', 'Arithmetic with d = 3', 'Neither', 'Arithmetic with d = 5'], 1, 'Check the common difference.', 'Each term adds 3.'),
  item(`${A2}/4-3`, 2, 'For $2, 6, 18, 54$, the common ratio is…', ['$2$', '$3$', '$4$', '$\\frac{1}{3}$'], 1, 'Divide a term by the one before it.', '6 ÷ 2 = 3.'),
  item(`${A2}/4-3`, 3, 'Sum the first 10 terms of $1, 2, 3, \\dots, 10$.', ['$45$', '$50$', '$55$', '$100$'], 2, 'Use n(a₁ + aₙ)/2.', '10(1 + 10)/2 = 55.'),

  /* ---------------------------------------------------------- Geometry · 1 */
  item(`${G}/1-1`, 1, 'A ray has…', ['Two endpoints', 'One endpoint', 'No endpoints', 'Three endpoints'], 1, 'A ray starts at one point and continues.', 'One endpoint.'),
  item(`${G}/1-1`, 2, 'If $B$ lies between $A$ and $C$, $AB = 4$ and $BC = 7$, then $AC = $', ['$3$', '$11$', '$28$', '$4$'], 1, 'Segment addition: AB + BC.', '4 + 7 = 11.'),
  item(`${G}/1-1`, 3, 'Two distinct lines can intersect in at most…', ['No points', 'One point', 'Two points', 'A segment'], 1, 'Straight lines meet once or never.', 'At most one point.'),
  item(`${G}/1-2`, 1, 'Two angles are complementary. Their sum is…', ['$90°$', '$180°$', '$360°$', '$0°$'], 0, 'Complementary sums to 90°.', '90°.'),
  item(`${G}/1-2`, 2, 'One angle in a linear pair is $65°$. The other is…', ['$25°$', '$65°$', '$115°$', '$125°$'], 2, 'A linear pair is supplementary.', '180 − 65 = 115°.'),
  item(`${G}/1-2`, 3, 'Vertical angles are…', ['Supplementary', 'Complementary', 'Equal', 'Always right'], 2, 'They are formed by opposite rays.', 'Vertical angles are congruent.'),
  item(`${G}/1-3`, 1, 'Distance between $(1, 2)$ and $(4, 6)$.', ['$3$', '$5$', '$7$', '$\\sqrt{7}$'], 1, 'Pythagorean distance formula.', '√(9 + 16) = 5.'),
  item(`${G}/1-3`, 2, 'Midpoint of $(-2, 3)$ and $(4, 7)$.', ['$(1, 5)$', '$(2, 10)$', '$(1, 2)$', '$(6, 4)$'], 0, 'Average the coordinates.', '((−2+4)/2, (3+7)/2) = (1, 5).'),
  item(`${G}/1-3`, 3, 'A segment from $(0,0)$ to $(8,0)$ is halved. The midpoint is…', ['$(0, 4)$', '$(4, 0)$', '$(8, 4)$', '$(2, 0)$'], 1, 'Average the x-coordinates.', '(4, 0).'),
  item(`${G}/1-4`, 1, 'A rotation is which kind of transformation?', ['Rigid motion', 'Dilation', 'Stretch', 'Projects the figure'], 0, 'Distances and angles are preserved.', 'A rigid motion (isometry).'),
  item(`${G}/1-4`, 2, 'Reflecting $(3, -2)$ in the x-axis gives…', ['$(-3, -2)$', '$(3, 2)$', '$(-3, 2)$', '$(2, 3)$'], 1, 'The x-axis reflection flips y.', '(3, 2).'),
  item(`${G}/1-4`, 3, 'A dilation by factor 3 changes the area by…', ['$3$', '$6$', '$9$', '$27$'], 2, 'Area scales by the square of the factor.', '3² = 9.'),

  /* ---------------------------------------------------------- Geometry · 2 */
  item(`${G}/2-1`, 1, 'The angles of a triangle sum to…', ['$90°$', '$180°$', '$270°$', '$360°$'], 1, 'Two right angles.', '180°.'),
  item(`${G}/2-1`, 2, 'An exterior angle of a triangle equals…', ['The adjacent interior angle', 'The sum of the two remote interior angles', '$180°$', 'Half the sum of the angles'], 1, 'Exterior angle theorem.', 'It equals the sum of the two opposite interior angles.'),
  item(`${G}/2-1`, 3, 'An isosceles triangle has a vertex angle of $40°$. Each base angle is…', ['$40°$', '$50°$', '$70°$', '$140°$'], 2, 'The base angles are equal.', '(180 − 40)/2 = 70°.'),
  item(`${G}/2-2`, 1, 'Which set of parts does **not** guarantee congruence?', ['SSS', 'SAS', 'ASA', 'SSA'], 3, 'The ambiguous case.', 'SSA can produce two different triangles.'),
  item(`${G}/2-2`, 2, 'CPCTC is used…', ['Before proving triangles congruent', 'After proving triangles congruent', 'Only for right triangles', 'Only for similar triangles'], 1, 'You need congruence first.', 'Corresponding parts of congruent triangles are congruent.'),
  item(`${G}/2-2`, 3, 'Two triangles are congruent. Their corresponding angles are…', ['Supplementary', 'Equal', 'Complementary', 'Unrelated'], 1, 'Congruence includes angles.', 'All corresponding parts match.'),
  item(`${G}/2-3`, 1, 'Two triangles are similar with scale factor 2. The ratio of their areas is…', ['$2 : 1$', '$4 : 1$', '$1 : 2$', '$8 : 1$'], 1, 'Area ratio is the square of the scale factor.', '4 : 1.'),
  item(`${G}/2-3`, 2, 'Which similarity test needs only two pairs of equal angles?', ['SSS', 'SAS', 'AA', 'SSA'], 2, 'Two angles force the third.', 'AA similarity.'),
  item(`${G}/2-3`, 3, 'Similar triangles have perimeters in the ratio 3 : 5. The ratio of areas is…', ['$3 : 5$', '$5 : 3$', '$9 : 25$', '$27 : 125$'], 2, 'Square the perimeter ratio.', '9 : 25.'),
  item(`${G}/2-4`, 1, 'A right triangle has legs 6 and 8. The hypotenuse is…', ['$10$', '$12$', '$14$', '$48$'], 0, 'a² + b² = c².', '36 + 64 = 100, so c = 10.'),
  item(`${G}/2-4`, 2, 'In a 30-60-90 triangle with short leg 5, the hypotenuse is…', ['$5\\sqrt{2}$', '$10$', '$5\\sqrt{3}$', '$15$'], 1, 'The hypotenuse is twice the short leg.', '10.'),
  item(`${G}/2-4`, 3, 'Sides 7, 24, 25 form…', ['A right triangle', 'An obtuse triangle', 'An acute triangle', 'Not a triangle'], 0, 'Check whether the squares add up.', '49 + 576 = 625 = 25².'),
  item(`${G}/2-5`, 1, 'In a right triangle, $\\sin\\theta$ equals…', ['adjacent / hypotenuse', 'opposite / hypotenuse', 'opposite / adjacent', 'hypotenuse / opposite'], 1, 'SOH from SOH-CAH-TOA.', 'Opposite over hypotenuse.'),
  item(`${G}/2-5`, 2, 'A $20°$ angle of elevation to a tree 15 m away gives its height as…', ['$15\\tan 20°$', '$15\\sin 20°$', '$\\frac{15}{\\tan 20°}$', '$15\\cos 20°$'], 0, 'Tangent links opposite and adjacent.', 'h = 15 tan 20°.'),
  item(`${G}/2-5`, 3, 'If $\\cos\\theta = \\frac{3}{5}$ in a right triangle, then $\\sin\\theta$ is…', ['$\\frac{3}{5}$', '$\\frac{4}{5}$', '$\\frac{5}{4}$', '$\\frac{3}{4}$'], 1, 'Use a 3-4-5 triangle.', 'The opposite side is 4, so sin θ = 4/5.'),

  /* ---------------------------------------------------------- Geometry · 3 */
  item(`${G}/3-1`, 1, 'An inscribed angle is how much of its intercepted arc?', ['Equal', 'Half', 'Twice', 'A quarter'], 1, 'Inscribed angle theorem.', 'Half the measure of the arc.'),
  item(`${G}/3-1`, 2, 'An angle inscribed in a semicircle is…', ['$45°$', '$60°$', '$90°$', '$180°$'], 2, 'The arc is 180°, so the angle is half that.', '90°.'),
  item(`${G}/3-1`, 3, 'A central angle of $80°$ intercepts an arc of…', ['$40°$', '$80°$', '$160°$', '$180°$'], 1, 'Central angles equal their arcs.', '80°.'),
  item(`${G}/3-2`, 1, 'Area of a triangle with base 10 and height 6.', ['$16$', '$30$', '$60$', '$32$'], 1, 'Half base times height.', '½ · 10 · 6 = 30.'),
  item(`${G}/3-2`, 2, 'Area of a circle with radius 4.', ['$8\\pi$', '$16\\pi$', '$4\\pi$', '$2\\pi$'], 1, 'A = πr².', '16π.'),
  item(`${G}/3-2`, 3, 'A trapezoid has parallel sides 6 and 10 and height 4. Its area is…', ['$32$', '$40$', '$64$', '$24$'], 0, 'Average the parallel sides, times height.', '½(6 + 10)(4) = 32.'),
  item(`${G}/3-3`, 1, 'Arc length of a $90°$ sector in a circle of radius 8.', ['$2\\pi$', '$4\\pi$', '$8\\pi$', '$16\\pi$'], 1, 'A quarter of the circumference.', '¼ · 2π(8) = 4π.'),
  item(`${G}/3-3`, 2, 'Area of a $90°$ sector with radius 6.', ['$3\\pi$', '$6\\pi$', '$9\\pi$', '$36\\pi$'], 2, 'A quarter of πr².', '¼ · 36π = 9π.'),
  item(`${G}/3-3`, 3, '$180°$ equals how many radians?', ['$\\frac{\\pi}{2}$', '$\\pi$', '$2\\pi$', '$\\frac{\\pi}{4}$'], 1, 'π radians is a half turn.', 'π.'),
  item(`${G}/3-4`, 1, 'Volume of a cylinder with radius 3 and height 5.', ['$15\\pi$', '$30\\pi$', '$45\\pi$', '$90\\pi$'], 2, 'V = πr²h.', 'π · 9 · 5 = 45π.'),
  item(`${G}/3-4`, 2, 'A cone has the same base and height as a cylinder. Its volume is…', ['The same', 'One third', 'One half', 'Twice'], 1, 'Cone = ⅓ cylinder.', 'One third.'),
  item(`${G}/3-4`, 3, 'Surface area of a sphere with radius 2.', ['$4\\pi$', '$8\\pi$', '$16\\pi$', '$\\frac{32}{3}\\pi$'], 2, 'SA = 4πr².', '4π · 4 = 16π.'),

  /* ---------------------------------------------------------- Geometry · 4 */
  item(`${G}/4-1`, 1, 'The circle $(x - 2)^2 + (y + 3)^2 = 25$ has centre…', ['$(2, -3)$', '$(-2, 3)$', '$(2, 3)$', '$(-2, -3)$'], 0, 'Read h and k with opposite signs.', '(2, −3), radius 5.'),
  item(`${G}/4-1`, 2, 'The radius of $(x + 1)^2 + (y - 4)^2 = 16$ is…', ['$16$', '$8$', '$4$', '$2$'], 2, 'The right side is r².', 'r = 4.'),
  item(`${G}/4-1`, 3, 'A tangent to a circle meets the radius at the point of contact at…', ['$45°$', '$60°$', '$90°$', '$180°$'], 2, 'Tangents are perpendicular to radii.', '90°.'),
  item(`${G}/4-2`, 1, 'Segments with slopes $\\frac{2}{3}$ and $-\\frac{3}{2}$ are…', ['Parallel', 'Perpendicular', 'Neither', 'Equal'], 1, 'The product of the slopes is −1.', 'They are perpendicular.'),
  item(`${G}/4-2`, 2, 'A quadrilateral whose diagonals bisect each other is a…', ['Trapezoid', 'Parallelogram', 'Kite', 'Triangle'], 1, 'Bisecting diagonals characterise parallelograms.', 'Parallelogram.'),
  item(`${G}/4-2`, 3, 'The midpoint of both diagonals of a quadrilateral is the same point. This proves it is a…', ['Rectangle', 'Parallelogram', 'Square', 'Rhombus'], 1, 'That is the coordinate test for a parallelogram.', 'Parallelogram (other properties decide which kind).'),
  item(`${G}/4-3`, 1, 'A dart lands randomly on a $10 \\times 10$ board with a $4 \\times 4$ target. P(hit) is…', ['$0.04$', '$0.16$', '$0.4$', '$0.8$'], 1, 'Favourable area over total area.', '16/100 = 0.16.'),
  item(`${G}/4-3`, 2, 'Geometric probability compares…', ['Counts of outcomes', 'Areas (or lengths)', 'Angles', 'Slopes'], 1, 'It is a ratio of measures.', 'Favourable measure over total measure.'),
  item(`${G}/4-3`, 3, 'A point is chosen in a circle of radius 2. P(inside the inscribed square) is about…', ['$0.32$', '$0.50$', '$0.64$', '$0.79$'], 2, 'Square area 8, circle area 4π.', '8 / (4π) ≈ 0.64.'),
];

export const AUTHORED_BANK: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((question) => [question.id, question]),
);
