import React, { useEffect, useRef, useState } from "react";
import { Users, Briefcase, PlayCircle, ArrowRight } from "lucide-react";
import PixelSwap from "../Animiations/PixelSwap";

const BG = "#FFFFFF";
const INK_TEXT = "#241F3D";
const MUTED = "#6E6789";
const VIOLET = "#7C6AE8";
const VIOLET_DEEP = "#5B4FC4";
const VIOLET_SOFT = "#EDEAFB";
const VIOLET_LINE = "#B7ACF2";

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

function SpokeIcon({ icon: Icon }) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ backgroundColor: VIOLET_SOFT, color: VIOLET_DEEP }}
    >
      <Icon size={20} />
    </div>
  );
}

function SpokeCard({ card, align = "left" }) {
  const { icon, eyebrow, stat, title, desc } = card;
  return (
    <div
      className="pointer-events-auto w-full max-w-[300px] rounded-2xl border p-5"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "rgba(124,106,232,0.18)",
        boxShadow: "0 8px 30px rgba(124,106,232,0.10)",
      }}
    >
      <div className={`flex items-start gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
        <SpokeIcon icon={icon} />
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: MUTED }}
          >
            {eyebrow}
          </p>
          {stat && (
            <p className="mt-0.5 text-2xl font-bold leading-none" style={{ color: VIOLET_DEEP }}>
              {stat}
            </p>
          )}
        </div>
      </div>
      <h4 className="mt-3 text-base font-semibold" style={{ color: INK_TEXT }}>
        {title}
      </h4>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
        {desc}
      </p>
    </div>
  );
}

// Rotating gradient-ring core with the section's central message.
function LearningCore() {
  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      {/* ambient blurred glow */}
      <div
        className="core-pulse absolute inset-0 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${VIOLET} 0%, ${VIOLET_LINE} 55%, transparent 75%)`,
          opacity: 0.22,
        }}
      />
      {/* rotating ring */}
      <div
        className="core-spin absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${VIOLET_DEEP}, transparent 35%, ${VIOLET}, transparent 75%, ${VIOLET_DEEP})`,
          padding: 2,
        }}
      >
        <div className="h-full w-full rounded-full" style={{ backgroundColor: BG }} />
      </div>
      {/* static core content */}
      <div
        className="relative z-10 flex h-[85%] w-[85%] flex-col items-center justify-center rounded-full text-center px-6"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${VIOLET_SOFT}, #FFFFFF)`,
          border: "1px solid rgba(124,106,232,0.16)",
          boxShadow: "0 10px 40px rgba(124,106,232,0.14)",
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: VIOLET_DEEP }}
        >
          Creative Adhyayan
        </p>
        <p className="mt-2 text-lg font-bold leading-snug sm:text-xl" style={{ color: INK_TEXT }}>
          Empowering India With Digital Skills.
        </p>
      </div>
    </div>
  );
}

function CircuitLines() {
  return (
    <svg
      viewBox="0 0 1200 720"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={VIOLET} stopOpacity="0.55" />
          <stop offset="100%" stopColor={VIOLET} stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {[
        "M380 300 L440 300 L440 330 L470 330",
        "M820 300 L760 300 L760 330 L730 330",
        "M600 520 L600 490",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="circuit-dash"
        />
      ))}
      {[
        [380, 300],
        [820, 300],
        [600, 520],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill={VIOLET} />
      ))}
    </svg>
  );
}

function SectionInner() {
  const [students, practical, environment] = CARDS;
  return (
    <div className="relative w-full px-4 py-20 sm:px-8" style={{ backgroundColor: BG }}>
      <style>{`
        @keyframes core-spin-kf { to { transform: rotate(360deg); } }
        @keyframes core-pulse-kf { 0%, 100% { opacity: .18; transform: scale(1); } 50% { opacity: .3; transform: scale(1.06); } }
        @keyframes dash-flow-kf { to { stroke-dashoffset: -24; } }
        .core-spin { animation: core-spin-kf 14s linear infinite; }
        .core-pulse { animation: core-pulse-kf 5s ease-in-out infinite; }
        .circuit-dash { stroke-dasharray: 6 6; animation: dash-flow-kf 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .core-spin, .core-pulse, .circuit-dash { animation: none; }
        }
      `}</style>

      {/* background grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,106,232,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,232,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* desktop hub layout */}
        <div className="relative hidden aspect-[1200/720] w-full lg:block">
          <CircuitLines />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LearningCore />
          </div>
          <div className="absolute" style={{ left: "3.3%", top: "27.7%" }}>
            <SpokeCard card={students} />
          </div>
          <div className="absolute" style={{ right: "3.3%", top: "27.7%" }}>
            <SpokeCard card={practical} align="right" />
          </div>
          <div
            className="absolute"
            style={{ left: "50%", top: "72.2%", transform: "translateX(-50%)" }}
          >
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
}

export default function LearningEnvironmentSection() {
  const probeRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const probe = probeRef.current;
    if (!probe) return;

    const measure = () => setContentHeight(probe.scrollHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(probe);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (contentHeight === 0) return;
    const timer = setTimeout(() => setActive(true), 300);
    return () => clearTimeout(timer);
  }, [contentHeight]);

  return (
    <section className="relative w-full">
      <div
        ref={probeRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 w-full -z-10"
      >
        <SectionInner />
      </div>

      {contentHeight > 0 && (
        <PixelSwap
          active={active}
          firstContent={<div className="h-full w-full" style={{ backgroundColor: VIOLET_DEEP }} />}
          secondContent={
            <div className="h-full w-full">
              <SectionInner />
            </div>
          }
          pixelSize={32}
          gap={0}
          pixelRadius={0}
          pixelSpin={0}
          pixelScale={0.6}
          duration={2200}
          pixelDuration={1400}
          pattern="wave"
          randomness={0.08}
          fade
          aspectRatio="auto"
          style={{ height: contentHeight }}
        />
      )}
    </section>
  );
}