import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Paperclip,
} from "lucide-react";

/**
 * Assignments — Creative Adhyayan
 * Uses the same tokens as StudentLayout (violet/amber on #ECEEF3).
 */

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const DARK = "#1B0E3D";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";
const RED = "#E2483D";

const FILTERS = ["All", "Pending", "Submitted", "Graded"];

const STATUS_META = {
  Pending: { color: RED, bg: "#FBE9E7", icon: AlertCircle },
  Submitted: { color: "#B4780F", bg: "#FBF0DF", icon: Clock },
  Graded: { color: "#1C9A6C", bg: "#E4F6EE", icon: CheckCircle2 },
};

// Replace with real data from Firestore / your API
const ASSIGNMENTS = [
  {
    id: "a1",
    title: "Design a landing page for a mock course launch",
    course: "UI Design Fundamentals",
    due: "Fri, 22 May",
    status: "Pending",
    tags: ["UI Design"],
  },
  {
    id: "a2",
    title: "Build a responsive pricing table",
    course: "React for Frontend Developers",
    due: "Wed, 20 May",
    status: "Submitted",
    tags: ["Development"],
  },
  {
    id: "a3",
    title: "Type pairing exercise — headings & body copy",
    course: "Typography 101",
    due: "Mon, 11 May",
    status: "Graded",
    grade: "18/20",
    feedback: "Great contrast between weights — watch your line height on mobile.",
    tags: ["UI Design"],
  },
  {
    id: "a4",
    title: "Shoot and edit a 5-product still life set",
    course: "Product Photography Basics",
    due: "Fri, 29 May",
    status: "Pending",
    tags: ["Photography"],
  },
];

function AssignmentRow({ item }) {
  const meta = STATUS_META[item.status];
  const StatusIcon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:flex-row sm:items-center"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${ACCENT}14`, color: ACCENT }}
      >
        <ClipboardList className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
              style={{ background: `${AMBER}22`, color: "#B4780F" }}
            >
              {t}
            </span>
          ))}
        </div>
        <h3 className="truncate text-sm font-bold" style={{ color: DARK }}>
          {item.title}
        </h3>
        <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
          {item.course} · Due {item.due}
        </p>
        {item.status === "Graded" && item.feedback && (
          <p className="mt-2 rounded-lg p-2 text-xs italic" style={{ background: CANVAS, color: MUTED }}>
            "{item.feedback}"
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
          style={{ background: meta.bg, color: meta.color }}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {item.status}
        </span>

        {item.status === "Graded" ? (
          <span className="flex items-center gap-1 text-sm font-bold" style={{ color: DARK }}>
            <Star className="h-3.5 w-3.5" style={{ color: AMBER }} fill={AMBER} />
            {item.grade}
          </span>
        ) : item.status === "Pending" ? (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white"
            style={{ background: ACCENT }}
          >
            <Upload className="h-3.5 w-3.5" />
            Submit
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: MUTED }}>
            <Paperclip className="h-3.5 w-3.5" />
            Awaiting review
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function Assignments() {
  const [activeFilter, setActiveFilter] = useState("All");

  const counts = useMemo(() => {
    return FILTERS.reduce((acc, f) => {
      acc[f] = f === "All" ? ASSIGNMENTS.length : ASSIGNMENTS.filter((a) => a.status === f).length;
      return acc;
    }, {});
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return ASSIGNMENTS;
    return ASSIGNMENTS.filter((a) => a.status === activeFilter);
  }, [activeFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div>
        <h1 className="text-xl font-bold sm:text-2xl" style={{ color: DARK }}>
          Assignments
        </h1>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          Track what's due, what you've submitted, and mentor feedback.
        </p>
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
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: isActive ? DARK : "white",
                color: isActive ? "white" : MUTED,
              }}
            >
              {f}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: isActive ? "rgba(255,255,255,0.15)" : CANVAS,
                  color: isActive ? "white" : MUTED,
                }}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <AssignmentRow key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white py-16 text-center shadow-sm">
          <ClipboardList className="h-8 w-8" style={{ color: "#A79BC4" }} />
          <p className="text-sm font-semibold" style={{ color: DARK }}>
            Nothing here yet
          </p>
          <p className="text-xs" style={{ color: MUTED }}>
            Assignments in this category will show up here.
          </p>
        </div>
      )}
    </div>
  );
}