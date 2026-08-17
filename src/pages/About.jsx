import React from "react";
import { ArrowUpRight, Sparkles, Target, Users2, GraduationCap } from "lucide-react";

/**
 * About Us section — Creative Adhyayan
 * Palette: deep violet (#2E1A55) + electric indigo (#6D3FC0) + amber spark (#E8A33D) on soft lavender (#F8F6FC)
 * Display face: bold geometric sans (tracking-tight) / Body: Inter-style default sans / Labels: mono uppercase
 * Signature: a dotted "learning path" that threads from the eyebrow, through the mission, to the leadership cards —
 * literalizing "guided growth" instead of a generic numbered-step layout.
 */

const offerings = [
  "IT Courses",
  "Software Training",
  "E-Accounting",
  "Digital Marketing",
  "Design",
  "Freelancing",
  "Career Diplomas",
];

const leaders = [
  {
    name: "Sohil Alvi",
    role: "Director",
    years: "4 yrs",
    focus: "Digital Marketing",
    bio: "Has helped numerous brands grow online. His dedication to teaching ensures students learn the latest and most effective marketing skills.",
    initials: "SA",
  },
  {
    name: "Akash Nagar",
    role: "Academic Head",
    years: "3 yrs",
    focus: "IT Education",
    bio: "Has mentored countless students with dedication and precision. As Academic Head, he ensures every learner receives structured, industry-focused training.",
    initials: "AN",
  },
];

function DotGrid({ className = "" }) {
  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={10 + col * 20}
            cy={10 + row * 20}
            r="2.5"
            className="fill-violet-300/60"
          />
        ))
      )}
    </svg>
  );
}

export default function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8F6FC] text-[#1F1533]">
      {/* ambient gradient blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #C9AFF0 0%, #8B5FE0 45%, transparent 70%)",
        }}
      />
      <DotGrid className="pointer-events-none absolute left-6 top-24 hidden sm:block" />

      {/* ---------------- HERO ---------------- */}
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pt-32">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[#6D3FC0]">
          <span className="h-px w-8 bg-[#6D3FC0]" />
          About Creative Adhyayan
        </div>

        <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          Empowering the{" "}
          <span className="relative inline-block">
            next generation
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="10"
              viewBox="0 0 200 10"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 6 Q 50 0, 100 6 T 200 6"
                stroke="#E8A33D"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          of digital professionals.
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#4A3D66]">
          A premier skill-development and IT training institute, built to turn
          real practice into real careers — not another certificate that sits
          in a drawer.
        </p>
      </div>

      {/* ---------------- STORY ---------------- */}
      <div className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* image column */}
          <div className="relative lg:col-span-2">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] rounded-tl-none bg-gradient-to-br from-[#6D3FC0] to-[#2E1A55] shadow-xl shadow-violet-900/20">
              <div className="flex h-full w-full items-center justify-center">
                <GraduationCap className="h-20 w-20 text-white/25" strokeWidth={1} />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg shadow-violet-900/10">
              <Sparkles className="h-5 w-5 text-[#E8A33D]" />
              <div>
                <p className="text-sm font-bold leading-none">Industry-led</p>
                <p className="mt-1 text-xs text-[#4A3D66]">mentors &amp; curriculum</p>
              </div>
            </div>
          </div>

          {/* text column */}
          <div className="lg:col-span-3">
            <p className="text-base leading-relaxed text-[#4A3D66]">
              We believe quality education, practical skills, and the right
              guidance can transform anyone into a high-earning professional
              — and that's exactly what we deliver.
            </p>
            <p className="mt-5 text-base leading-relaxed text-[#4A3D66]">
              Creative Adhyayan was founded by industry experts with a
              mission to bridge the gap between education and real-world
              skills. In today's digital age, traditional degrees alone
              aren't enough — students need practical, job-ready skills
              through structured training, hands-on practice, and
              personalized mentorship.
            </p>

            {/* offerings */}
            <div className="mt-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6D3FC0]">
                What we offer
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {offerings.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-violet-200 bg-white px-4 py-1.5 text-sm font-medium text-[#2E1A55] transition-colors hover:border-[#6D3FC0] hover:bg-violet-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* mini stats */}
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-violet-100 pt-8 sm:grid-cols-3">
              <div>
                <div className="flex items-center gap-1.5 text-[#2E1A55]">
                  <Target className="h-4 w-4 text-[#E8A33D]" />
                  <span className="text-2xl font-black">Day 1</span>
                </div>
                <p className="mt-1 text-sm text-[#4A3D66]">career-ready focus</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[#2E1A55]">
                  <Users2 className="h-4 w-4 text-[#E8A33D]" />
                  <span className="text-2xl font-black">1:1</span>
                </div>
                <p className="mt-1 text-sm text-[#4A3D66]">personalized mentorship</p>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 text-[#2E1A55]">
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span className="text-2xl font-black">Hands-on</span>
                </div>
                <p className="mt-1 text-sm text-[#4A3D66]">structured training</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- LEADERSHIP ---------------- */}
      <div className="relative bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#6D3FC0]">
              The people behind it
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Leadership that inspires growth
            </h2>
          </div>

          {/* path-connected cards */}
          <div className="relative mt-16 grid gap-10 sm:grid-cols-2">
            <svg
              className="pointer-events-none absolute left-0 right-0 top-1/2 hidden -translate-y-1/2 sm:block"
              height="2"
              width="100%"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="#D8C9F0"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
            </svg>

            {leaders.map((leader) => (
              <div
                key={leader.name}
                className="group relative rounded-3xl border border-violet-100 bg-white p-8 shadow-sm shadow-violet-900/5 transition-shadow hover:shadow-lg hover:shadow-violet-900/10"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-black text-white"
                    style={{
                      background: "linear-gradient(135deg, #6D3FC0, #2E1A55)",
                    }}
                  >
                    {leader.initials}
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B5772A]">
                    {leader.years} experience
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold">{leader.name}</h3>
                <p className="text-sm font-medium text-[#6D3FC0]">{leader.role}</p>

                <p className="mt-4 text-sm leading-relaxed text-[#4A3D66]">
                  {leader.bio}
                </p>

                <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-[#2E1A55] opacity-0 transition-opacity group-hover:opacity-100">
                  Focus area: {leader.focus}
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}