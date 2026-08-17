import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Search,
  X,
  GraduationCap,
  Clock,
  LayoutGrid,
  Code2,
  Globe,
  Palette,
} from "lucide-react";

/**
 * Short Courses — advanced layout, v6 (compact + descriptions)
 * Card style: 55% image / 45% content split, bordered, compact footprint.
 * Brand system: deep violet (#2E1A55) + indigo (#6D3FC0) + amber (#E8A33D)
 *
 * Images: loremflickr keyword-tagged photos so each card's image actually
 * matches its subject (e.g. "excel" → spreadsheet-ish photo, "python" →
 * python/code-ish photo) instead of random unrelated stock photos.
 */

/**
 * One precise keyword per course (not a comma-joined pair) — Flickr's tag
 * search does an AND match across comma tags, which was quietly narrowing
 * the pool and letting loosely-related photos slip in. A single specific
 * keyword + a locked seed gives a deterministic, closely-matching photo
 * for that exact subject every time the page loads.
 */
const img = (keyword, seed) => `https://loremflickr.com/500/400/${keyword}?lock=${seed}`;

const COURSE_GROUPS = [
  {
    id: "office",
    label: "Office & Computer Basics",
    icon: LayoutGrid,
    courses: [
      {
        title: "CCC / BCC",
        duration: "2 Month",
        color: "#6D3FC0",
        description: "Core computer literacy for absolute beginners.",
        image: img("computerclass", 101),
      },
      {
        title: "MS Word",
        duration: "1 Month",
        color: "#2B579A",
        description: "Type, format, and produce professional documents.",
        image: img("mswordapp", 102),
      },
      {
        title: "MS Excel",
        duration: "1 Month",
        color: "#217346",
        description: "Build spreadsheets, formulas, and simple reports.",
        image: img("msexcel", 103),
        popular: true,
      },
      {
        title: "Adv. Excel",
        duration: "1 Month",
        color: "#217346",
        description: "Pivot tables, macros, and data analysis at scale.",
        image: img("excelformula", 104),
      },
      {
        title: "MS PowerPoint",
        duration: "1 Month",
        color: "#D24726",
        description: "Design decks that pitch, teach, and persuade.",
        image: img("mspowerpoint", 105),
      },
      {
        title: "MS Access",
        duration: "1 Month",
        color: "#A4373A",
        description: "Design simple databases and manage records.",
        image: img("msaccess", 106),
      },
      {
        title: "Internet",
        duration: "1 Week",
        color: "#3A7BD5",
        description: "Browse, search, and stay safe online with confidence.",
        image: img("internetbrowsing", 107),
      },
    ],
  },
  {
    id: "programming",
    label: "Programming & Development",
    icon: Code2,
    courses: [
      {
        title: "C Programming",
        duration: "3 Month",
        color: "#3A3A3A",
        description: "Learn logic-building with the foundation language.",
        image: img("cprogramming", 201),
      },
      {
        title: "C++ Programming",
        duration: "3 Month",
        color: "#00599C",
        description: "Object-oriented programming for real applications.",
        image: img("cplusplus", 202),
      },
      {
        title: "Core Java",
        duration: "3 Months",
        color: "#EA2D2E",
        description: "Master Java fundamentals and OOP concepts.",
        image: img("javaprogramming", 203),
      },
      {
        title: "Full Java",
        duration: "9 Month",
        color: "#F89820",
        description: "End-to-end Java development for enterprise apps.",
        image: img("javadeveloper", 204),
        popular: true,
      },
      {
        title: "PHP",
        duration: "3 Months",
        color: "#4F5B93",
        description: "Build dynamic, database-driven websites.",
        image: img("phpcode", 205),
      },
      {
        title: "Python",
        duration: "3 Month",
        color: "#3776AB",
        description: "The most in-demand language for scripting & data.",
        image: img("pythoncode", 206),
        popular: true,
      },
      {
        title: "MySQL / MariaDB",
        duration: "2 Months",
        color: "#00758F",
        description: "Query, manage, and structure relational databases.",
        image: img("mysqldatabase", 207),
      },
    ],
  },
  {
    id: "design",
    label: "Design & Creative Tools",
    icon: Palette,
    courses: [
      {
        title: "Graphic Design",
        duration: "6 Month",
        color: "#6D3FC0",
        description: "Visual design fundamentals for branding & print.",
        image: img("graphicdesigner", 301),
        popular: true,
      },
      {
        title: "Web Designing",
        duration: "6 Months",
        color: "#E8A33D",
        description: "Design responsive, user-friendly websites.",
        image: img("webdesigner", 302),
      },
      {
        title: "Photoshop",
        duration: "2 Month",
        color: "#31A8FF",
        description: "Photo editing, retouching, and digital art.",
        image: img("photoshopediting", 303),
      },
      {
        title: "CorelDRAW",
        duration: "2 Month",
        color: "#00A651",
        description: "Vector illustration for logos and layouts.",
        image: img("coreldraw", 304),
      },
      {
        title: "Illustrator",
        duration: "1 Months",
        color: "#FF9A00",
        description: "Create scalable icons, logos, and artwork.",
        image: img("illustratorartist", 305),
      },
      {
        title: "After Effects",
        duration: "1 Month",
        color: "#9999FF",
        description: "Motion graphics and video visual effects.",
        image: img("aftereffects", 306),
      },
      {
        title: "3ds Max",
        duration: "3 Month",
        color: "#20BFA9",
        description: "3D modeling, texturing, and rendering basics.",
        image: img("3dmodeling", 307),
      },
    ],
  },
  {
    id: "web",
    label: "Web & Scripting",
    icon: Globe,
    courses: [
      {
        title: "WordPress",
        duration: "1 Month",
        color: "#21759B",
        description: "Build and manage websites without heavy coding.",
        image: img("wordpresswebsite", 401),
      },
      {
        title: "HTML & CSS",
        duration: "1 Month",
        color: "#E34F26",
        description: "The building blocks of every website, from scratch.",
        image: img("htmlcode", 402),
      },
      {
        title: "JavaScript",
        duration: "1 Months",
        color: "#D6B90A",
        description: "Add interactivity and logic to the modern web.",
        image: img("javascriptcode", 403),
        popular: true,
      },
      {
        title: "MIS",
        duration: "2 Month",
        color: "#2E1A55",
        description: "Manage information systems for business decisions.",
        image: img("businessdashboard", 404),
      },
    ],
  },
];

