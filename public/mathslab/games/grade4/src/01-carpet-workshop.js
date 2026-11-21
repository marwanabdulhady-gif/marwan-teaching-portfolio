/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Carpet Workshop · two-digit × two-digit multiplication on an area model (4.NBT.B.5)
   Source: G04-U01-MATH-L02 — الضرب متعدد الأرقام بنماذج المساحة والقيمة المنزلية (4.NBT.B.5).
   Mechanic = the thinking: level 1 reads a drawn area model whose four cells are BLANK, so the child must
   rebuild the partial products from the split dimensions and add them; level 2 asks for a single partial
   product, which is the step children skip; level 3 is a word problem. `partial-forgot` (only the biggest
   cell) and `split-not-place` (24 split as 2 and 4) are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-carpet-workshop', code: 'G04-MAT-01', title: 'Carpet Workshop', emoji: '🧶',
  accent: '#a8452f', accentDeep: '#8a3524', skyA: '#fff5f1', skyB: '#f9ded5',
  topic: 'Two-digit multiplication', band: 'g35', lang: 'en',
  objective: 'I can multiply <b>two-digit numbers</b> by splitting each one with an <b>area model</b>.',
  welcome: 'The carpet workshop in Buraidah lays out every rug as a rectangle first — width by length, split at the tens. 🧶',
  learnBlurb: 'Split both numbers at the tens, multiply the four parts, add them.',
  how: {
    what: 'An area model splits a rectangle two ways: 24 becomes 20 + 4 and 8 becomes 8. Every pair of parts makes a small rectangle.',
    steps: ['🧶 Split both numbers into tens and ones.', '🧶 Multiply every pair of parts.', '✅ Add the four small products.'],
  },

  learn: [
    { say: 'A rug is <b>24</b> hand-spans long and <b>13</b> wide. The model splits 24 into <b>20 + 4</b> and 13 into <b>10 + 3</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE4.areaModel(24, 13, { max: 520 }) })); } },
    { say: 'Four small rectangles: <b>20×10 = 200</b>, <b>20×3 = 60</b>, <b>4×10 = 40</b>, <b>4×3 = 12</b>. Add them: <b>312</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.areaModel(24, 13, { show: true, max: 500 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '200 + 60 + 40 + 12 = <b>312</b> square spans' }));
      } },
    { say: 'Your turn: what is <b>32 × 14</b>? Split 32 into 30 + 2 and 14 into 10 + 4.', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE4.areaModel(32, 14, { max: 480 }) }));
        const row = UI.h('div', { class: 'opts' });
        [448, 46, 128].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 448 ? (e.target.classList.add('good'), L.ok('Yes — 300 + 120 + 20 + 8 = 448.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 46 ? 'That adds the two numbers. Four rectangles have to be multiplied.' : 'One of the four rectangles is missing.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar split <b>24</b> into <b>2 and 4</b> and got 20. What did he do wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Twenty-four is 2 and 4, so 13 × 2 = 26 and 13 × 4 = 52. Easy!', 5200);
        el.append(UI.h('div', { html: SCENE4.areaModel(24, 13, { max: 460 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['He split at the digits, not the value. 24 is 20 + 4.', true], ['He split 13 wrongly.', false], ['Nothing — 2 + 4 is 24.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — the split follows place value, so the parts are 20 and 4.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Read the labels on the model. The top shows 20 and 4.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Read the model', icon: '🧶', blurb: 'The cells are blank — work them out.', rounds: 6, think: false,
      say: '🧶 What is the area of the whole rug?',
      round() {
        const a = UI.rint(2, 4) * 10 + UI.rint(1, 9), b = UI.rint(1, 3) * 10 + UI.rint(1, 9);
        const tA = Math.floor(a / 10) * 10, oA = a % 10, tB = Math.floor(b / 10) * 10, oB = b % 10;
        return {
          type: 'number', prompt: G1.art(SCENE4.areaModel(a, b, { max: 520 }), `${a} spans by ${b} spans.`),
          answer: a * b, suffix: '',
          why: (v) => v === tA * tB ? 'That is only the biggest rectangle. There are four.'
            : v === a + b ? 'That adds the two sides. Area multiplies them.'
            : v === (tA + oA) * tB ? 'You used one row of the model — the ones row is missing.'
            : 'Multiply every pair of parts, then add all four products.',
          hints: [`Split ${a} into ${tA} + ${oA} and ${b} into ${tB} + ${oB}.`, `${tA}×${tB} = ${tA * tB}, ${tA}×${oB} = ${tA * oB}.`, `${oA}×${tB} = ${oA * tB} and ${oA}×${oB} = ${oA * oB} too.`],
          solution: `${tA * tB} + ${tA * oB} + ${oA * tB} + ${oA * oB} = <b>${a * b}</b>.`,
        };
      } },
    { name: 'One small rectangle', icon: '🔲', blurb: 'A single partial product.', rounds: 6, think: false,
      say: '🔲 Which product belongs in this cell?',
      round() {
        const tA = UI.rint(2, 6) * 10, oA = UI.rint(2, 9), tB = UI.rint(1, 3) * 10, oB = UI.rint(2, 9);
        const which = UI.pick([['a', 'top'], ['b', 'side']]);
        const answer = which[0] === 'a' ? oA * tB : tA * oB;
        return {
          type: 'number',
          prompt: G1.art(SCENE4.areaModel(tA + oA, tB + oB, { max: 500 }), `The cell where the row labelled ${which[0] === 'a' ? oA : tA} meets the column labelled ${which[0] === 'a' ? tB : oB}.`),
          answer, suffix: '',
          why: (v) => v === (which[0] === 'a' ? oA * oB : tA * tB) ? 'You used a different cell — read the two labels on this one.'
            : v === (which[0] === 'a' ? oA : tA) + (which[0] === 'a' ? tB : oB) ? 'That adds the two labels. The cell is a rectangle, so multiply them.'
            : 'Multiply the row label by the column label for that cell.',
          hints: [`This cell's row is labelled ${which[0] === 'a' ? oA : tA}.`, `Its column is labelled ${which[0] === 'a' ? tB : oB}.`, 'Multiply the two labels.'],
          solution: `${which[0] === 'a' ? oA : tA} × ${which[0] === 'a' ? tB : oB} = <b>${answer}</b>.`,
        };
      } },
    { name: 'Workshop orders', icon: '📖', blurb: 'A rug order worth multiplying.', rounds: 6, think: true,
      say: '📖 Think first: what is being multiplied?',
      round(i) {
        const rows = 2 + (i % 3) * 10 + (i % 2 ? 3 : 6), each = 3 + (i % 4) * 10 + 4;
        return {
          type: 'number',
          problem: {
            sentences: [`A carpet workshop lays out ${rows} rows of tiles for a new rug.`, 'The workshop opens early to avoid the heat.', `Each row holds ${each} tiles.`, 'How many tiles does the rug use?'],
            question: 3, keys: ['each'], extras: [1],
          },
          prompt: 'How many tiles does the rug use?', answer: rows * each, suffix: ' tiles',
          why: (v) => v === rows + each ? 'That adds the rows and the tiles. Multiply them.' : 'Split both numbers at the tens and add the four products.',
          hints: [`${rows} rows, ${each} in a row.`, `Split ${rows} and ${each} at the tens.`, 'Four small rectangles, then add.'],
          solution: `${rows} × ${each} = <b>${rows * each}</b> tiles.`,
        };
      } },
  ],

  ghubar: ['Long numbers? Just add the digits.', 'The biggest rectangle is the whole area.', 'Splitting at the tens is a decoration.'],
  praise: ['Four parts added!', 'Area model read!', 'Tens split right!', 'Rug measured!'],
  finale: 'Every rug laid out — you can multiply with an area model! 🧶',
};

/* ──────────────────────────────────────────────────────────────────────────────────────────────────────
   LESSON — the ten-section نبع/موازي frame for this lesson (rendered by shared/lesson.js).
   Anchored on G04-U01-MATH-L02, Unit 1 of Grade 4: الخوارزميات والحساب وإدارة الموارد.
   The verse frames the VALUE of multiplicative giving. It is NOT a description of the area model —
   the source lesson is explicit on this point, and the note below repeats the caution to the child.
   ────────────────────────────────────────────────────────────────────────────────────────────────────── */
const LESSON = {
  code: 'G04-U01-MATH-L02',
  title: 'الضرب متعدد الأرقام بنماذج المساحة',
  unit: 'الوحدة الأولى: الخوارزميات والحساب وإدارة الموارد',
  story: 'في ورشة السجاد يُوزَّع العمل على صفوف متساوية. حين نعرف عدد الصفوف وما في كل صف، نعرف المساحة كلها. وهكذا في العطاء: القليل المضاعف أعظم من الكثير المنقوص.',
  objectives: [
    'أفكّك عددًا من منزلتين إلى عشرات وآحاد قبل الضرب.',
    'أرسم نموذج المساحة وأملأ خلاياه الأربعة.',
    'أجمع النواتج الجزئية الأربعة وأتحقق من المعقولية.',
    'أشرح لماذا لا يصحّ تفكيك ٢٤ إلى ٢ و٤.',
    'أفسّر المقارنة الضربية: ٣٥ = ٥ × ٧ يعني أن ٣٥ خمسة أضعاف ٧.',
  ],
  roots: ['ح-س-ب', 'ق-د-ر', 'ع-د-د'],
  verse: {
    text: '﴿مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا﴾',
    ref: 'الأنعام: ١٦٠',
  },
  note: 'الآية تدلّ على قيمة المضاعفة في العطاء، وليست وصفًا لخوارزمية الضرب. نأخذ منها المعنى، ونبني الحساب على النموذج.',
  stations: [
    'المحطة الأولى — نموذج مساحة مفرَّغ: يقرأ الطفل الأبعاد ويعيد بناء النواتج الجزئية.',
    'المحطة الثانية — ناتج جزئي واحد: الخطوة التي يتركها الأطفال عادةً.',
    'المحطة الثالثة — مسألة كلامية في سياق الورشة.',
  ],
  blocks: ['٥ د تشخيص', '٧ د تمهيد قرآني', '١٠ د مثال محلول', '١٥ د محطات', '١٠ د مناقشة', '٨ د خروج', '٥ د مراجعة'],
  exit: [
    { grade: 'أ', text: 'أفكّك ٣٦ × ٤٢ إلى أربعة نواتج جزئية.' },
    { grade: 'ب', text: 'أرسم نموذج المساحة لهذين العددين.' },
    { grade: 'ج', text: 'أشرح لماذا ٣٦ × ٤٢ ≠ ٣ × ٦ × ٤ × ٢.' },
    { grade: 'د', text: 'أعطي مثالًا من واقعي تُضاعف فيه الحسنة عشرًا.' },
  ],
  criterion: 'يجيب الطفل ثلاثة من أربعة بنود بلا مساعدة، ويشرح البند (ج) بكلماته.',
  homework: [
    'بلا شاشات: ارسم نموذج مساحة لجدول غرفة في بيتك ثم احسب مساحتها.',
    'اكتب ثلاث جمل تصف فيها مضاعفة العمل الصالح في يومك.',
  ],
  reflect: 'اسأل نفسك: أيّ خطوة كانت أصعب — التفكيك أم الجمع؟ ولماذا؟',
};
