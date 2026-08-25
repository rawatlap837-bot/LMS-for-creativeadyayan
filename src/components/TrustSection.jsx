import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Users, Briefcase, PlayCircle, GraduationCap } from "lucide-react";
import CircularText from "../Animiations/CircularText";
import CALogo from "../assets/Images/CA.png";

const BG = "#FFFFFF";
const INK_TEXT = "#241F3D";
const MUTED = "#6E6789";
const VIOLET = "#7C6AE8";
const VIOLET_DEEP = "#5B4FC4";
const VIOLET_SOFT = "#EDEAFB";
const VIOLET_LINE = "#B7ACF2";

// ---- Static data: allocated once at module load, never re-created. ----
// Order maps to grid cells (row-major): top-left, top-right, bottom-left,
// bottom-right — matching the 2x2 layout with the core sitting in the
// gap between all four.

const CARDS = [
  {
    id: "teachers",
    eyebrow: "Our Faculty",
    icon: GraduationCap,
    stat: "20+",
    title: "Professional Teachers",
    desc: "Industry experts who bring real-world experience to every class.",
    corner: "top-left",
  },
  {
    id: "practical",
    eyebrow: "Our Method",
    icon: Briefcase,
    stat: "100%",
    title: "Practical Training",
    desc: "Hands-on learning with real internship opportunities.",
    corner: "top-right",
  },
  {
    id: "students",
    eyebrow: "Our Reach",
    icon: Users,
    stat: "1000+",
    title: "Students Trained",
    desc: "In Digital Marketing and AI Excellence.",
    corner: "bottom-left",
  },
  {
    id: "environment",
    eyebrow: "Our Space",
    icon: PlayCircle,
    stat: "",
    title: "Learning Environment",
    desc: "Expert-led training inside modern infrastructure.",
    corner: "bottom-right",
  },
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

const sectionBgStyle = { backgroundColor: BG };

const gridTextureStyle = {
  backgroundImage:
    "linear-gradient(rgba(124,106,232,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,232,0.05) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

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
      className="pointer-events-auto w-full max-w-[320px] rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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

// Logo-centered core. Outer conic ring + pulse glow stay CSS-only and
// off the main thread. A CircularText ring spins between the outer ring
// and the inner circle, which holds the CA logo. Accepts a ref + onLoad
// so the parent can measure its real rendered circle and re-measure once
// the logo image finishes loading (image load can shift layout height).
const LearningCore = memo(function LearningCore({ coreRef, onLogoLoad }) {
  return (
    <div ref={coreRef} className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      <div className="core-pulse absolute inset-0 rounded-full blur-3xl" style={corePulseStyle} aria-hidden="true" />

      <div className="core-spin absolute inset-0 rounded-full" style={coreSpinStyle} aria-hidden="true">
        <div className="h-full w-full rounded-full" style={coreSpinMaskStyle} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <CircularText
          text="EMPOWERING*INDIA*WITH*DIGITAL*SKILLS*"
          onHover="slowDown"
          spinDuration={24}
          size={225}
          fontSize={15}
          textColor="#6E63CB"
        />
      </div>

      <div
        className="relative z-10 flex h-[62%] w-[62%] flex-col items-center justify-center rounded-full text-center px-4"
        style={coreInnerStyle}
      >
        <img
          src={CALogo}
          alt="Creative Adhyayan"
          className="h-30 w-30 object-contain sm:h-40 sm:w-40"
          draggable="false"
          onLoad={onLogoLoad}
        />
      </div>
    </div>
  );
});

// Draws each connector as a right-angle elbow path — horizontal run out
// of the card, a hard 90° turn, then a vertical run straight into the
// core's top or bottom edge. This replaces the earlier direct diagonal
// line: the elbow point and both endpoints are computed from real
// measured geometry (see recomputeLines), so the corner is always an
// exact 90°, never an approximation, regardless of gap size or viewport.
const ConnectorLines = memo(function ConnectorLines({ lines }) {
  if (!lines.length) return null;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      {lines.map((line) => (
        <g key={line.id}>
          <path
            d={line.d}
            fill="none"
            stroke={VIOLET}
            strokeOpacity={0.45}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="miter"
            className="circuit-dash"
          />
          <circle cx={line.startX} cy={line.startY} r={4} fill={VIOLET} />
          <circle cx={line.endX} cy={line.endY} r={4} fill={VIOLET} />
        </g>
      ))}
    </svg>
  );
});

// Single stylesheet block, mounted once per section instance rather than
// re-injected on every render (the component itself is memoized as a whole).
//
// Spacing pass: horizontal gap widened further (gap-x-80) so the
// connector lines stretch further across the page, while the vertical
// gap between the top and bottom card rows is tightened (gap-y-20,
// py-12) so the two rows sit closer together.
const SectionInner = memo(function SectionInner() {
  const [teachers, practical, students, environment] = CARDS;

  const gridRef = useRef(null);
  const coreRef = useRef(null);
  const mobileCoreRef = useRef(null);
  const cardRefs = useRef({});
  const [lines, setLines] = useState([]);

  // Each connector enters the core's circle at its own distinct point,
  // offset by this angle (degrees) from straight-up (top cards) or
  // straight-down (bottom cards), instead of all cards on a row sharing
  // the exact same entry point. Sharing one point made two same-height
  // cards' lines run at the same y and terminate at the same (x, y) —
  // visually indistinguishable from a single line spanning both cards.
  // A fixed per-side angular offset keeps each connector visibly
  // separate while still meeting the circle's boundary exactly.
  const PORT_ANGLE_DEG = 34;

  // Computes each connector as an elbow path from real, current DOM
  // geometry: start at the card's inner edge (vertically centered on
  // the card), run horizontally to this card's own port x on the core's
  // circle, then turn 90° and run vertically into that port. Runs on
  // mount, on resize, and whenever the core's logo image finishes
  // loading (which can change the core's rendered size after first
  // paint).
  const recomputeLines = useCallback(() => {
    const gridEl = gridRef.current;
    const coreEl = coreRef.current;
    if (!gridEl || !coreEl) return;

    const gridRect = gridEl.getBoundingClientRect();
    const coreRect = coreEl.getBoundingClientRect();
    const coreCenter = {
      x: coreRect.left + coreRect.width / 2 - gridRect.left,
      y: coreRect.top + coreRect.height / 2 - gridRect.top,
    };
    const coreRadius = coreRect.width / 2;
    const angleRad = (PORT_ANGLE_DEG * Math.PI) / 180;

    const nextLines = CARDS.map((card) => {
      const cardEl = cardRefs.current[card.id];
      if (!cardEl) return null;

      const cardRect = cardEl.getBoundingClientRect();
      const isRightSide = card.corner.endsWith("right");
      const isTop = card.corner.startsWith("top");

      // Start: the edge of the card facing the core, vertically
      // centered on the card.
      const startX = (isRightSide ? cardRect.left : cardRect.right) - gridRect.left;
      const startY = cardRect.top + cardRect.height / 2 - gridRect.top;

      // Each card gets its own port on the circle: rotated left of
      // top-center for left-side cards, right of top-center for
      // right-side cards (mirrored for the bottom row). This is what
      // actually separates the four lines instead of letting two of
      // them collapse onto the same point.
      const sideSign = isRightSide ? 1 : -1;
      const verticalSign = isTop ? -1 : 1;
      const endX = coreCenter.x + sideSign * coreRadius * Math.sin(angleRad);
      const endY = coreCenter.y + verticalSign * coreRadius * Math.cos(angleRad);

      // Elbow sits directly above/below the start point, at the port's
      // x — so the horizontal run and vertical run are still a true
      // 90°, just landing on this card's own port instead of a shared
      // one.
      const elbowX = endX;
      const elbowY = startY;

      const d = `M ${startX} ${startY} L ${elbowX} ${elbowY} L ${endX} ${endY}`;

      return { id: card.id, d, startX, startY, endX, endY };
    }).filter(Boolean);

    setLines(nextLines);
  }, []);

  useEffect(() => {
    recomputeLines();

    const observer = new ResizeObserver(() => recomputeLines());
    if (gridRef.current) observer.observe(gridRef.current);
    if (coreRef.current) observer.observe(coreRef.current);
    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el));

    window.addEventListener("resize", recomputeLines);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recomputeLines);
    };
  }, [recomputeLines]);

  const registerCardRef = (id) => (el) => {
    cardRefs.current[id] = el;
  };

  return (
    <div className="relative w-full px-4 pt-20 pb-20 sm:px-8 sm:pt-0 sm:pb-0" style={sectionBgStyle}>
      <style>{KEYFRAMES}</style>

      <div className="pointer-events-none absolute inset-0 opacity-50" style={gridTextureStyle} aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <h2 className="sr-only">Our Learning Environment</h2>

        {/* desktop: 2x2 grid, wide gap, right-angle circuit-style
            connectors computed from measured geometry. */}
        <div
          ref={gridRef}
          className="relative hidden lg:grid lg:grid-cols-[minmax(280px,1fr)_minmax(280px,1fr)] lg:items-center lg:gap-x-80 lg:gap-y-20 lg:py-12"
        >
          <ConnectorLines lines={lines} />

          <div className="justify-self-end self-end" ref={registerCardRef(teachers.id)}>
            <SpokeCard card={teachers} />
          </div>
          <div className="justify-self-start self-end" ref={registerCardRef(practical.id)}>
            <SpokeCard card={practical} align="right" />
          </div>
          <div className="justify-self-end self-start" ref={registerCardRef(students.id)}>
            <SpokeCard card={students} />
          </div>
          <div className="justify-self-start self-start" ref={registerCardRef(environment.id)}>
            <SpokeCard card={environment} align="right" />
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <LearningCore coreRef={coreRef} onLogoLoad={recomputeLines} />
          </div>
        </div>

        {/* mobile / tablet stacked layout — no connector lines here since
            there's no shared hub geometry to connect to at this width */}
        <div className="flex flex-col items-center gap-10 lg:hidden">
          <LearningCore coreRef={mobileCoreRef} onLogoLoad={undefined} />
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            {CARDS.map((c) => (
              <SpokeCard key={c.id} card={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function LearningEnvironmentSection() {
  return (
    <section className="relative w-full" aria-label="Learning environment">
      <SectionInner />
    </section>
  );
}