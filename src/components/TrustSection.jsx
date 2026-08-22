import React, { memo } from "react";
import { Users, Briefcase, PlayCircle } from "lucide-react";

const BG = "#FFFFFF";
const INK_TEXT = "#241F3D";
const MUTED = "#6E6789";
const VIOLET = "#7C6AE8";
const VIOLET_DEEP = "#5B4FC4";
const VIOLET_SOFT = "#EDEAFB";
const VIOLET_LINE = "#B7ACF2";

// ---- Static data: allocated once at module load, never re-created. ----

const CARDS = [
  {
    id: "students",
    eyebrow: "Our Reach",
    icon: Users,
    stat: "1000+",
    title: "Students Trained",
    desc: "In Digital Marketing and AI Excellence.",
  },
  {
    id: "practical",
    eyebrow: "Our Method",
    icon: Briefcase,
    stat: "100%",
    title: "Practical Training",
    desc: "Hands-on learning with real internship opportunities.",
  },
  {
    id: "environment",
    eyebrow: "Our Space",
    icon: PlayCircle,
    stat: "",
    title: "Learning Environment",
    desc: "Expert-led training inside modern infrastructure.",
  },
];

const CIRCUIT_PATHS = [
  "M380 300 L440 300 L440 330 L470 330",
  "M820 300 L760 300 L760 330 L730 330",
  "M600 520 L600 490",
];

const CIRCUIT_NODES = [
  [380, 300],
  [820, 300],
  [600, 520],
];

// ---- Static style objects, hoisted out of components so JSX never ----
// ---- re-allocates a fresh object on a render that memo lets through. ----

const spokeIconStyle = { backgroundColor: VIOLET_SOFT, color: VIOLET_DEEP };

const spokeCardStyle = {
  backgroundColor: "#FFFFFF",
  borderColor: "rgba(124,106,232,0.18)",
  boxShadow: "0 8px 30px rgba(124,106,232,0.10)",
};

const eyebrowStyle = { color: MUTED };
const statStyle = { color: VIOLET_DEEP };
const titleStyle = { color: INK_TEXT };
const descStyle = { color: MUTED };

const corePulseStyle = {
  background: `radial-gradient(circle, ${VIOLET} 0%, ${VIOLET_LINE} 55%, transparent 75%)`,
  opacity: 0.22,
};

const coreSpinStyle = {
  background: `conic-gradient(from 0deg, ${VIOLET_DEEP}, transparent 35%, ${VIOLET}, transparent 75%, ${VIOLET_DEEP})`,
  padding: 2,
};

const coreSpinMaskStyle = { backgroundColor: BG };

const coreInnerStyle = {
  background: `radial-gradient(circle at 50% 35%, ${VIOLET_SOFT}, #FFFFFF)`,
  border: "1px solid rgba(124,106,232,0.16)",
  boxShadow: "0 10px 40px rgba(124,106,232,0.14)",
};

const coreEyebrowStyle = { color: VIOLET_DEEP };
const coreTitleStyle = { color: INK_TEXT };

const sectionBgStyle = { backgroundColor: BG };

const gridTextureStyle = {
  backgroundImage:
    "linear-gradient(rgba(124,106,232,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,232,0.05) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

const posLeft = { left: "3.3%", top: "27.7%" };
const posRight = { right: "3.3%", top: "27.7%" };
const posBottom = { left: "50%", top: "72.2%", transform: "translateX(-50%)" };

// Keyframes live in one hoisted string so the <style> tag's text content
// is never re-computed; SectionInner only needs to mount it once.
const KEYFRAMES = `
  @keyframes core-spin-kf { to { transform: rotate(360deg); } }
  @keyframes core-pulse-kf { 0%, 100% { opacity: .18; transform: scale(1); } 50% { opacity: .3; transform: scale(1.06); } }
  @keyframes dash-flow-kf { to { stroke-dashoffset: -24; } }
  .core-spin { animation: core-spin-kf 14s linear infinite; }
  .core-pulse { animation: core-pulse-kf 5s ease-in-out infinite; }
  .circuit-dash { stroke-dasharray: 6 6; animation: dash-flow-kf 1.6s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .core-spin, .core-pulse, .circuit-dash { animation: none; }
  }
`;

// ---- Components ----

const SpokeIcon = memo(function SpokeIcon({ icon: Icon }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={spokeIconStyle}>
      <Icon size={20} aria-hidden="true" />
    </div>
  );
});

