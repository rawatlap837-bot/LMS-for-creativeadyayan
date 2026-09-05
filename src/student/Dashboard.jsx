import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/Firebase";
import {
  Plus,
  BookOpen,
  Video,
  CalendarClock,
  Bell,
  X,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  ArrowUpRight,
  Play,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { ListRowSkeleton, RingSkeleton, Skeleton } from "../components/Skeleton"; // adjust path

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const VIOLET = "#2E1A55";
const FALLBACK_COLORS = [ACCENT, AMBER, "#22c55e", "#3b82f6", "#ec4899"];

const cardShadow = "shadow-lg shadow-violet-900/[0.06]";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" },
  }),
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CircularProgress({ value, size = 76, stroke = 7, color = ACCENT }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EFEAFB" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        style={{ transformOrigin: "center", fontSize: 15, fontWeight: 800, fill: "#1F1533" }}
      >
        {value}%
      </text>
    </svg>
  );
}

const QUICK_ACTIONS = [
  { label: "Continue courses", caption: "Pick up your last lesson", icon: BookOpen, to: "/dashboard/my-courses" },
  { label: "Study planner", caption: "Plan this week's sessions", icon: CalendarClock, to: "/dashboard/progress" },
  { label: "Live sessions", caption: "Join your next live class", icon: Video, to: "/dashboard/my-courses" },
];

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function dayLabelFromDate(date) {
  const idx = date.getDay();
  return WEEK_DAYS[idx === 0 ? 6 : idx - 1];
}

function startEndOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function timeAgo(date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);
  const [firstName, setFirstName] = useState("there");

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [liveClass, setLiveClass] = useState(null);
  const [liveClassLoading, setLiveClassLoading] = useState(true);

  const [activeDay, setActiveDay] = useState(() => {
    const idx = new Date().getDay();
    return WEEK_DAYS[idx === 0 ? 6 : idx - 1];
  });
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      const name = user?.displayName?.split(" ")[0];
      if (name) setFirstName(name);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) return;
    setNotifLoading(true);
    const q = query(
      collection(db, "notifications"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotifications(
          snap.docs.map((d) => {
            const data = d.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
            return { id: d.id, title: data.title, body: data.body, time: timeAgo(createdAt) };
          })
        );
        setNotifLoading(false);
      },
      () => setNotifLoading(false)
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setTasksLoading(true);
    const { start, end } = startEndOfToday();
    const q = query(
      collection(db, "tasks"),
      where("uid", "==", uid),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end))
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTasks(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title,
              duration: data.duration,
              progress: data.progress ?? 0,
              prevProgress: data.prevProgress ?? data.progress ?? 0,
            };
          })
        );
        setTasksLoading(false);
      },
      () => setTasksLoading(false)
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setScheduleLoading(true);
    const { start, end } = getWeekRange(weekOffset);
    const q = query(
      collection(db, "scheduleEvents"),
      where("uid", "==", uid),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end)),
      orderBy("date", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setScheduleEvents(
          snap.docs.map((d) => {
            const data = d.data();
            const date = data.date instanceof Timestamp ? data.date.toDate() : new Date();
            return {
              id: d.id,
              day: dayLabelFromDate(date),
              time: data.time || formatTime(date),
              label: data.label,
            };
          })
        );
        setScheduleLoading(false);
      },
      () => setScheduleLoading(false)
    );
    return unsub;
  }, [uid, weekOffset]);

  const agendaByDay = useMemo(() => {
    const map = {};
    WEEK_DAYS.forEach((d) => (map[d] = []));
    scheduleEvents.forEach((e) => {
      if (map[e.day]) map[e.day].push(e);
    });
    return map;
  }, [scheduleEvents]);

  useEffect(() => {
    if (!uid) return;
    setCoursesLoading(true);
    const q = query(collection(db, "enrollments"), where("uid", "==", uid), limit(4));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCourses(
          snap.docs.map((d, i) => {
            const data = d.data();
            return {
              id: d.id,
              label: data.courseName,
              value: data.progress ?? 0,
              color: data.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
            };
          })
        );
        setCoursesLoading(false);
      },
      () => setCoursesLoading(false)
    );
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setLiveClassLoading(true);
    const q = query(
      collection(db, "liveClasses"),
      where("uid", "==", uid),
      where("startTime", ">=", Timestamp.fromDate(new Date())),
      orderBy("startTime", "asc"),
      limit(1)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setLiveClass(null);
        } else {
          const d = snap.docs[0];
          const data = d.data();
          const start = data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date();
          const end = data.endTime instanceof Timestamp ? data.endTime.toDate() : null;
          setLiveClass({
            id: d.id,
            title: data.title,
            location: data.location,
            status: data.status || "upcoming",
            timeLabel: end
              ? `Today · ${formatTime(start)}–${formatTime(end)}`
              : `Today · ${formatTime(start)}`,
          });
        }
        setLiveClassLoading(false);
      },
      () => setLiveClassLoading(false)
    );
    return unsub;
  }, [uid]);

  const dismissNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.error("Failed to dismiss notification", err);
    }
  };

  const clearAllNotifications = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    try {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, "notifications", id))));
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const toggleTask = async (id) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nowDone = target.progress !== 100;
    const nextProgress = nowDone ? 100 : target.prevProgress;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, progress: nextProgress, prevProgress: nowDone ? t.progress : t.prevProgress } : t))
    );
    try {
      await updateDoc(doc(db, "tasks", id), {
        progress: nextProgress,
        prevProgress: nowDone ? target.progress : target.prevProgress,
      });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const setLiveClassStatus = async (status) => {
    if (!liveClass) return;
    setLiveClass((prev) => (prev ? { ...prev, status } : prev));
    try {
      await updateDoc(doc(db, "liveClasses", liveClass.id), { status });
    } catch (err) {
      console.error("Failed to update live class status", err);
    }
  };

  const tasksDone = tasks.filter((t) => t.progress === 100).length;

  return (
    <div className="mx-auto max-w-7xl">
      {/* ROW 1 — greeting + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className={`relative overflow-hidden rounded-3xl bg-white p-7 lg:col-span-7 ${cardShadow}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.07] blur-2xl"
            style={{ background: ACCENT }}
          />
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-[#1B0E3D] sm:text-3xl">
            Hi, {firstName}! 👋
            <br />
            What's the plan for today?
          </h2>

          {tasksLoading ? (
            <Skeleton className="mt-3 h-3 w-64" />
          ) : (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#6b5f87]">
              {`You've completed ${tasksDone} of ${tasks.length} tasks today. Keep the streak going — your next lesson is waiting.`}
            </p>
          )}

          <Link
            to="/dashboard/my-courses"
            className="group/cta mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${VIOLET})` }}
          >
            Resume learning
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          <motion.button
            type="button"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            onClick={() => navigate("/ShortCourses")}
            className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-5 text-center transition-colors hover:bg-violet-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6D3FC0] shadow-sm">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold text-[#4A3D66]">Browse courses</span>
          </motion.button>

          {QUICK_ACTIONS.slice(0, 1).map(({ label, caption, icon: Icon, to }, i) => (
            <motion.button
              key={label}
              type="button"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2 + i}
              onClick={() => navigate(to)}
              className={`flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-5 text-center transition-transform hover:-translate-y-0.5 ${cardShadow}`}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-[#1B0E3D]">{label}</span>
              <span className="text-[10px] text-[#8A82A6]">{caption}</span>
            </motion.button>
          ))}

          {QUICK_ACTIONS.slice(1).map(({ label, caption, icon: Icon, to }, i) => (
            <motion.button
              key={label}
              type="button"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3 + i}
              onClick={() => navigate(to)}
              className={`flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-5 text-center transition-transform hover:-translate-y-0.5 ${cardShadow}`}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ background: `linear-gradient(135deg, ${AMBER}, #d98f22)` }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-[#1B0E3D]">{label}</span>
              <span className="text-[10px] text-[#8A82A6]">{caption}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ROW 2 — notifications / schedule */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className={`rounded-3xl bg-white p-5 ${cardShadow}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#1B0E3D]">
              <Bell className="h-4 w-4 text-[#6D3FC0]" />
              Notifications
            </h3>
            {notifications.length > 0 && (
              <button type="button" onClick={clearAllNotifications} className="text-xs font-semibold text-[#8A82A6] hover:text-[#6D3FC0]">
                Clear
              </button>
            )}
          </div>

          {notifLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => <ListRowSkeleton key={i} />)}
            </div>
          ) : notifications.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#A79BC4]">You're all caught up.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="group flex items-start justify-between gap-2 rounded-2xl bg-[#F7F5FC] p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#1B0E3D]">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[#8A82A6]">{n.body}</p>
                    <p className="mt-1 text-[10px] font-medium text-[#B4ABCB]">{n.time}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissNotification(n.id)}
                    aria-label="Dismiss"
                    className="shrink-0 rounded-full p-1 text-[#B4ABCB] opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className={`rounded-3xl bg-white p-5 ${cardShadow}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1B0E3D]">This week</h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w - 1)}
                aria-label="Previous week"
                className="rounded-full p-1 text-[#8A82A6] hover:bg-violet-50 hover:text-[#6D3FC0]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                aria-label="Next week"
                className="rounded-full p-1 text-[#8A82A6] hover:bg-violet-50 hover:text-[#6D3FC0]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {weekOffset !== 0 && (
            <p className="mb-2 text-[10px] font-semibold text-[#B4ABCB]">
              {weekOffset > 0 ? `${weekOffset} week(s) ahead` : `${-weekOffset} week(s) back`}
              {" · "}
              <button type="button" onClick={() => setWeekOffset(0)} className="underline underline-offset-2 hover:text-[#6D3FC0]">
                back to this week
              </button>
            </p>
          )}

          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition-colors"
                style={{
                  background: activeDay === day ? ACCENT : "transparent",
                  color: activeDay === day ? "#fff" : "#8A82A6",
                }}
              >
                {day[0]}
                {(agendaByDay[day] || []).length > 0 && (
                  <span className="h-1 w-1 rounded-full" style={{ background: activeDay === day ? "#fff" : AMBER }} />
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {scheduleLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <ListRowSkeleton key={i} />)}
              </div>
            ) : (agendaByDay[activeDay] || []).length === 0 ? (
              <p className="py-4 text-center text-xs text-[#A79BC4]">Nothing scheduled.</p>
            ) : (
              agendaByDay[activeDay].map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-[#F7F5FC] p-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: ACCENT }}>
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-[#1B0E3D]">{item.label}</p>
                    <p className="text-[10px] text-[#8A82A6]">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ROW 3 — tasks / upgrade / progress / live class */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className={`rounded-3xl bg-white p-5 lg:col-span-5 ${cardShadow}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1B0E3D]">Today's tasks</h3>
            <span className="text-[11px] font-semibold text-[#8A82A6]">
              {tasksDone}/{tasks.length} done
            </span>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <ListRowSkeleton key={i} />)}
            </div>
          ) : tasks.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#A79BC4]">No tasks for today.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => {
                const done = t.progress === 100;
                return (
                  <li key={t.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTask(t.id)}
                      aria-label={done ? "Mark as not done" : "Mark as done"}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      style={{ borderColor: done ? ACCENT : "#D9D2EC", background: done ? ACCENT : "transparent" }}
                    >
                      {done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-xs font-bold ${done ? "text-[#B4ABCB] line-through" : "text-[#1B0E3D]"}`}>{t.title}</p>
                        <span className="shrink-0 text-[10px] font-semibold text-[#8A82A6]">{t.duration}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EFEAFB]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${t.progress}%`, background: done ? "#22c55e" : ACCENT }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={8}
          className="relative overflow-hidden rounded-3xl p-5 text-white lg:col-span-3"
          style={{ background: `linear-gradient(155deg, #6D3FC0, ${VIOLET})` }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-xl"
            style={{ background: AMBER }}
          />
          <Crown className="h-7 w-7" style={{ color: AMBER }} />
          <h3 className="mt-3 text-base font-black leading-tight">Go Premium</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/70">
            Unlock mentor 1:1s, verified certificates, and every course in the catalog.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/payments")}
            className="mt-4 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#2E1A55] transition-transform active:scale-[0.98]"
          >
            Explore plans
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9} className={`flex flex-col justify-center gap-4 rounded-3xl bg-white p-5 lg:col-span-2 ${cardShadow}`}>
          {coursesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <RingSkeleton size={56} />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : courses.length === 0 ? (
            <p className="text-center text-xs text-[#A79BC4]">No courses yet.</p>
          ) : (
            courses.map((c) => (
              <button key={c.id} type="button" onClick={() => navigate("/dashboard/my-courses")} className="flex items-center gap-3 text-left transition-opacity hover:opacity-80">
                <CircularProgress value={c.value} color={c.color} size={56} stroke={6} />
                <span className="text-[11px] font-bold leading-tight text-[#1B0E3D]">{c.label}</span>
              </button>
            ))
          )}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={10} className={`rounded-3xl bg-white p-5 lg:col-span-2 ${cardShadow}`}>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#1B0E3D]">
            <Video className="h-4 w-4 text-[#6D3FC0]" />
            Live class
          </h3>

          {liveClassLoading ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="mt-3 h-8 w-full rounded-full" />
            </div>
          ) : !liveClass ? (
            <p className="mt-3 text-center text-xs text-[#A79BC4]">No upcoming live class.</p>
          ) : (
            <>
              <p className="mt-2 text-xs font-bold text-[#1B0E3D]">{liveClass.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-[#8A82A6]">
                <Clock className="h-3 w-3" />
                {liveClass.timeLabel}
              </p>
              {liveClass.location && (
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#8A82A6]">
                  <MapPin className="h-3 w-3" />
                  {liveClass.location}
                </p>
              )}

              {liveClass.status === "joined" ? (
                <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-600">
                  You're in! See you there.
                </p>
              ) : liveClass.status === "rescheduled" ? (
                <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-[11px] font-bold text-amber-700">
                  Reschedule requested.
                </p>
              ) : (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLiveClassStatus("rescheduled")}
                    aria-label="Request reschedule"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-100 text-[#6D3FC0] transition-colors hover:bg-violet-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveClassStatus("joined")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold text-white transition-transform active:scale-[0.98]"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${VIOLET})` }}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Join
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}