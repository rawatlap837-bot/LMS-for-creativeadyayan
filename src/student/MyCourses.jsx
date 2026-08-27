import { forwardRef, useEffect, useMemo, useState } from "react";
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
  Megaphone,
  Cpu,
  Calculator,
  Globe,
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
import {
  iconForCategory,
  estimateLessons,
  DEFAULT_PRICE,
  DEFAULT_INSTRUCTOR,
} from "../lib/CoursesMeta";

/**
 * MyCourses — Creative Adhyayan (live Firestore version, mobile-first)
 *
 * Reads two catalog collections — `courses` (long-form) and
 * `shortCourses` (short-form) — merges them client-side, and layers on
 * each student's own `users/{uid}/enrollments/{courseId}` doc for
 * saved/purchased/progress state. Docs with `status: "draft"` are
 * hidden; every other doc (including ones added by hand in the Firebase
 * console with no `status` field at all) is shown. Missing optional
 * fields (title, instructor, icon, price, lessons, color) fall back to
 * sane defaults so an incomplete catalog doc never breaks the page.
 */

const ACCENT = "#5227FF";
const DARK = "#1B0E3D";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";

const FILTERS = ["All", "In progress", "Completed", "Saved", "Long", "Short"];

const ICONS = { Palette, Code2, PenTool, Camera, BookOpen, Megaphone, Cpu, Calculator, Globe };

function TypeBadge({ type }) {
  const isLong = type === "long";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{
        background: isLong ? "#EDE7FB" : "#FDF1DE",
        color: isLong ? "#5227FF" : "#B4790F",
      }}
    >
      {isLong ? "Long" : "Short"}
    </span>
  );
}

/** Real photo thumbnail when `course.image` is set, else an icon-on-gradient tile. */
function CourseThumb({ course, children }) {
  const Icon = ICONS[course.icon] || BookOpen;
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasImage = Boolean(course.image) && !imgFailed;

  return (
    <div className="relative h-28 w-full overflow-hidden sm:h-32">
      {hasImage ? (
        <>
          {!imgLoaded && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: `${course.color}14` }}
            />
          )}
          <img
            src={course.image}
            alt={course.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
            style={{ opacity: !course.purchased ? 0.7 : 1 }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            background: `linear-gradient(150deg, ${course.color}22, ${course.color}0d)`,
          }}
        >
          <Icon
            className="h-9 w-9 sm:h-10 sm:w-10"
            style={{ color: course.color, opacity: !course.purchased ? 0.55 : 1 }}
            strokeWidth={1.6}
          />
        </div>
      )}
      {children}
    </div>
  );
}

