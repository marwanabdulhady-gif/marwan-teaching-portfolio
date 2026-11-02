/**
 * The question bank is served as a static file and fetched on demand, so the
 * 108 KB bank never lands in the initial bundle.
 */
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint?: string;
  explanation?: string;
  optionFeedback?: (string | null)[];
}

type Bank = Record<string, Question>;

let pending: Promise<Bank> | null = null;

const normalise = (data: Bank | Question[]): Bank =>
  Array.isArray(data) ? Object.fromEntries(data.map((question) => [question.id, question])) : data;

/**
 * Load every question: the academy bank (static file), the authored courses and
 * the GMAT bank (each its own chunk). If the network fails the two local sets
 * still work, so practice never turns into an error screen.
 */
export function loadQuestions(): Promise<Bank> {
  if (!pending) {
    const remote = fetch('/courses/questions.json')
      .then((response) => (response.ok ? response.json() : {}))
      .then(normalise)
      .catch(() => ({}) as Bank);
    const authored = import('./data/authoredQuestions').then((module) => module.AUTHORED_BANK);
    const gmat = import('./data/gmatQuestions').then((module) => module.GMAT_BANK);
    pending = Promise.all([remote, authored, gmat]).then(([bank, extra, exam]) => ({
      ...bank,
      ...extra,
      ...exam,
    }));
  }
  return pending;
}

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', n: 'ⁿ', x: 'ˣ',
};

const GREEK: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', theta: 'θ', lambda: 'λ',
  mu: 'μ', pi: 'π', sigma: 'σ', phi: 'φ', omega: 'ω', infty: '∞',
};

/** Braced argument after a command, e.g. the `{x}` in `\sqrt{x}`. */
function braced(text: string, start: number): [string, number] | null {
  if (text[start] !== '{') return null;
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return [text.slice(start + 1, i), i + 1];
    }
  }
  return null;
}

/** Turn the LaTeX in the question bank into readable Unicode, no KaTeX needed. */
export function formatMath(input: string): string {
  let text = input;
  text = text.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, a: string, b: string) =>
    b.includes(' ') || /[+\-]/.test(b) ? `(${a})/(${b})` : `${a}/${b}`,
  );
  text = text.replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)');
  text = text.replace(/\\text\s*\{([^{}]*)\}/g, '$1');
  text = text.replace(/\\(?:left|right|displaystyle|limits)\s*/g, '');
  text = text.replace(/\\[,;:!]/g, ' ');
  text = text.replace(/\\quad|\\qquad/g, '  ');
  text = text.replace(/\\(sin|cos|tan|sec|csc|cot|log|ln|lim|max|min|arcsin|arccos|arctan)\b/g, '$1');
  text = text.replace(/\\to\b/g, '→');
  text = text.replace(/\\cdot\b/g, '·');
  text = text.replace(/\\times\b/g, '×');
  text = text.replace(/\\pm\b/g, '±');
  text = text.replace(/\\le\b|\\leq\b/g, '≤');
  text = text.replace(/\\ge\b|\\geq\b/g, '≥');
  text = text.replace(/\\ne\b|\\neq\b/g, '≠');
  text = text.replace(/\\approx\b/g, '≈');
  text = text.replace(/\\([a-zA-Z]+)/g, (match, name: string) => GREEK[name] ?? match);
  text = text.replace(/\^\{([^{}]+)\}/g, (_, body: string) =>
    body.split('').map((char) => SUPERSCRIPT[char] ?? char).join(''),
  );
  text = text.replace(/\^(-?\w)/g, (_, char: string) => SUPERSCRIPT[char] ?? `^${char}`);
  text = text.replace(/_\{([^{}]+)\}/g, (_match, body: string) => `_${body}`);
  text = text.replace(/\s*=\s*/g, ' = ');
  text = text.replace(/\$\$/g, '').replace(/\$/g, '');
  text = text.replace(/\\/g, '');
  return text.replace(/\s+/g, ' ').trim();
}

/** Split text into plain and maths runs so maths can be shown in mono. */
export function mathRuns(input: string): { text: string; math: boolean }[] {
  const parts: { text: string; math: boolean }[] = [];
  const regex = /\$([^$]+)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input))) {
    if (match.index > last) parts.push({ text: formatMath(input.slice(last, match.index)), math: false });
    parts.push({ text: formatMath(match[1]), math: true });
    last = match.index + match[0].length;
  }
  if (last < input.length) parts.push({ text: formatMath(input.slice(last)), math: false });
  return parts.filter((part) => part.text.length > 0);
}
