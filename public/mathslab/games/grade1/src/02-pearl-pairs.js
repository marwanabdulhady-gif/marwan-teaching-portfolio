/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Pearl Market · comparing two groups to 20: more, fewer, the same (draft G01-MAT step 2)
   Mechanic = the thinking: the child pairs one pearl from each tray in level 1 (matching produces the
   comparison), then compares counted groups, then has to name the comparison in words. Level 2 uses
   CUBES because the comparison is stated as a small word problem.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const pearlPair = (a, b) => {
  const W = 520, H = 250, per = 5, rows = 4;
  let body = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="#fff6e6" stroke="#4a2f15" stroke-width="2.5"/>`;
  [[a, 22, '#7bdff2', 'Tray A'], [b, 268, '#a9577a', 'Tray B']].forEach(([n, ox, col, name]) => {
    body += `<rect x="${ox}" y="18" width="230" height="196" rx="14" fill="#fff" stroke="#4a2f15" stroke-width="2"/>`;
    /* rows are centred, so a short second row reads as leftovers rather than as confusion */
    for (let r = 0; r < rows; r++) {
      const inRow = Math.min(per, n - r * per);
      if (inRow <= 0) continue;
      const span = (inRow - 1) * 42;
      for (let c = 0; c < inRow; c++) {
        const x = ox + 115 - span / 2 + c * 42, y = 52 + r * 38;
        body += `<circle cx="${x}" cy="${y}" r="13" fill="${col}" stroke="#4a2f15" stroke-width="1.2"/><circle cx="${x - 4}" cy="${y - 4}" r="3.4" fill="#fff" opacity=".75"/>`;
      }
    }
    body += `<text x="${ox + 115}" y="206" text-anchor="middle" font-size="17" font-weight="800" fill="#4a2f15">${name}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="tray A with ${a} pearls and tray B with ${b} pearls" style="width:100%;max-width:${W}px;display:block;margin:0 auto">${body}</svg>`;
};

const GAME = {
  id: 'g1-pearl-pairs', code: 'G01-MAT-02', title: 'Pearl Market', emoji: '🦪',
  accent: '#a9577a', accentDeep: '#7d3d59', skyA: '#fdf1f5', skyB: '#f6dbe4',
  topic: 'Comparing groups to 20', band: 'k2', lang: 'en',
  objective: 'I can compare two groups and say which has <b>more</b>, which has <b>fewer</b>, or whether they are the <b>same</b>.',
  welcome: 'The pearl divers are back! Two trays are ready at the souq. 🦪',
  learnBlurb: 'Pair one pearl with one pearl — the tray with pearls left over has more.',
  how: {
    what: 'Match one pearl from each tray. What is left over tells you which tray has more.',
    steps: ['🤝 Draw a line from one pearl to one pearl.', '🔍 Any pearl without a partner is extra.', '✅ More, fewer, or the same — say which.'],
  },

  learn: [
    { say: 'Two trays of pearls at the Jeddah souq. Which tray has <b>more</b>?',
      draw(el) { el.append(UI.h('div', { html: pearlPair(9, 7) })); } },
    { say: 'Match one pearl to one pearl. Tray A has <b>2 left over</b>, so Tray A has more.',
      draw(el) {
        el.append(UI.h('div', { html: pearlPair(9, 7) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '7 pearls find a partner in both trays. Tray A still has <b>2</b> unpaired.' }));
      } },
    { say: 'Your turn: both trays have the same number. What can you say?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: pearlPair(8, 8) }));
        const row = UI.h('div', { class: 'opts' });
        [['The trays are the same.', true], ['Tray A has more.', false], ['Tray B has more.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — every pearl found a partner, so the groups are the same.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Every pearl has a partner. So is either tray bigger?', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar chose the tray with the <b>bigger</b> pearls. What should he compare?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Big pearls! Bigger is more, right? Hee hee!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['How many pearls are in each tray.', true], ['How shiny the pearls are.', false], ['Which tray is wider.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — we compare how many, not how big.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Counting tells you more or fewer, not size.', 'bad')),
        })));
        el.append(UI.h('div', { html: pearlPair(6, 10) }), row);
      } },
  ],

  levels: [
    { name: 'Pair them up', icon: '🤝', blurb: 'Match the pearls to compare.', rounds: 4, think: false,
      say: '🤝 Pair one pearl with one pearl.',
      round() {
        let a = UI.rint(4, 12), b = UI.rint(4, 12);
        if (a === b) b += 1;
        const answer = a > b ? 'Tray A has more' : 'Tray B has more';
        return {
          type: 'choice', prompt: G1.art(pearlPair(a, b), `Tray A has ${a} pearls. Tray B has ${b} pearls.`),
          options: ['Tray A has more', 'Tray B has more', 'The trays are the same'], answer,
          why: (v) => v === 'The trays are the same' ? `Not the same — one tray has ${Math.abs(a - b)} pearls without a partner.` : 'Pair them up: count the pearls left without a partner.',
          hints: ['Pair one pearl from Tray A with one from Tray B.', 'Which tray runs out of pearls first?', `Tray A has ${a}, Tray B has ${b}.`],
          solution: `${Math.max(a, b)} against ${Math.min(a, b)} leaves <b>${Math.abs(a - b)}</b> unpaired, so ${answer.toLowerCase()}.`,
        };
      } },
    { name: 'Pass the word', icon: '💬', blurb: 'Say which has fewer.', rounds: 4, think: false,
      say: '💬 Now say which tray has fewer.',
      round() {
        const a = UI.rint(6, 16), b = UI.rint(6, 16);
        const ans = a < b ? 'Tray A has fewer' : a > b ? 'Tray B has fewer' : 'Same number';
        return {
          type: 'choice', prompt: G1.art(pearlPair(a, b), 'Compare the trays.'),
          options: ['Tray A has fewer', 'Tray B has fewer', 'Same number'], answer: ans,
          why: () => 'Fewer means the tray with less. Pair the pearls and see which runs out first.',
          hints: ['Fewer is the smaller group.', 'Pair them one for one.', `The counts are ${a} and ${b}.`],
          solution: `With ${a} and ${b}, the smaller tray has fewer: <b>${ans}</b>.`,
        };
      } },
    { name: 'Market story', icon: '📖', blurb: 'More or fewer in a market story.', rounds: 4,
      say: '📖 Think first, then compare.',
      round(i) {
        const a = 8 + i, b = a + 2;
        return {
          type: 'choice',
          problem: {
            sentences: [`Noor counts ${a} pearls in the first tray.`, 'The diver\'s basket is still wet.', `She counts ${b} pearls in the second tray.`, 'How many fewer pearls are in the first tray?'],
            question: 3, keys: ['fewer'], extras: [1],
          },
          prompt: 'How many <b>fewer</b> pearls are in the first tray?',
          options: G1.opts(2, [b, a + b, 1, 3]), answer: 2,
          why: (v) => Number(v) === b ? 'That is all the pearls in the second tray. We want the difference.' : Number(v) === a + b ? 'You added. Fewer means how many less.' : 'Count the pearls left without a partner.',
          hints: ['Which sentence tells you how many less to find?', `${b} pearls and ${a} pearls.`, `${b} − ${a} = ?`],
          solution: `${b} − ${a} = <b>2</b> fewer pearls in the first tray.`,
        };
      } },
  ],

  ghubar: ['Big pearl means more pearl. Obviously!', 'Ten and eleven are the same. Almost!', 'I compare trays by how full they look.'],
  praise: ['Paired up perfectly!', 'More, fewer — you know it!', 'Sharp comparing!', 'Not fooled by size!'],
  finale: 'Every tray compared — more, fewer and the same! 🦪',
};
