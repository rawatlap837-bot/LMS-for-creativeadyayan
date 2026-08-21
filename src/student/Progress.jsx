import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { auth, db } from "../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";

/**
 * Progress — Creative Adhyayan (live Firestore version)
 *
 * Reuses the exact same data model as MyCourses.jsx:
 *
 * courses (collection)
 *   {courseId}: { title, instructor, category, icon, color, lessons, duration, price }
 *
 * users/{uid}/enrollments (subcollection)
 *   {courseId}: { saved, purchased, lessonsDone, progress, status, updatedAt }
 *
 * This screen doesn't write anything — it's a read-only dashboard that
 * aggregates the same enrollment docs MyCourses.jsx already maintains,
 * so progress updates made there show up here instantly (onSnapshot).
 */

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const DARK = "#1B0E3D";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";

const ICONS = { Palette, Code2, PenTool, Camera, BookOpen };

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.03]"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${accent}1a` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xl font-bold leading-none" style={{ color: DARK }}>
          {value}
        </p>
        <p className="mt-1.5 text-xs font-medium" style={{ color: MUTED }}>
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-[11px]" style={{ color: MUTED }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function OverallRing({ percent }) {
  const size = 132;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={CANVAS}
          strokeWidth={stroke}
        />
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
        <span className="text-2xl font-black" style={{ color: DARK }}>
          {percent}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
          Overall
        </span>
      </div>
    </div>
  );
}

function CourseProgressRow({ course }) {
  const Icon = ICONS[course.icon] || BookOpen;
  const isDone = course.status === "Completed";

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/[0.03]">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${course.color}1a` }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color: course.color }} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold" style={{ color: DARK }}>
            {course.title}
          </p>
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

        <p className="mt-1.5 text-[11px]" style={{ color: MUTED }}>
          {course.lessonsDone}/{course.lessons} lessons · {course.category}
        </p>
      </div>
    </div>
  );
}

function CategoryBreakdown({ categories }) {
  if (categories.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.03]">
      <h3 className="mb-4 text-sm font-bold" style={{ color: DARK }}>
        Progress by category
      </h3>
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: DARK }}>
                {cat.name}
              </span>
              <span style={{ color: MUTED }}>
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
  const [uid, setUid] = useState(undefined); // undefined = checking, null = logged out
  const [rawCourses, setRawCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user ? user.uid : null));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snap) => {
      setRawCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) {
      setEnrollments({});
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, "users", uid, "enrollments"), (snap) => {
      const next = {};
      snap.docs.forEach((d) => (next[d.id] = d.data()));
      setEnrollments(next);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  // Only courses the user actually owns count toward progress.
  const purchasedCourses = useMemo(() => {
    return rawCourses
      .map((c) => {
        const e = enrollments[c.id] || {};
        return {
          ...c,
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
    // In-progress courses first (most useful to see), then not-started, then completed.
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center" style={{ background: CANVAS }}>
        <Lock className="h-8 w-8" style={{ color: "#A79BC4" }} />
        <p className="text-sm font-semibold" style={{ color: DARK }}>
          Please log in to view your progress
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: CANVAS }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: CANVAS }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl" style={{ color: DARK }}>
            My Progress
          </h1>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            A live look at how far you've come across every course you own.
          </p>
        </div>

        {stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white py-16 text-center shadow-sm">
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
            {/* top: ring + stat cards */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr]">
              <div className="flex items-center justify-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.03] lg:justify-start">
                <OverallRing percent={stats.overallPercent} />
                <div>
                  <p className="text-sm font-bold" style={{ color: DARK }}>
                    Keep it up!
                  </p>
                  <p className="mt-1 text-xs" style={{ color: MUTED }}>
                    {stats.totalLessonsDone} of {stats.totalLessons} lessons completed
                    across {stats.total} course{stats.total > 1 ? "s" : ""}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon={BookOpen} label="Courses owned" value={stats.total} accent={ACCENT} />
                <StatCard icon={Flame} label="In progress" value={stats.inProgress} accent={AMBER} />
                <StatCard icon={Award} label="Completed" value={stats.completed} accent="#10B981" />
                <StatCard icon={Clock} label="Not started" value={stats.notStarted} accent={MUTED} />
              </div>
            </div>

            {/* middle: category breakdown */}
            <CategoryBreakdown categories={categoryBreakdown} />

            {/* bottom: per-course list */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: DARK }}>
                <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />
                Course-by-course progress
              </h3>
              <div className="flex flex-col gap-3">
                {sortedCourses.map((course) => (
                  <CourseProgressRow key={course.id} course={course} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}