import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PlayCircle,
  Clock,
  BookOpen,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Palette,
  Code2,
  PenTool,
  Camera,
  X,
  Lock,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { auth, db } from "../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * MyCourses — Creative Adhyayan (live Firestore version, mobile-first)
 *
 * DATA MODEL — unchanged from the previous version:
 *   courses (collection): title, instructor, category, icon, color,
 *     lessons, duration, price
 *   users/{uid}/enrollments (subcollection): saved, purchased,
 *     lessonsDone, progress, status, updatedAt
 */

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const DARK = "#1B0E3D";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";

const FILTERS = ["All", "In progress", "Completed", "Saved"];

const ICONS = { Palette, Code2, PenTool, Camera, BookOpen };

function CourseCard({ course, onOpen, onToggleSave, onBuy }) {
  const Icon = ICONS[course.icon] || BookOpen;
  const isDone = course.status === "Completed";
  const isLocked = !course.purchased;

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
        className="relative flex h-28 items-center justify-center sm:h-32"
        style={{
          background: `linear-gradient(150deg, ${course.color}22, ${course.color}0d)`,
        }}
      >
        <Icon
          className="h-9 w-9 sm:h-10 sm:w-10"
          style={{ color: course.color, opacity: isLocked ? 0.55 : 1 }}
          strokeWidth={1.6}
        />
        {isDone && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-emerald-600 sm:right-3 sm:top-3 sm:px-2.5 sm:text-[11px]">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Done
          </span>
        )}
        {isLocked && (
          <span
            className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold sm:left-3 sm:top-3 sm:px-2.5 sm:text-[11px]"
            style={{ color: DARK }}
          >
            <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Not purchased
          </span>
        )}
        {!isDone && (
          <button
            type="button"
            aria-label={course.saved ? "Remove from saved" : "Save course"}
            onClick={() => onToggleSave(course.id, course.saved)}
            className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1B0E3D] transition-transform active:scale-95 sm:right-3 sm:top-3 sm:hover:scale-110"
          >
            {course.saved ? (
              <BookmarkCheck className="h-3.5 w-3.5" style={{ color: ACCENT }} />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-4">
        <div className="min-w-0">
          <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide sm:text-[11px]" style={{ color: course.color }}>
            {course.category}
          </p>
          <h3 className="text-sm font-bold leading-snug sm:text-[15px]" style={{ color: DARK }}>
            {course.title}
          </h3>
          <p className="mt-1 truncate text-xs" style={{ color: MUTED }}>
            {course.instructor}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs" style={{ color: MUTED }}>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            {course.lessonsDone}/{course.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {course.duration}
          </span>
        </div>

        {isLocked ? (
          <p className="text-xs" style={{ color: MUTED }}>
            Buy this course to unlock lessons and track real progress.
          </p>
        ) : (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: CANVAS }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%`, background: course.color }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold" style={{ color: MUTED }}>
              {course.progress}% complete
            </p>
          </div>
        )}

        {isLocked ? (
          <button
            type="button"
            onClick={() => onBuy(course)}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:hover:scale-[1.01]"
            style={{ background: DARK }}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span className="truncate">Buy course · {course.price}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(course)}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:hover:scale-[1.01]"
            style={{ background: course.progress === 0 ? DARK : ACCENT }}
          >
            <PlayCircle className="h-4 w-4 shrink-0" />
            {course.progress === 0 ? "Start course" : isDone ? "Review course" : "Continue"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CourseModal({ course, onClose, onAdvance }) {
  if (!course) return null;
  const Icon = ICONS[course.icon] || BookOpen;
  const isDone = course.status === "Completed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div
          className="relative flex h-24 items-center justify-center sm:h-28"
          style={{ background: `linear-gradient(150deg, ${course.color}30, ${course.color}10)` }}
        >
          <Icon className="h-9 w-9 sm:h-10 sm:w-10" style={{ color: course.color }} strokeWidth={1.6} />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1B0E3D] active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="mb-1 truncate text-[11px] font-bold uppercase tracking-wide" style={{ color: course.color }}>
              {course.category} · {course.instructor}
            </p>
            <h3 className="text-base font-bold sm:text-lg" style={{ color: DARK }}>
              {course.title}
            </h3>
          </div>

          <p className="text-sm" style={{ color: MUTED }}>
            {isDone
              ? `You've completed all ${course.lessons} lessons. Review any lesson to brush up.`
              : course.progress === 0
              ? `Ready to start — ${course.lessons} lessons, ${course.duration} total.`
              : `Lesson ${course.lessonsDone + 1} of ${course.lessons} is next.`}
          </p>

          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: CANVAS }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%`, background: course.color }}
            />
          </div>

          {!isDone && (
            <button
              type="button"
              onClick={() => onAdvance(course)}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:hover:scale-[1.01]"
              style={{ background: ACCENT }}
            >
              <PlayCircle className="h-4 w-4" />
              Mark next lesson complete
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PurchaseModal({ course, status, onClose, onConfirm }) {
  if (!course) return null;
  const Icon = ICONS[course.icon] || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={status === "processing" ? undefined : onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div
          className="relative flex h-20 items-center justify-center sm:h-24"
          style={{ background: `linear-gradient(150deg, ${course.color}30, ${course.color}10)` }}
        >
          <Icon className="h-8 w-8 sm:h-9 sm:w-9" style={{ color: course.color }} strokeWidth={1.6} />
          {status !== "processing" && (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1B0E3D] active:scale-95"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3.5 p-4 sm:gap-4 sm:p-5">
          {status === "success" ? (
            <>
              <div className="flex flex-col items-center gap-2 py-2 text-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                <h3 className="text-base font-bold" style={{ color: DARK }}>
                  Purchase complete
                </h3>
                <p className="text-sm" style={{ color: MUTED }}>
                  "{course.title}" is unlocked and ready to start.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] sm:hover:scale-[1.01]"
                style={{ background: ACCENT }}
              >
                Done
              </button>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <p className="mb-1 truncate text-[11px] font-bold uppercase tracking-wide" style={{ color: course.color }}>
                  {course.category} · {course.instructor}
                </p>
                <h3 className="text-base font-bold" style={{ color: DARK }}>
                  {course.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm" style={{ background: CANVAS }}>
                <span style={{ color: MUTED }}>
                  {course.lessons} lessons · {course.duration}
                </span>
                <span className="font-bold" style={{ color: DARK }}>
                  {course.price}
                </span>
              </div>

              <button
                type="button"
                disabled={status === "processing"}
                onClick={() => onConfirm(course)}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-70 sm:hover:scale-[1.01]"
                style={{ background: DARK }}
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    <span className="truncate">Confirm purchase · {course.price}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyCourses() {
  const [uid, setUid] = useState(undefined);
  const [rawCourses, setRawCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [openCourseId, setOpenCourseId] = useState(null);
  const [buyCourseId, setBuyCourseId] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState("idle");

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

  const courses = useMemo(() => {
    return rawCourses.map((c) => {
      const e = enrollments[c.id] || {};
      return {
        ...c,
        saved: !!e.saved,
        purchased: !!e.purchased,
        lessonsDone: e.lessonsDone || 0,
        progress: e.progress || 0,
        status: e.status || "Not started",
      };
    });
  }, [rawCourses, enrollments]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Saved" ? c.saved : c.status === activeFilter);
      const matchesQuery = c.title.toLowerCase().includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [courses, activeFilter, query]);

  const openCourse = (course) => setOpenCourseId(course.id);
  const closeModal = () => setOpenCourseId(null);

  const enrollmentRef = (courseId) => doc(db, "users", uid, "enrollments", courseId);

  const toggleSave = async (courseId, currentlySaved) => {
    if (!uid) return;
    await setDoc(
      enrollmentRef(courseId),
      { saved: !currentlySaved, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const advanceLesson = async (course) => {
    if (!uid || course.lessonsDone >= course.lessons) return;
    const lessonsDone = course.lessonsDone + 1;
    const progress = Math.round((lessonsDone / course.lessons) * 100);
    const status = progress === 100 ? "Completed" : "In progress";
    await setDoc(
      enrollmentRef(course.id),
      { lessonsDone, progress, status, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const openBuyModal = (course) => {
    setBuyCourseId(course.id);
    setPurchaseStatus("idle");
  };

  const closeBuyModal = () => {
    setBuyCourseId(null);
    setPurchaseStatus("idle");
  };

  const confirmPurchase = async (course) => {
    if (!uid) return;
    setPurchaseStatus("processing");

    // TODO: replace with your real payment/checkout call (Razorpay, etc).
    await new Promise((res) => setTimeout(res, 1200));

    await setDoc(
      enrollmentRef(course.id),
      {
        purchased: true,
        status: "In progress",
        lessonsDone: 0,
        progress: 0,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setPurchaseStatus("success");
  };

  const openCourse_obj = courses.find((c) => c.id === openCourseId) || null;
  const buyCourse_obj = courses.find((c) => c.id === buyCourseId) || null;

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
          Please log in to view your courses
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden p-4 sm:p-6" style={{ background: CANVAS }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-lg font-bold sm:text-2xl" style={{ color: DARK }}>
              My Courses
            </h1>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: MUTED }}>
              Pick up where you left off, or start something new.
            </p>
          </div>

          <label className="relative flex w-full items-center sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 shrink-0" style={{ color: "#A79BC4" }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your courses…"
              className="w-full min-w-0 rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-transparent transition focus:ring-2"
              style={{ color: DARK, "--tw-ring-color": ACCENT }}
            />
          </label>
        </div>

        {/* filter pills — full-bleed horizontal scroll on mobile, no visible scrollbar */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 pb-1">
            {FILTERS.map((f) => {
              const isActive = f === activeFilter;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 sm:py-24">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onOpen={openCourse}
                  onToggleSave={toggleSave}
                  onBuy={openBuyModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 py-14 text-center shadow-sm sm:py-16">
            <BookOpen className="h-8 w-8" style={{ color: "#A79BC4" }} />
            <p className="text-sm font-semibold" style={{ color: DARK }}>
              {rawCourses.length === 0
                ? "No courses in the catalog yet"
                : "No courses match that search"}
            </p>
            <p className="text-xs" style={{ color: MUTED }}>
              {rawCourses.length === 0
                ? "Add a course document to the 'courses' collection in Firestore."
                : "Try a different filter or search term."}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {openCourse_obj && (
          <CourseModal course={openCourse_obj} onClose={closeModal} onAdvance={advanceLesson} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {buyCourse_obj && (
          <PurchaseModal
            course={buyCourse_obj}
            status={purchaseStatus}
            onClose={closeBuyModal}
            onConfirm={confirmPurchase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}