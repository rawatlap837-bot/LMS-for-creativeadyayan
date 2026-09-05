import { forwardRef, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
  BookOpen,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
  Award,
  Clock,
  Palette,
  Code2,
  PenTool,
  Camera,
  Megaphone,
  Cpu,
  Calculator,
  Globe,
} from "lucide-react";
import { auth, db } from "../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { iconForCategory, estimateLessons } from "../lib/CoursesMeta";
import { RingSkeleton, StatCardSkeleton, Skeleton } from "../components/Skeleton"; // adjust path

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const DARK = "#1B0E3D";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";
const DEFAULT_CATEGORY = "Uncategorized";

const ICONS = { Palette, Code2, PenTool, Camera, BookOpen, Megaphone, Cpu, Calculator, Globe };

function TypeBadge({ type }) {
  const isLong = type === "long";
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{
        background: isLong ? "#EDE7FB" : "#FDF1DE",
        color: isLong ? "#5227FF" : "#B4790F",
      }}
    >
      {isLong ? "Long" : "Short"}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:gap-4 sm:p-5"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
        style={{ background: `${accent}1a` }}
      >
        <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" style={{ color: accent }} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none sm:text-xl" style={{ color: DARK }}>
          {value}
        </p>
        <p className="mt-1.5 truncate text-[11px] font-medium sm:text-xs" style={{ color: MUTED }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function OverallRing({ percent }) {
  const size = 116;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ height: size, width: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={CANVAS} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ACCENT}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black sm:text-2xl" style={{ color: DARK }}>
          {percent}%
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wide sm:text-[10px]" style={{ color: MUTED }}>
          Overall
        </span>
      </div>
    </div>
  );
}

