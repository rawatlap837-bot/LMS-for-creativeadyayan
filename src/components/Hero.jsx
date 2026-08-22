import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";
import Button from "../components/Buttons"; // adjust path to wherever you save it
import { motion, animate, useInView } from "framer-motion";
import {
  Star,
  Megaphone,
  Code2,
  Palette,
  Cpu,
  BookOpen,
  Users,
  Award,
} from "lucide-react";
import "slot-text/style.css";
import { SlotText } from "slot-text/react";

// Lazy-loaded: this pulls in the WebGL shader engine, so we defer it
// until after the rest of the hero has mounted instead of blocking
// the initial page load for every visitor.
const GradientWaves = lazy(() => import("../Animiations/GradientWaves"));

/**
 * TOKENS
 * background: GradientWaves shader (horizon violet → wave pink → crest white)
 * ink (on-wave text): #FFFFFF
 * muted (on-wave text): #D9D2F5
 * violet accent: #6C5DD3
 * display: Tirra / body: Pliant / mono: Pochaevsk
 */

const ROTATING_COURSES = [
  "Digital Marketing",
  "Software Development",
  "Web Development",
  "Artificial Intelligence",
];

const QUICK_CATEGORIES = [
  { label: "Digital Marketing", icon: Megaphone, href: "/courses/digital-marketing" },
  { label: "Web Development", icon: Code2, href: "/courses/web-development" },
  { label: "UI/UX Design", icon: Palette, href: "/courses/ui-ux-design" },
  { label: "Software Dev", icon: Cpu, href: "/courses/software-dev" },
];

const STATS = [
  { icon: BookOpen, value: 24, label: "Courses" },
  { icon: Users, value: 12000, suffix: "+", label: "Learners" },
  { icon: Award, value: 4.8, decimals: 1, suffix: " / 5", label: "Avg. rating" },
];

// Hoisted outside the component so these plain objects aren't
// re-created (and don't trigger new prop identities) on every render.
const STATS_CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const STATS_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const SCRIM_MOBILE =
  "linear-gradient(180deg, rgba(10,4,26,0.30) 0%, rgba(10,4,26,0.02) 35%, rgba(10,4,26,0.40) 100%)";
const SCRIM_DESKTOP =
  "linear-gradient(180deg, rgba(10,4,26,0.45) 0%, rgba(10,4,26,0.05) 35%, rgba(10,4,26,0.55) 100%)";

/**
 * Responsive breakpoint hook — debounced so a window drag doesn't fire a
 * state update (and a full re-render) on every single resize tick, and
 * seeded with matchMedia so there's no layout flash on mount.
 */
function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return isMobile;
}

/**
 * ---- Animated count-up number ----
 *
 * Animates from 0 up to `value` once the element scrolls into view.
 * Memoized: its props are static per-stat, so it never needs to
 * re-render when a sibling stat or the parent Hero re-renders.
 */
const AnimatedStatValue = memo(function AnimatedStatValue({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState((0).toFixed(decimals));

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo-ish — quick start, gentle settle
      onUpdate(latest) {
        const rounded = decimals ? latest.toFixed(decimals) : Math.round(latest);
        setDisplay(
          Number(rounded).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        );
      },
    });

    return () => controls.stop();
  }, [isInView, value, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
});

/**
 * ---- Carousel logos ----
 *
 * Auto-imports every image in src/assets/Carousel at build time via Vite's
 * import.meta.glob, so you never have to type out filenames by hand.
 */
const logoModules = import.meta.glob(
  "../assets/Carousel/*.{png,jpg,jpeg,svg,webp,PNG,JPG,JPEG}",
  { eager: true, import: "default" }
);

function filenameToAlt(path) {
  const base = path.split("/").pop().split(".")[0];
  const match = base.match(/([A-Z0-9-]{3,})$/); // trailing UPPERCASE-ish chunk
  const raw = match ? match[1] : base;
  return raw.replace(/[-_]/g, " ").trim();
}

// Computed once at module load, not on every render.
const AUTO_LOGOS = Object.entries(logoModules).map(([path, src]) => ({
  src,
  alt: filenameToAlt(path),
}));