const SpokeCard = memo(function SpokeCard({ card, align = "left" }) {
  const { icon, eyebrow, stat, title, desc } = card;
  const rowClass =
    align === "right"
      ? "flex items-start gap-3 flex-row-reverse text-right"
      : "flex items-start gap-3";

  return (
    <article
      className="pointer-events-auto w-full max-w-[300px] rounded-2xl border p-5"
      style={spokeCardStyle}
    >
      <div className={rowClass}>
        <SpokeIcon icon={icon} />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={eyebrowStyle}>
            {eyebrow}
          </p>
          {stat && (
            <p className="mt-0.5 text-2xl font-bold leading-none" style={statStyle}>
              {stat}
            </p>
          )}
        </div>
      </div>
      <h3 className="mt-3 text-base font-semibold" style={titleStyle}>
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed" style={descStyle}>
        {desc}
      </p>
    </article>
  );
});

// Static gradient-ring core. No JS-driven animation loop; CSS handles motion
// off the main thread, and reduced-motion is respected via media query.
const LearningCore = memo(function LearningCore() {
  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      <div className="core-pulse absolute inset-0 rounded-full blur-3xl" style={corePulseStyle} aria-hidden="true" />
      <div className="core-spin absolute inset-0 rounded-full" style={coreSpinStyle} aria-hidden="true">
        <div className="h-full w-full rounded-full" style={coreSpinMaskStyle} />
      </div>
      <div
        className="relative z-10 flex h-[85%] w-[85%] flex-col items-center justify-center rounded-full text-center px-6"
        style={coreInnerStyle}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={coreEyebrowStyle}>
          Creative Adhyayan
        </p>
        <p className="mt-2 text-lg font-bold leading-snug sm:text-xl" style={coreTitleStyle}>
          Empowering India With Digital Skills.
        </p>
      </div>
    </div>
  );
});

const CircuitLines = memo(function CircuitLines() {
  return (
    <svg
      viewBox="0 0 1200 720"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={VIOLET} stopOpacity="0.55" />
          <stop offset="100%" stopColor={VIOLET} stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {CIRCUIT_PATHS.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="circuit-dash"
        />
      ))}
      {CIRCUIT_NODES.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={VIOLET} />
      ))}
    </svg>
  );
});

// Single stylesheet block, mounted once per section instance rather than
// re-injected on every render (the component itself is memoized as a whole).
const SectionInner = memo(function SectionInner() {
  const [students, practical, environment] = CARDS;
  return (
    <div className="relative w-full px-4 py-20 sm:px-8" style={sectionBgStyle}>
      <style>{KEYFRAMES}</style>

      <div className="pointer-events-none absolute inset-0 opacity-50" style={gridTextureStyle} aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <h2 className="sr-only">Our Learning Environment</h2>

        {/* desktop hub layout */}
        <div className="relative hidden aspect-[1200/720] w-full lg:block">
          <CircuitLines />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LearningCore />
          </div>
          <div className="absolute" style={posLeft}>
            <SpokeCard card={students} />
          </div>
          <div className="absolute" style={posRight}>
            <SpokeCard card={practical} align="right" />
          </div>
          <div className="absolute" style={posBottom}>
            <SpokeCard card={environment} />
          </div>
        </div>

        {/* mobile / tablet stacked layout */}
        <div className="flex flex-col items-center gap-8 lg:hidden">
          <LearningCore />
          <div className="flex w-full flex-col items-center gap-4">
            {CARDS.map((c) => (
              <SpokeCard key={c.id} card={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// No pixel-swap intro animation, no measurement pass, no ResizeObserver,
// no mount-delay timer, no extra wrapper state. Renders directly on first paint.
export default function LearningEnvironmentSection() {
  return (
    <section className="relative w-full" aria-label="Learning environment">
      <SectionInner />
    </section>
  );
}