const CourseProgressRow = forwardRef(function CourseProgressRow({ course }, ref) {
  const Icon = ICONS[course.icon] || BookOpen;
  const isDone = course.status === "Completed";

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-black/[0.03] sm:gap-4 sm:p-4"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10"
        style={{ background: `${course.color}1a` }}
      >
        <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" style={{ color: course.color }} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-bold" style={{ color: DARK }}>
              {course.title}
            </p>
            <TypeBadge type={course.type} />
          </div>
          {isDone ? (
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </span>
          ) : (
            <span className="shrink-0 text-[11px] font-bold" style={{ color: MUTED }}>
              {course.progress}%
            </span>
          )}
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: CANVAS }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${course.progress}%`, background: course.color }}
          />
        </div>

        <p className="mt-1.5 truncate text-[11px]" style={{ color: MUTED }}>
          {course.lessonsDone}/{course.lessons} lessons · {course.category}
        </p>
      </div>
    </motion.div>
  );
});

function CategoryBreakdown({ categories }) {
  if (categories.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-5">
      <h3 className="mb-4 text-sm font-bold" style={{ color: DARK }}>
        Progress by category
      </h3>
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-semibold" style={{ color: DARK }}>
                {cat.name}
              </span>
              <span className="shrink-0" style={{ color: MUTED }}>
                {cat.avgProgress}% avg · {cat.count} course{cat.count > 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: CANVAS }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${cat.avgProgress}%`, background: ACCENT }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Progress() {
  const [uid, setUid] = useState(undefined);
  const [longCourses, setLongCourses] = useState([]);
  const [shortCourses, setShortCourses] = useState([]);
  const [longLoaded, setLongLoaded] = useState(false);
  const [shortLoaded, setShortLoaded] = useState(false);
  const [enrollments, setEnrollments] = useState({});
  const [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user ? user.uid : null));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "courses"),
      (snap) => {
        setLongCourses(snap.docs.map((d) => ({ type: "long", id: d.id, ...d.data() })));
        setLongLoaded(true);
      },
      (err) => {
        console.error("[courses] onSnapshot error:", err.code, err.message);
        setLongLoaded(true);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "shortCourses"),
      (snap) => {
        setShortCourses(snap.docs.map((d) => ({ type: "short", id: d.id, ...d.data() })));
        setShortLoaded(true);
      },
      (err) => {
        console.error("[shortCourses] onSnapshot error:", err.code, err.message);
        setShortLoaded(true);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) {
      setEnrollments({});
      setEnrollmentsLoaded(true);
      return;
    }
    const unsub = onSnapshot(
      collection(db, "users", uid, "enrollments"),
      (snap) => {
        const next = {};
        snap.docs.forEach((d) => (next[d.id] = d.data()));
        setEnrollments(next);
        setEnrollmentsLoaded(true);
      },
      (err) => {
        console.error("[enrollments] onSnapshot error:", err.code, err.message);
        setEnrollmentsLoaded(true);
      }
    );
    return unsub;
  }, [uid]);

  const loading = !longLoaded || !shortLoaded || !enrollmentsLoaded;

  const rawCourses = useMemo(() => {
    return [...longCourses, ...shortCourses];
  }, [longCourses, shortCourses]);

  const purchasedCourses = useMemo(() => {
    return rawCourses
      .map((c) => {
        const e = enrollments[c.id] || {};
        const category = c.category || DEFAULT_CATEGORY;
        return {
          ...c,
          title: c.title || category || "Untitled course",
          category,
          icon: c.icon || iconForCategory(c.category),
          color: c.color || "#5227FF",
          lessons: c.lessons || estimateLessons(c.duration || ""),
          saved: !!e.saved,
          purchased: !!e.purchased,
          lessonsDone: e.lessonsDone || 0,
          progress: e.progress || 0,
          status: e.status || "Not started",
        };
      })
      .filter((c) => c.purchased);
  }, [rawCourses, enrollments]);

  const stats = useMemo(() => {
    const total = purchasedCourses.length;
    const completed = purchasedCourses.filter((c) => c.status === "Completed").length;
    const inProgress = purchasedCourses.filter((c) => c.status === "In progress").length;
    const notStarted = total - completed - inProgress;

    const totalLessons = purchasedCourses.reduce((sum, c) => sum + (c.lessons || 0), 0);
    const totalLessonsDone = purchasedCourses.reduce((sum, c) => sum + (c.lessonsDone || 0), 0);

    const overallPercent =
      total === 0
        ? 0
        : Math.round(purchasedCourses.reduce((sum, c) => sum + c.progress, 0) / total);

    return { total, completed, inProgress, notStarted, totalLessons, totalLessonsDone, overallPercent };
  }, [purchasedCourses]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    purchasedCourses.forEach((c) => {
      if (!map[c.category]) map[c.category] = { total: 0, count: 0 };
      map[c.category].total += c.progress;
      map[c.category].count += 1;
    });
    return Object.entries(map)
      .map(([name, { total, count }]) => ({
        name,
        count,
        avgProgress: Math.round(total / count),
      }))
      .sort((a, b) => b.avgProgress - a.avgProgress);
  }, [purchasedCourses]);

  const sortedCourses = useMemo(() => {
    const rank = { "In progress": 0, "Not started": 1, Completed: 2 };
    return [...purchasedCourses].sort((a, b) => (rank[a.status] ?? 1) - (rank[b.status] ?? 1));
  }, [purchasedCourses]);

  if (uid === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: CANVAS }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  if (uid === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center" style={{ background: CANVAS }}>
        <Lock className="h-8 w-8" style={{ color: "#A79BC4" }} />
        <p className="text-sm font-semibold" style={{ color: DARK }}>
          Please log in to view your progress
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden p-4 sm:p-6" style={{ background: CANVAS }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-72" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-[minmax(0,280px)_1fr]">
            <div className="flex items-center gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.03]">
              <RingSkeleton size={116} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/[0.03]">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden p-4 sm:p-6" style={{ background: CANVAS }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
        <div>
          <h1 className="text-lg font-bold sm:text-2xl" style={{ color: DARK }}>
            My Progress
          </h1>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: MUTED }}>
            A live look at how far you've come across every course you own.
          </p>
        </div>

        {stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 py-14 text-center shadow-sm sm:py-16">
            <Target className="h-8 w-8" style={{ color: "#A79BC4" }} />
            <p className="text-sm font-semibold" style={{ color: DARK }}>
              No purchased courses yet
            </p>
            <p className="text-xs" style={{ color: MUTED }}>
              Buy a course from My Courses to start tracking real progress here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-[minmax(0,280px)_1fr]">
              <div className="flex items-center gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.03]">
                <OverallRing percent={stats.overallPercent} />
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: DARK }}>
                    Keep it up!
                  </p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
                    {stats.totalLessonsDone} of {stats.totalLessons} lessons done across{" "}
                    {stats.total} course{stats.total > 1 ? "s" : ""}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard icon={BookOpen} label="Courses owned" value={stats.total} accent={ACCENT} />
                <StatCard icon={Flame} label="In progress" value={stats.inProgress} accent={AMBER} />
                <StatCard icon={Award} label="Completed" value={stats.completed} accent="#10B981" />
                <StatCard icon={Clock} label="Not started" value={stats.notStarted} accent={MUTED} />
              </div>
            </div>

            <CategoryBreakdown categories={categoryBreakdown} />

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: DARK }}>
                <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />
                Course-by-course progress
              </h3>
              <motion.div layout className="flex flex-col gap-3">
                <AnimatePresence>
                  {sortedCourses.map((course) => (
                    <CourseProgressRow key={course.id} course={course} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}