const TOTAL_COURSES = COURSE_GROUPS.reduce((sum, g) => sum + g.courses.length, 0);

/* --- animation variants --- */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
};

function DotGrid({ className = "", dot = "fill-white/25" }) {
  return (
    <svg className={className} width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 7 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2.5" className={dot} />
        ))
      )}
    </svg>
  );
}

/**
 * CourseCard — compact split, now with a one-line description between the
 * title and the button. Image height trimmed slightly (55%) to make room
 * for the extra line of copy without growing the overall card height much.
 */
function CourseCard({ title, duration, color, image, popular, description }) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -4 }}
      className="group flex h-[272px] flex-col overflow-hidden rounded-2xl border-2 border-violet-100 bg-white shadow-sm transition-all duration-300 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-200/50"
    >
      {/* image — 55% of card height */}
      <div className="relative h-[55%] w-full shrink-0 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {popular && (
          <span
            className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #E8A33D, #D2891F)" }}
          >
            Popular
          </span>
        )}

        <span
          className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm"
          style={{ color }}
        >
          <Clock className="h-2.5 w-2.5" />
          {duration}
        </span>
      </div>

      {/* content — 45% of card height */}
      <div className="flex h-[45%] flex-col justify-between gap-1 border-t-2 border-violet-100 px-3 py-2.5">
        <div>
          <h3 className="truncate text-sm font-black leading-tight tracking-tight text-[#1F1533]">
            {title}
          </h3>
          <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-[#6b5f87]">
            {description}
          </p>
        </div>

        <button
          type="button"
          className="group/btn relative flex w-full items-center justify-between overflow-hidden rounded-full p-1 pl-4 text-xs font-bold text-white shadow-sm ring-1 ring-inset ring-white/10 transition-all duration-300 hover:shadow-lg active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            boxShadow: `0 0 0 0 ${color}55`,
          }}
        >
          {/* sheen sweep on hover */}
          <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-500 group-hover/btn:left-full group-hover/btn:opacity-100" />

          <span className="relative z-10">Enroll Now</span>

          <span
            className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:rotate-45"
            style={{ color }}
          >
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </motion.div>
  );
}

