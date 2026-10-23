import { useLocale } from '../LocaleContext';
import { CREDENTIALS_BAR } from '../teachingData';

/**
 * Academic credentials strip — the template's logo bar, reworked as a marquee
 * of real qualifications. Logos are intentionally not hotlinked (no stable
 * public URLs exist for these institutions), so each entry is typeset instead.
 */
export default function CredentialsBar() {
  const { isRtl, t } = useLocale();

  // Duplicated once so the -50% translate loops seamlessly.
  const reel = [...CREDENTIALS_BAR, ...CREDENTIALS_BAR];

  return (
    <div className="relative py-8 border-y border-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_35%,transparent)] overflow-hidden">
      <p className="text-center text-[0.58rem] uppercase tracking-[0.28em] text-cyan-400/80 font-semibold mb-6">
        {isRtl ? 'المؤهلات الأكاديمية والانتماءات المهنية' : 'Academic Credentials & Affiliations'}
      </p>

      <div
        className="teach-marquee-track relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="teach-anim-marquee flex w-max gap-12 px-6">
          {reel.map((cred, i) => (
            <div key={`${cred.short.en}-${i}`} className="flex items-center gap-3 shrink-0" aria-hidden={i >= CREDENTIALS_BAR.length}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 shrink-0" />
              <div className="leading-tight text-start">
                <p className="text-[0.85rem] font-semibold text-[color-mix(in_srgb,var(--t-ink)_90%,transparent)] whitespace-nowrap">
                  {isRtl ? cred.short.ar : cred.short.en}
                </p>
                <p className="text-[0.62rem] text-[color-mix(in_srgb,var(--t-ink)_45%,transparent)] whitespace-nowrap">
                  {isRtl ? cred.detail.ar : cred.detail.en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only">{t('teach.creds.sr')}</p>
    </div>
  );
}