const CourseCard = forwardRef(function CourseCard({ course, onOpen, onToggleSave, onBuy }, ref) {
  const isDone = course.status === "Completed";
  const isLocked = !course.purchased;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.03]"
    >
      {/* thumbnail */}
      <CourseThumb course={course}>
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
      </CourseThumb>

      {/* body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <p className="truncate text-[10px] font-bold uppercase tracking-wide sm:text-[11px]" style={{ color: course.color }}>
              {course.category}
            </p>
            <TypeBadge type={course.type} />
          </div>
          <h3 className="text-sm font-bold leading-snug sm:text-[15px]" style={{ color: DARK }}>
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs" style={{ color: MUTED }}>
            {course.instructor && course.instructor !== DEFAULT_INSTRUCTOR
              ? course.instructor
              : course.description || course.instructor}
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
});

function CourseModal({ course, onClose, onAdvance }) {
  if (!course) return null;
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
        <CourseThumb course={{ ...course, purchased: true }}>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1B0E3D] active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </CourseThumb>
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
        <div className="relative h-20 sm:h-24">
          <CourseThumb course={{ ...course, purchased: true }}>
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
          </CourseThumb>
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
  const [longCourses, setLongCourses] = useState([]);
  const [shortCourses, setShortCourses] = useState([]);
  const [longLoaded, setLongLoaded] = useState(false);
  const [shortLoaded, setShortLoaded] = useState(false);
  const [enrollments, setEnrollments] = useState({});
  const [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false);

  const [activeFilter, setActiveFilter] = useState("All");
  const [query_, setQuery] = useState("");
  const [openCourseId, setOpenCourseId] = useState(null);
  const [buyCourseId, setBuyCourseId] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState("idle");
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user ? user.uid : null));
    return unsub;
  }, []);

  // Fetch the whole collection and filter out explicit drafts client-side
  // (rather than a server-side `where("status","==","published")` query),
  // so legacy/hand-added docs with no `status` field still show up. Mirror
  // "status !== draft" in Firestore rules too.
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "courses"),
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => c.status !== "draft");
        setLongCourses(docs);
        setLongLoaded(true);
      },
      (err) => {
        // Without this, a permission-denied error would leave longLoaded
        // stuck false forever with the UI silently spinning.
        console.error("[courses] onSnapshot error:", err.code, err.message);
        setFetchError(err.message);
        setLongLoaded(true);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "shortCourses"),
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => c.status !== "draft");
        setShortCourses(docs);
        setShortLoaded(true);
      },
      (err) => {
        console.error("[shortCourses] onSnapshot error:", err.code, err.message);
        setFetchError(err.message);
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
        setFetchError(err.message);
        setEnrollmentsLoaded(true);
      }
    );
    return unsub;
  }, [uid]);

  const loading = !longLoaded || !shortLoaded || !enrollmentsLoaded;

  // Merge both catalogs into one list, tagging each doc with a `type`
  // fallback based on which collection it came from.
  const rawCourses = useMemo(() => {
    const long = longCourses.map((c) => ({ type: c.type || "long", ...c }));
    const short = shortCourses.map((c) => ({ type: c.type || "short", ...c }));
    return [...long, ...short];
  }, [longCourses, shortCourses]);

  // Fill in every field the UI relies on so an incomplete catalog doc
  // (e.g. one added by hand in the Firebase console with only
  // category/description/duration set, no title/instructor/etc.) still
  // renders instead of crashing the filter or showing blank text.
  const courses = useMemo(() => {
    return rawCourses.map((c) => {
      const e = enrollments[c.id] || {};
      return {
        ...c,
        title: c.title || c.category || "Untitled course",
        description: c.description || "",
        icon: c.icon || iconForCategory(c.category),
        image: c.image || null,
        price: c.price || DEFAULT_PRICE,
        duration: c.duration || "Self-paced",
        lessons: c.lessons || estimateLessons(c.duration || ""),
        instructor: c.instructor || DEFAULT_INSTRUCTOR,
        color: c.color || "#5227FF",
        saved: !!e.saved,
        purchased: !!e.purchased,
        lessonsDone: e.lessonsDone || 0,
        progress: e.progress || 0,
        status: e.status || "Not started",
      };
    });
  }, [rawCourses, enrollments]);

  // "Long"/"Short" filter by course.type; "Saved" filters by the saved
  // flag; everything else (In progress/Completed) filters by enrollment
  // status, same as before.
  const filtered = useMemo(() => {
    return courses.filter((c) => {
      let matchesFilter = true;
      if (activeFilter === "Saved") matchesFilter = c.saved;
      else if (activeFilter === "Long") matchesFilter = c.type === "long";
      else if (activeFilter === "Short") matchesFilter = c.type === "short";
      else if (activeFilter !== "All") matchesFilter = c.status === activeFilter;

      const matchesQuery = (c.title || "").toLowerCase().includes(query_.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [courses, activeFilter, query_]);

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
    // TODO: once Razorpay is wired, this write should move server-side —
    // a Cloud Function verifying the payment signature before flipping
    // `purchased` to true. See firestore.rules for the matching note.
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
              value={query_}
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

        {fetchError && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
            Couldn't load courses: {fetchError}
          </div>
        )}

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
                ? "Ask an admin to publish a course from the Admin panel."
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