/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Falcon Factors · factors, multiples and prime/composite (4.OA.B.4)
   Source: grade-04.md Grade 4 operations strand; the factor work sits beside 4.OA.A.3 in the same unit.
   Mechanic = the thinking: level 1 asks whether a given rectangle can be a full array for n — the row must
   divide n exactly, so the child must test divisibility rather than count; level 2 asks for the factor pair
   that is missing; level 3 names the classification (prime / composite) from the picture. `factor-one-pair`
   (stopping at the first pair), `factor-confuse-multiple` (calling a multiple a factor) and `prime-square`
   (calling 1 prime) are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-falcon-factors', code: 'G04-MAT-04', title: 'Falcon Factors', emoji: '🦅',
  accent: '#7a6a2f', accentDeep: '#635524', skyA: '#fdfbea', skyB: '#f2eec6',
  topic: 'Factors, multiples and primes', band: 'g35', lang: 'en',
  objective: 'I can find all the <b>factor pairs</b> of a number and say whether it is <b>prime</b> or <b>composite</b>.',
  welcome: 'The falconer arranges the perches in exact rows — no perch left over, no row short. 🦅',
  learnBlurb: 'A factor divides exactly. Two factors make a pair.',
  how: {
    what: 'A factor divides a number with nothing left over. Factors come in pairs, because the array can be turned round.',
    steps: ['🦅 Try 1: does it divide exactly?', '🦅 Keep trying up to the number itself.', '✅ Two factors that multiply to the number are a pair.'],
  },

  learn: [
    { say: 'Twelve perches in exact rows: <b>1×12</b>, <b>2×6</b>, <b>3×4</b>. Every pair makes 12 with nothing left over.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.dots(3, 4, { max: 300 }) })); } },
    { say: 'So the factors of 12 are <b>1, 2, 3, 4, 6, 12</b>. A number with only two factors — 1 and itself — is <b>prime</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.dots(1, 7, { max: 340 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '7 has only 1 × 7, so <b>7 is prime</b>. 12 is composite.' }));
      } },
    { say: 'Your turn: is <b>15</b> prime or composite?', wait: true,
      draw(el, L) {
        const row = UI.h('div', { class: 'opts' });
        [['Composite — 3 × 5 = 15.', true], ['Prime — nothing divides it.', false], ['Neither.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 15 has 1, 3, 5 and 15. More than two factors, so composite.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t.startsWith('Prime') ? 'Try 3: does 3 × 5 make 15?' : 'Every number is prime or composite.', 'bad'))),
        })));
        el.append(UI.h('div', { html: SCENE3.dots(3, 5, { max: 280 }) }), row);
      } },
    { say: 'Ghubar says <b>1</b> is prime. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('One only divides by one and itself, so it is prime. Prime!', 5200);
        const row = UI.h('div', { class: 'opts' });
        [['No — prime numbers have exactly two different factors. 1 has only one.', true], ['Yes — 1 is the smallest prime.', false], ['1 is composite.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — 1 is neither prime nor composite.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the different factors of 1. How many are there?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Full rows only', icon: '🦅', blurb: 'Does the row divide it exactly?', rounds: 6, think: false,
      say: '🦅 Can the perches be arranged in rows of this size with none left over?',
      round() {
        const n = UI.rint(12, 60), r = UI.rint(2, 9);
        const fits = n % r === 0;
        const right = fits ? 'Yes — it divides exactly.' : 'No — there would be some left over.';
        return {
          type: 'choice',
          prompt: G1.art(SCENE3.dots(Math.min(r, 6), Math.ceil(n / Math.min(r, 6)), { max: 300 }), `${n} perches, arranged in rows of ${r}.`),
          options: [right, fits ? 'No — there would be some left over.' : 'Yes — it divides exactly.', 'Only if the rows are turned round.'],
          answer: right,
          why: () => `Check ${n} ÷ ${r}: is there a remainder?`,
          hints: [`Try ${r} × something close to ${n}.`, `${r} × ${Math.floor(n / r)} = ${r * Math.floor(n / r)}.`, n % r === 0 ? 'Nothing is left over.' : `That leaves ${n % r} over.`],
          solution: `${n} ÷ ${r} = ${Math.floor(n / r)}${n % r ? ` remainder ${n % r}` : ''}, so ${fits ? 'the rows work' : 'they do not'}.`,
        };
      } },
    { name: 'Find the pair', icon: '🔗', blurb: 'One factor is given — find its partner.', rounds: 6, think: false,
      say: '🔗 Which factor pairs with this one?',
      round() {
        const pairs = [[12, [2, 6], [1, 12], [3, 4]], [18, [2, 9], [3, 6], [1, 18]], [20, [2, 10], [4, 5], [1, 20]], [24, [3, 8], [4, 6], [2, 12]], [30, [3, 10], [5, 6], [2, 15]]];
        const [n, ...ps] = UI.pick(pairs);
        const p = UI.pick(ps);
        const answer = n / p[0];
        return {
          type: 'number', prompt: `The number is <b>${n}</b>. One factor is <b>${p[0]}</b>. What is the other?`,
          answer, suffix: '',
          why: (v) => v === n - p[0] ? 'That subtracts. A factor pair multiplies to the number.' : `Ask: ${p[0]} × ? = ${n}.`,
          hints: [`${p[0]} × ? = ${n}.`, `Try counting up in ${p[0]}s.`, `${p[0]} × ${answer - 1} = ${p[0] * (answer - 1)} — one more step.`],
          solution: `${p[0]} × ${answer} = ${n}, so the pair is <b>${p[0]} and ${answer}</b>.`,
        };
      } },
    { name: 'Prime or composite', icon: '🔢', blurb: 'Count the factors.', rounds: 6, think: false,
      say: '🔢 Is this number prime or composite?',
      round() {
        const primes = [7, 11, 13, 17, 19, 23, 29, 31];
        const composites = [12, 15, 16, 18, 20, 21, 24, 27, 28, 30];
        const isPrime = UI.rint(0, 1) === 0;
        const n = UI.pick(isPrime ? primes : composites);
        const right = isPrime ? `Prime — only 1 × ${n}.` : 'Composite — it has more than two factors.';
        return {
          type: 'choice', prompt: `Is <b>${n}</b> prime or composite?`,
          options: [right, isPrime ? 'Composite — it has more than two factors.' : `Prime — only 1 × ${n}.`, 'Neither prime nor composite.'],
          answer: right,
          why: (v) => v === 'Neither prime nor composite.' ? 'Only 1 is neither. Every number above 1 is one or the other.'
            : `Test small factors: 2, 3, 5, 7. Any that divide ${n} exactly make it composite.`,
          hints: ['Is it even? Then 2 divides it.', 'Add the digits — is the sum a multiple of 3?', `Try 5 and 7 as well.`],
          solution: isPrime ? `${n} has only the factors 1 and ${n}, so it is <b>prime</b>.` : `${n} has more than two factors, so it is <b>composite</b>.`,
        };
      } },
  ],

  ghubar: ['One pair is all the factors.', 'A multiple and a factor are the same thing.', 'One is the smallest prime.'],
  praise: ['Pairs found!', 'Prime spotted!', 'Rows exact!', 'Factors complete!'],
  finale: 'Every perch in an exact row — you know factors, multiples and primes! 🦅',
};
