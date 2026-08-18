import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Download,
  Eye,
  Lock,
  Share2,
  Sparkles,
  X,
} from "lucide-react";

/**
 * Certificates — Creative Adhyayan
 * Uses the same tokens as StudentLayout (violet/amber on #ECEEF3).
 */

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const DARK = "#1B0E3D";
const DARK2 = "#2C1A5E";
const MUTED = "#8A82A6";
const CANVAS = "#ECEEF3";

// Replace with real data from Firestore / your API
const CERTIFICATES = [
  {
    id: "react-frontend",
    title: "React for Frontend Developers",
    issued: "12 Apr 2026",
    hours: "9h 45m",
    earned: true,
  },
  {
    id: "ui-fundamentals",
    title: "UI Design Fundamentals",
    issued: null,
    hours: "6h 20m",
    earned: false,
    progress: 90,
  },
  {
    id: "typography-101",
    title: "Typography 101",
    issued: null,
    hours: "3h 10m",
    earned: false,
    progress: 65,
  },
  {
    id: "product-photography",
    title: "Product Photography Basics",
    issued: null,
    hours: "4h 05m",
    earned: false,
    progress: 0,
  },
];

function CertificatePreview({ cert, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#1B0E3D] hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="flex flex-col items-center gap-4 px-8 py-10 text-center text-white"
          style={{ background: `linear-gradient(165deg, ${DARK2} 0%, ${DARK} 100%)` }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <Award className="h-7 w-7" style={{ color: AMBER }} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: AMBER }}>
              Certificate of Completion
            </p>
            <h3 className="mt-2 text-xl font-bold">{cert.title}</h3>
            <p className="mt-1 text-sm text-white/60">Issued on {cert.issued}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-5">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white"
            style={{ background: ACCENT }}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
            style={{ background: CANVAS, color: DARK }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CertificateCard({ cert, onView }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.03]"
    >
      <div
        className="relative flex h-28 items-center justify-center"
        style={{
          background: cert.earned
            ? `linear-gradient(150deg, ${AMBER}26, ${AMBER}0d)`
            : CANVAS,
        }}
      >
        {cert.earned ? (
          <Award className="h-9 w-9" style={{ color: AMBER }} strokeWidth={1.6} />
        ) : (
          <Lock className="h-7 w-7" style={{ color: "#A79BC4" }} strokeWidth={1.8} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[14.5px] font-bold leading-snug" style={{ color: DARK }}>
            {cert.title}
          </h3>
          <p className="mt-1 text-xs" style={{ color: MUTED }}>
            {cert.hours} course
          </p>
        </div>

        {cert.earned ? (
          <p className="text-xs font-semibold" style={{ color: "#B4780F" }}>
            Issued {cert.issued}
          </p>
        ) : (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: CANVAS }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${cert.progress}%`, background: ACCENT }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold" style={{ color: MUTED }}>
              {cert.progress}% — finish the course to unlock
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!cert.earned}
          onClick={() => onView(cert)}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-transform disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: cert.earned ? DARK : CANVAS,
            color: cert.earned ? "white" : MUTED,
          }}
        >
          <Eye className="h-4 w-4" />
          {cert.earned ? "View certificate" : "Locked"}
        </button>
      </div>
    </motion.div>
  );
}

export default function Certificates() {
  const [previewing, setPreviewing] = useState(null);
  const earnedCount = CERTIFICATES.filter((c) => c.earned).length;

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl" style={{ color: DARK }}>
            Certificates
          </h1>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            Every course you finish earns a verified certificate.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `${ACCENT}1a`, color: ACCENT }}
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold" style={{ color: DARK }}>
              {earnedCount} earned
            </p>
            <p className="text-[11px]" style={{ color: MUTED }}>
              of {CERTIFICATES.length} courses
            </p>
          </div>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {CERTIFICATES.map((cert) => (
          <CertificateCard key={cert.id} cert={cert} onView={setPreviewing} />
        ))}
      </div>

      <AnimatePresence>
        {previewing && (
          <CertificatePreview cert={previewing} onClose={() => setPreviewing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}