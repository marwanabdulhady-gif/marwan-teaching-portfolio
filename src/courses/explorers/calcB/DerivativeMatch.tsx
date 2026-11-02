/**
 * Chapter 2 review · Match each function with its derivative.
 *
 * Same mechanic as the Chapter 1 game, so both reviews feel like one family.
 */
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point } from '../../viz/MathPlot';
import MatchGame, { type MatchPair } from '../../viz/MatchGame';
import { pick } from '../../viz/controls';
import type { ExplorerProps } from '../types';
import type { Bi } from '../../../teachingData';

const strings = {
  prompt: {
    en: 'Pair each f with its derivative.',
    ar: 'طابق كل دالة مع مشتقتها.',
  },
  note: {
    en: 'The plotted curve is the derivative; the label is the original function.',
    ar: 'المنحنى المرسوم هو المشتقة، والملصق هو الدالة الأصلية.',
  },
} satisfies Record<string, Bi>;

const graph = (fn: (x: number) => number, mark?: [number, number]) => (
  <MathPlot xDomain={[-3, 3]} yDomain={[-6, 6]} grid={false} ariaLabel="derivative graph">
    <Curve fn={fn} width={2.5} />
    {mark && <Point x={mark[0]} y={mark[1]} r={4} color="var(--t-sun)" />}
  </MathPlot>
);

const PAIRS: MatchPair[] = [
  {
    id: 'cube',
    visual: graph((x) => 3 * x * x, [1, 3]),
    visualLabel: 'upward parabola through the origin',
    verdict: 'f(x) = x³',
    reason: 'Power rule: 3x². The turning point of f at 0 becomes a zero of f′.',
  },
  {
    id: 'square',
    visual: graph((x) => 2 * x),
    visualLabel: 'straight line through the origin',
    verdict: 'f(x) = x²',
    reason: 'The slope of x² is 2x at every point.',
  },
  {
    id: 'sin',
    visual: graph((x) => Math.cos(x), [0, 1]),
    visualLabel: 'wave peaking at x = 0',
    verdict: 'f(x) = sin x',
    reason: '(sin x)′ = cos x, so the peak of sin at π/2 becomes a zero of the derivative.',
  },
  {
    id: 'exp',
    visual: graph((x) => Math.exp(x)),
    visualLabel: 'rising curve, never zero',
    verdict: 'f(x) = eˣ',
    reason: 'eˣ is its own derivative — the curve and its slope are identical.',
  },
  {
    id: 'ln',
    visual: graph((x) => (x <= 0 ? NaN : 1 / x)),
    visualLabel: 'hyperbola in the first quadrant',
    verdict: 'f(x) = ln x',
    reason: '(ln x)′ = 1/x, which blows up at 0 and flattens as x grows.',
  },
  {
    id: 'abs',
    visual: graph((x) => (Math.abs(x) < 1e-6 ? NaN : Math.sign(x)), [-1, -1]),
    visualLabel: 'two flat steps with a gap',
    verdict: 'f(x) = |x|',
    reason: 'The slope is −1 then +1 with nothing in between: not differentiable at 0.',
  },
];

export default function DerivativeMatch({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.note, isRtl)}</p>
      <MatchGame pairs={PAIRS} prompt={strings.prompt} onInteract={onInteract} />
    </div>
  );
}
