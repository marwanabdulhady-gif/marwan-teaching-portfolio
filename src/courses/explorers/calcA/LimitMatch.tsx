/**
 * Chapter 1 review · Match each graph with what its limit does.
 *
 * Six hand-drawn mini graphs and six verdicts. Built on the shared MatchGame,
 * so it works by clicking or with Tab + Enter only.
 */
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point } from '../../viz/MathPlot';
import MatchGame, { type MatchPair } from '../../viz/MatchGame';
import { pick } from '../../viz/controls';
import type { ExplorerProps } from '../types';
import type { Bi } from '../../../teachingData';

const strings = {
  prompt: {
    en: 'Pair each graph with what happens at the marked point.',
    ar: 'طابق كل تمثيل بما يحدث عند النقطة المعلّمة.',
  },
  at: { en: 'at the marked point', ar: 'عند النقطة المعلّمة' },
} satisfies Record<string, Bi>;

const X = 2;

const graph = (fn: (x: number) => number, mark?: { y: number; hollow?: boolean }, second?: (x: number) => number) => (
  <MathPlot xDomain={[0, 4]} yDomain={[-2, 6]} grid={false} ariaLabel="mini graph">
    <Curve fn={fn} width={2.5} />
    {second && <Curve fn={second} width={2.5} />}
    {mark && <Point x={X} y={mark.y} hollow={mark.hollow} r={4} color={mark.hollow ? 'var(--t-accent)' : 'var(--t-sun)'} />}
  </MathPlot>
);

const PAIRS: MatchPair[] = [
  {
    id: 'limit-exists-value-differs',
    visual: graph((x) => (Math.abs(x - X) < 1e-9 ? NaN : 0.5 * x * x), { y: 0, hollow: false }),
    visualLabel: 'hole with a value elsewhere',
    verdict: 'lim = 2, f(2) = 0',
    reason: 'Both sides approach 2; the value sits below it, so the limit exists but continuity fails.',
  },
  {
    id: 'jump',
    visual: graph((x) => (x < X ? x : x + 2), { y: 4 }),
    visualLabel: 'jump at the marked point',
    verdict: 'DNE — one-sided limits differ',
    reason: 'The left approaches 2 and the right approaches 4, so there is no two-sided limit.',
  },
  {
    id: 'hole',
    visual: graph((x) => (Math.abs(x - X) < 1e-9 ? NaN : x + 1), { y: 3, hollow: true }),
    visualLabel: 'removable hole',
    verdict: 'lim = 3, f(2) undefined',
    reason: 'The limit is the value the curve heads for, whether or not the point exists.',
  },
  {
    id: 'infinite',
    visual: graph((x) => (Math.abs(x - X) < 1e-9 ? NaN : 1 / Math.abs(x - X))),
    visualLabel: 'vertical asymptote',
    verdict: 'lim = +∞',
    reason: 'Both sides grow without bound, so the limit is infinite (the line x = 2 is an asymptote).',
  },
  {
    id: 'smooth',
    visual: graph((x) => 0.4 * x * x + 1, { y: 2.6 }),
    visualLabel: 'smooth curve',
    verdict: 'continuous at the point',
    reason: 'The value, the limit and the point all agree — the classic three-condition pass.',
  },
  {
    id: 'cos',
    visual: graph((x) => 2 + Math.cos(x * 2), { y: 2 + Math.cos(4) }, (x) => (x < X ? 2 + Math.cos(x * 2) : NaN)),
    visualLabel: 'oscillating curve',
    verdict: 'value and limit agree',
    reason: 'An oscillation here is smooth; the function value sits exactly on the curve.',
  },
];

export default function LimitMatch({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.at, isRtl)}</p>
      <MatchGame pairs={PAIRS} prompt={strings.prompt} onInteract={onInteract} />
    </div>
  );
}
