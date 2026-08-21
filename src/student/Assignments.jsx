import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Loader2,
  Lock,
  FileText,
  RefreshCcw,
} from "lucide-react";
import { auth, db, storage } from "../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Assignments — Creative Adhyayan (live Firestore + Storage version, mobile-first)
 *
 * DATA MODEL — unchanged:
 *   assignments (collection): title, course, due, tags[]
 *   users/{uid}/submissions (subcollection): status, fileName, fileURL,
 *     submittedAt, grade, feedback
 */

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const DARK = "#1B0E3D";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";
const RED = "#E2483D";

const FILTERS = ["All", "Pending", "Submitted", "Graded"];
const MAX_FILE_MB = 15;

const STATUS_META = {
  Pending: { color: RED, bg: "#FBE9E7", icon: AlertCircle },
  Submitted: { color: "#B4780F", bg: "#FBF0DF", icon: Clock },
  Graded: { color: "#1C9A6C", bg: "#E4F6EE", icon: CheckCircle2 },
};

function formatDue(due) {
  if (!due) return "No due date";
  if (typeof due === "object" && typeof due.toDate === "function") {
    return due.toDate().toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }
  return due;
}

function AssignmentRow({ item, onPickFile, isUploading, uploadError }) {
  const meta = STATUS_META[item.status];
  const StatusIcon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className="flex flex-col gap-3.5 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-black/[0.03] sm:flex-row sm:items-center sm:gap-4 sm:p-4"
    >
      <div className="flex items-start gap-3 sm:contents">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
          style={{ background: `${ACCENT}14`, color: ACCENT }}
        >
          <ClipboardList className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            {(item.tags || []).map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:text-[10.5px]"
                style={{ background: `${AMBER}22`, color: "#B4780F" }}
              >
                {t}
              </span>
            ))}
          </div>
          <h3 className="truncate text-sm font-bold" style={{ color: DARK }}>
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-xs" style={{ color: MUTED }}>
            {item.course} · Due {formatDue(item.due)}
          </p>

          {item.status !== "Pending" && item.fileName && (
            <a
              href={item.fileURL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-lg px-2 py-1 text-xs font-semibold"
              style={{ background: CANVAS, color: ACCENT }}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.fileName}</span>
            </a>
          )}

          {item.status === "Graded" && item.feedback && (
            <p className="mt-2 rounded-lg p-2 text-xs italic" style={{ background: CANVAS, color: MUTED }}>
              "{item.feedback}"
            </p>
          )}

          {uploadError && (
            <p className="mt-2 text-xs font-semibold" style={{ color: RED }}>
              {uploadError}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold sm:px-3 sm:text-xs"
          style={{ background: meta.bg, color: meta.color }}
        >
          <StatusIcon className="h-3.5 w-3.5 shrink-0" />
          {item.status}
        </span>

        {item.status === "Graded" ? (
          <span className="flex items-center gap-1 text-sm font-bold" style={{ color: DARK }}>
            <Star className="h-3.5 w-3.5" style={{ color: AMBER }} fill={AMBER} />
            {item.grade || "—"}
          </span>
        ) : item.status === "Pending" ? (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => onPickFile(item.id)}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white disabled:opacity-70"
            style={{ background: ACCENT }}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Submit
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => onPickFile(item.id)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold disabled:opacity-70"
            style={{ color: MUTED }}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            {isUploading ? "Replacing…" : "Replace file"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function Assignments() {
  const [uid, setUid] = useState(undefined);
  const [rawAssignments, setRawAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("All");
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});

  const fileInputRef = useRef(null);
  const pendingAssignmentId = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user ? user.uid : null));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "assignments"), (snap) => {
      setRawAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) {
      setSubmissions({});
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, "users", uid, "submissions"), (snap) => {
      const next = {};
      snap.docs.forEach((d) => (next[d.id] = d.data()));
      setSubmissions(next);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const assignments = useMemo(() => {
    return rawAssignments.map((a) => {
      const s = submissions[a.id] || {};
      return {
        ...a,
        status: s.status || "Pending",
        fileName: s.fileName || null,
        fileURL: s.fileURL || null,
        grade: s.grade || null,
        feedback: s.feedback || null,
      };
    });
  }, [rawAssignments, submissions]);

  const sorted = useMemo(() => {
    const rank = { Pending: 0, Submitted: 1, Graded: 2 };
    return [...assignments].sort((a, b) => (rank[a.status] ?? 0) - (rank[b.status] ?? 0));
  }, [assignments]);

  const counts = useMemo(() => {
    return FILTERS.reduce((acc, f) => {
      acc[f] = f === "All" ? sorted.length : sorted.filter((a) => a.status === f).length;
      return acc;
    }, {});
  }, [sorted]);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return sorted;
    return sorted.filter((a) => a.status === activeFilter);
  }, [sorted, activeFilter]);

  const submissionRef = (assignmentId) => doc(db, "users", uid, "submissions", assignmentId);

  const openFilePicker = (assignmentId) => {
    setUploadErrors((prev) => ({ ...prev, [assignmentId]: null }));
    pendingAssignmentId.current = assignmentId;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const assignmentId = pendingAssignmentId.current;
    if (!file || !assignmentId || !uid) return;

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadErrors((prev) => ({
        ...prev,
        [assignmentId]: `File is too large — max ${MAX_FILE_MB}MB.`,
      }));
      return;
    }

    setUploadingId(assignmentId);
    setUploadErrors((prev) => ({ ...prev, [assignmentId]: null }));

    try {
      const path = `submissions/${uid}/${assignmentId}/${Date.now()}-${file.name}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      await setDoc(
        submissionRef(assignmentId),
        {
          status: "Submitted",
          fileName: file.name,
          fileURL,
          submittedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      setUploadErrors((prev) => ({
        ...prev,
        [assignmentId]: "Upload failed. Please try again.",
      }));
    } finally {
      setUploadingId(null);
    }
  };

  if (uid === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  if (uid === null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center">
        <Lock className="h-8 w-8" style={{ color: "#A79BC4" }} />
        <p className="text-sm font-semibold" style={{ color: DARK }}>
          Please log in to view your assignments
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 overflow-x-hidden px-4 pb-6 pt-4 sm:gap-6 sm:px-0 sm:pt-0">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      {/* header */}
      <div>
        <h1 className="text-lg font-bold sm:text-2xl" style={{ color: DARK }}>
          Assignments
        </h1>
        <p className="mt-1 text-xs sm:text-sm" style={{ color: MUTED }}>
          Track what's due, what you've submitted, and mentor feedback.
        </p>
      </div>

      {/* filters — full-bleed scroll on mobile, scrollbar hidden */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-1">
          {FILTERS.map((f) => {
            const isActive = f === activeFilter;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
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
      </div>

      {/* list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 sm:py-24">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <AssignmentRow
                key={item.id}
                item={item}
                onPickFile={openFilePicker}
                isUploading={uploadingId === item.id}
                uploadError={uploadErrors[item.id]}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 py-14 text-center shadow-sm sm:py-16">
          <ClipboardList className="h-8 w-8" style={{ color: "#A79BC4" }} />
          <p className="text-sm font-semibold" style={{ color: DARK }}>
            {rawAssignments.length === 0 ? "No assignments yet" : "Nothing here yet"}
          </p>
          <p className="text-xs" style={{ color: MUTED }}>
            {rawAssignments.length === 0
              ? "Add a document to the 'assignments' collection in Firestore."
              : "Assignments in this category will show up here."}
          </p>
        </div>
      )}
    </div>
  );
}