import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PlayCircle,
  Clock,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Palette,
  Code2,
  PenTool,
  Camera,
} from "lucide-react";

/**
 * MyCourses — Creative Adhyayan
 * Uses the same tokens as StudentLayout (violet/amber on #ECEEF3),
 * so it drops straight into the dashboard <Outlet />.
 */

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const DARK = "#1B0E3D";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";

const FILTERS = ["All", "In progress", "Completed", "Saved"];

// Replace with real data from Firestore / your API
const COURSES = [
  {
    id: "ui-fundamentals",
    title: "UI Design Fundamentals",
    instructor: "Rekha Lila",
    category: "UI Design",
    icon: Palette,
    color: ACCENT,
    lessons: 16,
    lessonsDone: 14,
    duration: "6h 20m",
    progress: 90,
    status: "In progress",
  },
  {
    id: "frontend-react",
    title: "React for Frontend Developers",
    instructor: "Arjun Mehta",
    category: "Development",
    icon: Code2,
    color: AMBER,
    lessons: 24,
    lessonsDone: 24,
    duration: "9h 45m",
    progress: 100,
    status: "Completed",
  },
  {
    id: "typography-101",
    title: "Typography 101",
    instructor: "Rekha Lila",
    category: "UI Design",
    icon: PenTool,
    color: ACCENT,
    lessons: 12,
    lessonsDone: 8,
    duration: "3h 10m",
    progress: 65,
    status: "In progress",
  },
  {
    id: "product-photography",
    title: "Product Photography Basics",
    instructor: "Ken Smith",
    category: "Photography",
    icon: Camera,
    color: AMBER,
    lessons: 10,
    lessonsDone: 0,
    duration: "4h 05m",
    progress: 0,
    status: "Saved",
  },
];

function CourseCard({ course, onOpen }) {
  const Icon = course.icon;
  const isDone = course.status === "Completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.03]"
    >
      {/* thumbnail */}
      <div
        className="relative flex h-32 items-center justify-center"
        style={{
          background: `linear-gradient(150deg, ${course.color}22, ${course.color}0d)`,
        }}
      >
        <Icon className="h-10 w-10" style={{ color: course.color }} strokeWidth={1.6} />
        {isDone && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Done
          </span>
        )}
        <button
          type="button"
          aria-label="Save course"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1B0E3D] hover:scale-105"
          style={{ display: isDone ? "none" : "flex" }}
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: course.color }}>
            {course.category}
          </p>
          <h3 className="text-[15px] font-bold leading-snug" style={{ color: DARK }}>
            {course.title}
          </h3>
          <p className="mt-1 text-xs" style={{ color: MUTED }}>
            {course.instructor}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: MUTED }}>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessonsDone}/{course.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
        </div>

        {/* progress */}
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: CANVAS }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${course.progress}%`, background: course.color }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold" style={{ color: MUTED }}>
            {course.progress}% complete
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpen(course)}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
          style={{ background: course.progress === 0 ? DARK : ACCENT }}
        >
          <PlayCircle className="h-4 w-4" />
          {course.progress === 0 ? "Start course" : isDone ? "Review course" : "Continue"}
        </button>
      </div>
    </motion.div>
  );
}

export default function MyCourses() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      const matchesFilter = activeFilter === "All" || c.status === activeFilter;
      const matchesQuery = c.title.toLowerCase().includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const handleOpen = (course) => {
    // Adjust to your real course-player route
    navigate(`/dashboard/course-player/${course.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl" style={{ color: DARK }}>
            My Courses
          </h1>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            Pick up where you left off, or start something new.
          </p>
        </div>

        <label className="relative flex w-full items-center sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4" style={{ color: "#A79BC4" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your courses…"
            className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-transparent transition focus:ring-2"
            style={{ color: DARK, "--tw-ring-color": ACCENT }}
          />
        </label>
      </div>

      {/* filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const isActive = f === activeFilter;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className="relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: isActive ? DARK : "white",
                color: isActive ? "white" : MUTED,
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* grid */}
      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onOpen={handleOpen} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white py-16 text-center shadow-sm">
          <BookOpen className="h-8 w-8" style={{ color: "#A79BC4" }} />
          <p className="text-sm font-semibold" style={{ color: DARK }}>
            No courses match that search
          </p>
          <p className="text-xs" style={{ color: MUTED }}>
            Try a different filter or search term.
          </p>
        </div>
      )}
    </div>
  );
}