export default function ShortCourses() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);
  const groupRefs = useRef({});

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return COURSE_GROUPS;
    return COURSE_GROUPS.map((group) => ({
      ...group,
      courses: group.courses.filter((c) => c.title.toLowerCase().includes(normalizedQuery)),
    })).filter((group) => group.courses.length > 0);
  }, [normalizedQuery]);

  const noResults = normalizedQuery && filteredGroups.length === 0;

  const scrollToGroup = (id) => {
    setActiveGroup(id);
    groupRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative bg-[#F8F6FC] text-[#1F1533]">
      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B0F38] via-[#2E1A55] to-[#3A2170] px-6 pb-28 pt-24 text-center text-white sm:pt-32">
        <DotGrid className="pointer-events-none absolute right-8 top-10 hidden sm:block" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-1/3 h-[380px] w-[380px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #6D3FC0 0%, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto max-w-3xl"
        >
          <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            Skill up fast
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Short Courses</h1>
          <p className="mt-3 text-base text-white/60">
            Short courses now live in both online &amp; offline formats
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs text-white/70">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-[#E8A33D]" />
              {TOTAL_COURSES}+ courses
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-[#E8A33D]" />
              {COURSE_GROUPS.length} tracks
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
              <Clock className="h-3.5 w-3.5 text-[#E8A33D]" />
              From 1 week
            </span>
          </div>
        </motion.div>

        {/* search bar, overlaps down into the content below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="relative z-10 mx-auto -mb-20 mt-8 max-w-xl"
        >
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white p-1.5 shadow-2xl shadow-black/30">
            <Search className="ml-2.5 h-4 w-4 shrink-0 text-[#A79BC4]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a course — e.g. Python, Excel, Photoshop"
              className="w-full bg-transparent py-2 text-sm text-[#1F1533] placeholder:text-[#A79BC4] outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[#6D3FC0] transition-colors hover:bg-violet-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* ================= STICKY CATEGORY QUICK-NAV ================= */}
      <div className="sticky top-0 z-30 border-b border-violet-100 bg-[#F8F6FC]/90 pt-10 backdrop-blur-sm sm:pt-6">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {COURSE_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => scrollToGroup(group.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] sm:text-[15px] font-semibold transition-all ${
                  isActive
                    ? "border-transparent text-white shadow-md"
                    : "border-violet-100 bg-white text-[#4A3D66] hover:border-violet-200"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, #6D3FC0, #2E1A55)" } : undefined}
              >
                <GroupIcon className="h-3 w-3" />
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= COURSE GROUPS ================= */}
      <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {noResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-violet-200 bg-white/60 py-16 text-center"
          >
            <Search className="h-7 w-7 text-[#A79BC4]" />
            <p className="text-base font-bold text-[#2E1A55]">No courses match "{query}"</p>
            <p className="max-w-sm text-xs text-[#6b5f87]">
              Try a different keyword, or browse all {TOTAL_COURSES}+ courses below.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-1 rounded-lg px-4 py-2 text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #6D3FC0, #2E1A55)" }}
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          filteredGroups.map((group, i) => {
            const GroupIcon = group.icon;
            return (
              <div
                key={group.id}
                ref={(el) => (groupRefs.current[group.id] = el)}
                className={i > 0 ? "mt-12 scroll-mt-28" : "scroll-mt-28"}
              >
                <motion.h2
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onViewportEnter={() => setActiveGroup(group.id)}
                  className="mb-4 flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2.5 text-lg font-black tracking-tight text-[#2E1A55] sm:text-xl">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                      style={{ background: "linear-gradient(135deg, #6D3FC0, #E8A33D)" }}
                    >
                      <GroupIcon className="h-4 w-4" />
                    </span>
                    {group.label}
                  </span>
                  <span className="hidden text-xs font-medium text-[#A79BC4] sm:block">
                    {group.courses.length} courses
                  </span>
                </motion.h2>

                <motion.div
                  layout
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={containerVariants}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                >
                  <AnimatePresence mode="popLayout">
                    {group.courses.map((course) => (
                      <CourseCard key={course.title} {...course} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= SUPPORT CTA BANNER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-6 mb-14 overflow-hidden rounded-3xl bg-gradient-to-br from-[#2E1A55] to-[#1B0F38] sm:mx-auto sm:max-w-6xl"
      >
        <DotGrid className="pointer-events-none absolute left-8 top-8" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #E8A33D 0%, transparent 70%)" }}
        />
        <div className="relative flex flex-col items-center gap-8 px-8 py-12 sm:flex-row sm:px-12">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              Our friendly support team is here to help.
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Not sure which short course fits your goals? Talk to our team and we'll help you pick the right track.
            </p>
            <a
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[#2E1A55] shadow-lg shadow-black/20 transition-transform active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #F5C878, #E8A33D)" }}
            >
              Contact us
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}