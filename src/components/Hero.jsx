import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Button from "../components/Buttons"; // adjust path to wherever you save it


gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
import {
  ArrowRight,
  PlayCircle,
  Star,
  ChevronDown,
  Megaphone,
  Code2,
  Palette,
  Cpu,
  BookOpen,
  Users,
  Award,
} from "lucide-react";
import GradientWaves from "../Animiations/GradientWaves";
import "slot-text/style.css";
import { SlotText } from "slot-text/react";

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
];

const QUICK_CATEGORIES = [
  { label: "Digital Marketing", icon: Megaphone, href: "/courses/digital-marketing" },
  { label: "Web Development", icon: Code2, href: "/courses/web-development" },
  { label: "UI/UX Design", icon: Palette, href: "/courses/ui-ux-design" },
  { label: "Software Dev", icon: Cpu, href: "/courses/software-dev" },
];

const STATS = [
  { icon: BookOpen, value: "24", label: "Courses" },
  { icon: Users, value: "12,000+", label: "Learners" },
  { icon: Award, value: "4.8 / 5", label: "Avg. rating" },
];

/**
 * ---- Carousel logos (Tailwind version) ----
 *
 * Auto-imports every image in src/assets/Carousel at build time via Vite's
 * import.meta.glob, so you never have to type out filenames by hand. Path
 * is relative to THIS file — since this file lives in src/pages/, "../assets"
 * correctly points to src/assets.
 *
 * Each logo now sits inside a card styled to match the "24 / Courses" stat
 * card from the hero section: translucent dark-purple fill, thin light
 * border, soft rounded corners.
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

const AUTO_LOGOS = Object.entries(logoModules).map(([path, src]) => ({
  src,
  alt: filenameToAlt(path),
}));

function LogoCarousel({
  logos = AUTO_LOGOS,
  speed = 30, // seconds per full loop — higher = slower
  pauseOnHover = true,
}) {
  const track = [...logos, ...logos]; // duplicated so the loop is seamless

  return (
    <div
      className="relative w-full py-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_5%,#000_95%,transparent_100%)]"
    >
      <div
        className={`flex items-center w-max gap-4 sm:gap-10 md:gap-16 will-change-transform animate-[cl-scroll_var(--cl-speed)_linear_infinite] ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""
          }`}
        style={{ "--cl-speed": `${speed}s` }}
      >
        {track.map((logo, i) => (
          <div
            key={`${logo.alt}-${i}`}
            className="flex-none flex items-center justify-center rounded-lg sm:rounded-xl border border-white/10 bg-[#241c38]/60 backdrop-blur-sm px-3 py-2 sm:px-6 sm:py-4 opacity-85 transition-all duration-200 hover:opacity-100 hover:scale-105"
          >
            {logo.src ? (
              <img
                src={logo.src}
                alt={logo.alt}
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

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F4F2FA] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F4F2FA] to-transparent" />

      {/* keyframes + reduced-motion (Tailwind has no built-in scroll keyframe, so we declare it once here) */}
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
}

export default function Hero() {          // <-- renamed from HeroSection
  const [courseIndex, setCourseIndex] = useState(0);
  const headingRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCourseIndex((prev) => (prev + 1) % ROTATING_COURSES.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  // Fade-in for the main heading only — scoped to headingRef so nothing
  // else in the hero (badge, buttons, pills, stats) is affected.
  // ScrollTrigger fires this the moment the heading crosses into view,
  // instead of firing automatically on mount.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        filter: "blur(10px)",
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%", // fires when the heading's top hits 85% down the viewport
          toggleActions: "play none none none", // play once, don't reverse/repeat on scroll back
          // markers: true, // uncomment while tuning to see the trigger line
        },
      });
    }, headingRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        className="relative w-full min-h-screen overflow-hidden"
        style={{ background: "#150A30" }}
      >
        {/* full-bleed animated background — dark violet palette */}
        <div className="gradient-waves-container absolute inset-0 z-0">
          <GradientWaves
            horizonColor="#5227FF"
            waveColor="#FF9FFC"
            crestColor="#FFFFFF"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1}
            opacity={1}
            mouseInteraction
            parallaxStrength={0.5}
            grain
            grainIntensity={0.05}
          />
        </div>
        {/* extra violet depth — soft glow blobs, layered above the shader */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 z-[1] h-[520px] w-[520px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #6C5DD3 0%, transparent 70%)", opacity: 0.35 }}
        />
        <div
          className="pointer-events-none absolute -bottom-52 -right-32 z-[1] h-[600px] w-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", opacity: 0.3 }}
        />

        {/* readability scrim, subtle, doesn't flatten the wave color */}
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,4,26,0.45) 0%, rgba(10,4,26,0.05) 35%, rgba(10,4,26,0.55) 100%)",
          }}
        />

        {/* content — single straight centered column, no side layout */}
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-24 text-center font-body sm:px-6 sm:py-28">
          <span className="relative mt-16 inline-flex rounded-full p-[1.5px] sm:mt-20">
            {/* soft ambient glow behind everything */}
            <span
              aria-hidden
              className="absolute inset-[-6px] rounded-full opacity-40 blur-md animate-[spin_3s_linear_infinite]"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 80%, #c4b5fd 92%, #ffffff 96%, transparent 100%)",
              }}
            />
            {/* actual pill content */}
            <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-md">
              <Star size={12} className="fill-white text-white" />
              Skill OS for the AI era
            </span>

          </span>

          {/* heading with inline animated course name — fades/slides in on mount */}
          <h1
            ref={headingRef}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-3 font-pliant text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-7xl"
          >
            <span>Build the skills that shape your future with</span>
            <span className="text-[#C4B2FF]">
              <SlotText
                text={ROTATING_COURSES[courseIndex]}
                options={{ direction: "up", stagger: 45 }}
              />
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 font-body">
            Turn what you learn into real-world opportunities.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button href="#programs" text="Get skilled now" />
          </div>

          {/* quick category pills — jump straight into a track */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {QUICK_CATEGORIES.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                to={href}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <Icon size={13} className="text-[#C4B2FF]" />
                {label}
              </Link>
            ))}
          </div>

          {/* social proof strip, centered */}
          <span className="relative mt-16 inline-flex rounded-full p-[1.5px] sm:mt-20">
            {/* faint static ring so the border reads */}
            <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
          </span>

          {/* stats strip */}
          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm sm:px-8"
              >
                <Icon size={16} className="text-[#C4B2FF]" />
                <span className="font-display text-lg font-semibold text-white sm:text-xl">
                  {value}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-white/60 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* scroll cue */}
        <a
          href="#programs"
          aria-label="Scroll to explore"
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/50 transition hover:text-white/80"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </a>
      </section>

      {/* Logo strip — sits right under the hero, naturally in the page flow
          (no fixed-header overlap issue like the standalone test route had) */}
      <section id="programs" className="relative w-full py-3" style={{ background: "#F4F2FA" }}>
        <LogoCarousel />
      </section>
    </>
  );
}