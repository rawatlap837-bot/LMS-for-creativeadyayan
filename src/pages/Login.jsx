import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Cubes from "../Animiations/Cubes";
import { auth, db } from "../firebase/Firebase"; // make sure Firebase.js exports `db` (getFirestore(app))
import { doc, getDoc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  GraduationCap,
} from "lucide-react";

/**
 * Login — Creative Adhyayan
 * Same brand system as the rest of the LMS: deep violet (#2E1A55) + indigo
 * (#6D3FC0) + amber (#E8A33D). Split-screen layout: dark brand panel on the
 * left (desktop), clean white form card on the right.
 *
 * ROLE-BASED ROUTING
 * ───────────────────
 * This is still one login form for everyone — students and admins use the
 * same email/password (or Google) sign-in. After Firebase confirms who the
 * person IS, we separately look up WHAT they are allowed to do:
 *
 *   users/{uid}  →  { role: "admin" | "student", ... }
 *
 * That Firestore document is the source of truth. A student is sent to
 * /dashboard; an admin is sent to /admin/dashboard. If the role lookup
 * fails or the field is missing, we fail SAFE and send them to /dashboard —
 * never assume admin. Firestore security rules must forbid a client from
 * writing their own `role` field (see note at the bottom of this file);
 * otherwise this check is decorative, not real access control.
 */

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

const CUBE_GRID_SIZE = 8;

function shouldUseRedirect() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobi/i.test(ua);
  const isInAppBrowser = /FBAN|FBAV|Instagram|Line\//i.test(ua);
  const isNarrowViewport = typeof window !== "undefined" && window.innerWidth < 768;
  return isMobileUA || isInAppBrowser || isNarrowViewport;
}

function firebaseAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support if that's unexpected.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Please try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Looks up the signed-in user's role and returns the route they should
// land on. Fails safe: any missing doc, missing field, or read error
// resolves to the student dashboard, never the admin one.
async function resolvePostLoginRoute(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    const role = snap.exists() ? snap.data()?.role : null;
    return role === "admin" ? "/admin" : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const cubesRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to the very top whenever this page mounts — e.g. when the user
  // clicks "Log in" in the navbar from somewhere scrolled down on another
  // page. The documentElement/body fallback covers older/mobile Safari,
  // where window.scrollTo alone can be unreliable right after a route change.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Pick up the result after returning from Google's redirect flow (mobile
  // path). On desktop this simply resolves to null and does nothing.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!cancelled && result?.user) {
          const dest = await resolvePostLoginRoute(result.user);
          navigate(dest);
        }
      } catch (err) {
        if (!cancelled) {
          const message = firebaseAuthErrorMessage(err);
          if (message) {
            setStatus("error");
            setErrorMsg(message);
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pulseCubesFor = (fieldName, value) => {
    const col = Math.min(
      CUBE_GRID_SIZE - 1,
      value.length % (CUBE_GRID_SIZE + 3)
    );
    const row = fieldName === "email" ? 1.5 : 4.5;
    cubesRef.current?.pulse(row, col);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    pulseCubesFor(e.target.name, e.target.value);
  };

  const handleFocus = (e) => {
    pulseCubesFor(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    scrollToTop();
    setErrorMsg("");

    if (!form.email || !form.password) {
      setStatus("error");
      setErrorMsg("Enter both your email and password to continue.");
      return;
    }

    setStatus("submitting");
    cubesRef.current?.ripple(2.5, 2.5);
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);
      const dest = await resolvePostLoginRoute(user);
      setStatus("idle");
      navigate(dest);
    } catch (err) {
      setStatus("error");
      setErrorMsg(firebaseAuthErrorMessage(err));
    }
  };

  const handleGoogleSignIn = async () => {
    scrollToTop();
    setErrorMsg("");
    setGoogleLoading(true);

    const provider = new GoogleAuthProvider();
    const useRedirect = shouldUseRedirect();

    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );

      if (useRedirect) {
        // Navigates away from the page — no further code here runs until
        // the effect above picks up getRedirectResult() when we come back.
        await signInWithRedirect(auth, provider);
        return;
      }

      const { user } = await signInWithPopup(auth, provider);
      const dest = await resolvePostLoginRoute(user);
      navigate(dest);
    } catch (err) {
      const message = firebaseAuthErrorMessage(err);
      if (message) {
        setStatus("error");
        setErrorMsg(message);
      }
    } finally {
      // On the redirect path the page is already navigating away, so this
      // only matters for the popup path (desktop).
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F6FC]">
      <section className="relative z-10 flex min-h-screen text-[#1F1533]">
        <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-gradient-to-br from-[#1B0F38]/95 via-[#2E1A55]/95 to-[#3A2170]/95 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <DotGrid className="pointer-events-none absolute right-6 top-8" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 bottom-0 h-[380px] w-[380px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #6D3FC0 0%, transparent 70%)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative max-w-sm"
          >
            <span className="inline-block mt-20 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Welcome back
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-white">
              Pick up right where you left off.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Log in to track your course progress, join live batches, and stay
              connected with your mentors.
            </p>

            <div className="mt-7 w-full">
              <Cubes
                ref={cubesRef}
                gridSize={CUBE_GRID_SIZE}
                radius={4}
                maxAngle={32}
                faceColor="transparent"
                borderStyle="2px dashed rgba(216, 189, 250, 0.7)"
                rippleColor="#E8A33D"
                shadow="none"
                cellGap={12}
                className="w-full max-w-[240px]"
              />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-1 items-center justify-center px-3 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-xl shadow-violet-900/10 backdrop-blur-sm lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0"
          >
            <h2 className="text-3xl font-semibold tracking-tight">Log in</h2>
            <p className="mt-2 text-sm text-[#6b5f87]">
              New here?{" "}
              <a href="/register" className="font-semibold text-[#6D3FC0] hover:underline">
                Create an account
              </a>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#4A3D66]"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A79BC4]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="w-full rounded-xl border border-violet-100 bg-white py-3 pl-10 pr-4 text-sm text-[#1F1533] placeholder:text-[#A79BC4] outline-none transition-colors focus:border-[#6D3FC0] focus:ring-2 focus:ring-[#6D3FC0]/20"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#4A3D66]"
                  >
                    Password
                  </label>
                  <a href="/forgot-password" className="text-xs font-semibold text-[#6D3FC0] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A79BC4]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="w-full rounded-xl border border-violet-100 bg-white py-3 pl-10 pr-10 text-sm text-[#1F1533] placeholder:text-[#A79BC4] outline-none transition-colors focus:border-[#6D3FC0] focus:ring-2 focus:ring-[#6D3FC0]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A79BC4] transition-colors hover:text-[#6D3FC0]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex select-none items-center gap-2 text-sm text-[#4A3D66]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-violet-200 text-[#6D3FC0] focus:ring-[#6D3FC0]/30"
                />
                Remember me
              </label>

              {status === "error" && errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
                >
                  {errorMsg}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="group/btn relative flex w-full items-center justify-between overflow-hidden rounded-full p-1 pl-5 text-sm font-bold text-white shadow-lg shadow-violet-900/20 transition-transform active:scale-[0.98] disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #6D3FC0, #2E1A55)" }}
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/20 opacity-0 transition-all duration-500 group-hover/btn:left-full group-hover/btn:opacity-100" />
                <span className="relative z-10">
                  {status === "submitting" ? "Logging in…" : "Log in"}
                </span>
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#2E1A55] transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:rotate-45">
                  {status === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  )}
                </span>
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-violet-100" />
              <span className="text-xs font-medium uppercase tracking-wide text-[#A79BC4]">or</span>
              <span className="h-px flex-1 bg-violet-100" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-violet-100 bg-white py-3 text-sm font-semibold text-[#2E1A55] transition-colors hover:border-violet-200 hover:bg-violet-50 disabled:opacity-70"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.55-5.17 3.55-8.66Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
                  />
                </svg>
              )}
              {googleLoading ? "Signing in…" : "Continue with Google"}
            </button>

            <p className="mt-8 text-center text-xs text-[#A79BC4]">
              By logging in, you agree to our{" "}
              <a href="/terms" className="font-medium text-[#6D3FC0] hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="font-medium text-[#6D3FC0] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/*
 * SETTING SOMEONE UP AS ADMIN
 * ────────────────────────────
 * 1. In Firestore, the doc at users/{their-uid} needs { role: "admin" }.
 *    Do this from the Firebase console or a trusted backend script —
 *    NEVER expose an endpoint that lets a logged-in client set their own
 *    role field.
 * 2. Lock it down with a security rule so clients can read their own role
 *    but only an admin (or your backend) can write it, e.g.:
 *
 *      match /users/{userId} {
 *        allow read: if request.auth.uid == userId;
 *        allow write: if request.auth.uid == userId
 *                     && request.resource.data.role == resource.data.role;
 *      }
 *
 * 3. Route guard: wrap AdminLayout in a RequireAdmin component (see
 *    RequireAdmin.jsx) so someone can't just type /admin/dashboard into
 *    the URL bar and get in without the role check.
 */