const LogoCarousel = memo(function LogoCarousel({
  logos = AUTO_LOGOS,
  speed = 30, // seconds per full loop — higher = slower
  pauseOnHover = true,
}) {
  // Duplicated so the loop is seamless — memoized so it isn't rebuilt
  // (and the DOM list isn't rekeyed) on every parent render.
  const track = useMemo(() => [...logos, ...logos], [logos]);

  return (
    <div className="relative w-full py-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_5%,#000_95%,transparent_100%)]">
      <div
        className={`flex items-center w-max gap-4 sm:gap-10 md:gap-16 will-change-transform animate-[cl-scroll_var(--cl-speed)_linear_infinite] ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""
          }`}
        style={{ "--cl-speed": `${speed}s` }}
      >
        {track.map((logo, i) => (
          <div
            key={`${logo.alt}-${i}`}
            className="flex-none flex items-center justify-center rounded-lg sm:rounded-xl border border-white/10 bg-[#241c38]/15 backdrop-blur-sm px-3 py-2 sm:px-6 sm:py-4 opacity-85 transition-all duration-200 hover:opacity-100 hover:scale-105"
          >
            {logo.src ? (
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                decoding="async"
                width={96}
                height={40}
                className="h-6 sm:h-8 md:h-10 w-auto object-contain select-none"
                draggable={false}
              />
            ) : (
              <span className="inline-flex items-center h-6 sm:h-8 md:h-10 px-2 sm:px-5 font-semibold text-xs sm:text-[15px] tracking-wide text-[#cbb8ff] whitespace-nowrap">
                {logo.alt}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F4F2FA] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F4F2FA] to-transparent" />

      <style>{`
        @keyframes cl-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[cl-scroll_var\\(--cl-speed\\)_linear_infinite\\] {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * ---- Rotating course word ----
 *
 * Owns its own interval + state so the 2.2s tick only re-renders this
 * small leaf node, instead of the entire Hero (shader wrapper, glow
 * blobs, stats strip, logo carousel) every 2.2 seconds.
 */
const RotatingCourseWord = memo(function RotatingCourseWord({ words }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [words]);

  return (
    <span className="text-[#FFDE21] text-3xl sm:text-7xl">
      <SlotText text={words[index]} options={{ direction: "up", stagger: 40 }} />
    </span>
  );
});

/** Static pill row — memoized since it never depends on Hero's state. */
const QuickCategories = memo(function QuickCategories() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
      {QUICK_CATEGORIES.map(({ label, icon: Icon, href }) => (
        <Link
          key={label}
          to={href}
          className="group flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          <Icon size={13} className="text-[#C4B2FF]" />
          <span className="text-xs font-medium text-white/80 transition ease-out group-hover:text-white">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
});

/** Static stats strip — memoized since it never depends on Hero's state. */
const StatsStrip = memo(function StatsStrip() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={STATS_CONTAINER_VARIANTS}
      className="mt-10 grid grid-cols-3 gap-3 sm:gap-6"
    >
      {STATS.map(({ icon: Icon, value, decimals, suffix, label }) => (
        <motion.div
          key={label}
          variants={STATS_ITEM_VARIANTS}
          className="group flex flex-col items-center gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm transition duration-300 hover:border-white/20 hover:bg-white/[0.07] sm:px-8"
        >
          <Icon
            size={16}
            className="text-[#C4B2FF] transition-transform duration-300 group-hover:scale-110"
          />
          <AnimatedStatValue
            value={value}
            decimals={decimals}
            suffix={suffix}
            className="font-display text-lg font-semibold tabular-nums text-white sm:text-xl"
          />
          <span className="text-[10px] uppercase tracking-wide text-white/60 sm:text-xs">
            {label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
});

/** Shader background + glow blobs + scrim — isolated so it only re-renders when isMobile flips. */
const HeroBackground = memo(function HeroBackground({ isMobile }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-waves-container absolute inset-0 z-0"
      >
        <Suspense fallback={null}>
          <GradientWaves
            horizonColor="#a627ff"
            waveColor="#7C3AED"
            crestColor="#FFFFFF"
            speed={0.8}
            amplitude={2.5}
            waveScale={0.75}
            waveRatio={0.8}
            swell={35}
            turbulence={16.5}
            tilt={0.92}
            zoom={1.05}
            height={3.5}
            fogDepth={15}
            detail="high"
            brightness={1}
            opacity={1}
            mouseInteraction
            parallaxStrength={0.23}
            grain
            grainIntensity={0.05}
          />
        </Suspense>
      </motion.div>


      <div
        className="pointer-events-none absolute -top-40 -left-40 z-[1] h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #6C5DD3 0%, transparent 70%)", opacity: 0.35 }}
      />
      <div
        className="pointer-events-none absolute -bottom-52 -right-32 z-[1] h-[600px] w-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", opacity: 0.3 }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: isMobile ? SCRIM_MOBILE : SCRIM_DESKTOP }}
      />
    </>
  );
});

export default function Hero() {
  const isMobile = useIsMobile();

  // Scroll to the very top whenever the Hero mounts — e.g. when the user
  // clicks the logo / "Home" in the navbar from somewhere scrolled down on
  // another page. The documentElement/body fallback covers older/mobile
  // Safari, where window.scrollTo alone can be unreliable right after a
  // route change.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <>
      <section
        className="relative w-full min-h-screen overflow-hidden"
        style={{ background: "#150A30" }}
      >
        <HeroBackground isMobile={isMobile} />

        {/* content — single straight centered column, no side layout */}
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-10 text-center font-body sm:px-6 sm:py-28">
          <span className="relative mt-16 inline-flex rounded-full p-[1.5px] sm:mt-20">
            <span
              aria-hidden
              className="absolute inset-[-6px] rounded-full opacity-40 blur-md animate-[spin_3s_linear_infinite]"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 80%, #c4b5fd 92%, #ffffff 96%, transparent 100%)",
              }}
            />
            <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-md">
              <Star size={12} className="fill-white text-white" />
              Skill OS for the AI era
            </span>
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.85 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-center font-pliant text-[40px] font-semibold leading-[1.08] tracking-tight text-white sm:text-7xl"
          >
            <span className="block">LEARN. GET HIRED. GET PAID.</span>
            <span className="flex flex-col items-center justify-center">
              <span className="font-telma text-3xl sm:text-7xl text-[#C4B2FF] leading-none">
                Faster With
              </span>
              <span className="-mt-1 sm:-mt-3">
                <RotatingCourseWord words={ROTATING_COURSES} />
              </span>
            </span>
          </motion.h1>
          <StatsStrip />
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button href="#programs" text="Get skilled now" />
          </div>

        </div>
      </section>

      {/* Logo strip — sits right under the hero, naturally in the page flow */}
      <section id="programs" className="relative w-full py-3" style={{ background: "#F4F2FA" }}>
        <LogoCarousel />
      </section>
    </>
  );
}