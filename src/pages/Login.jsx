import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
 * Same brand system as the rest of the LMS: deep violet (#2E1A55) + indigo (#6D3FC0)
 * + amber (#E8A33D). Split-screen layout: dark brand panel on the left (desktop),
 * clean white form card on the right.
 *
 * NOTE: The previous version imported an external `Cubes` component that wasn't
 * available, which is why it rendered as a broken, oversized, non-responsive
 * column instead of a background. It's been replaced below with a small,
 * self-contained `CubeField` — sized to its container (so it's responsive by
 * construction), using the brand palette, and placed under the intro subtext
 * inside the left panel instead of floating over the whole page.
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

/**
 * Cube — a single cell in the field. Tilts toward the cursor when it's
 * within `influenceRadius`, decaying smoothly to flat as the mouse moves
 * away or leaves the grid.
 */
function Cube({ containerRef, mouse, isAmber, isFilled, influenceRadius = 90 }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: "none" });

  useEffect(() => {
    const el = ref.current;
    const container = containerRef.current;
    if (!el || !container) return;

    if (!mouse) {
      setStyle((s) => (s.transform === "none" ? s : { transform: "none" }));
      return;
    }

    const cubeRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const centerX = cubeRect.left - containerRect.left + cubeRect.width / 2;
    const centerY = cubeRect.top - containerRect.top + cubeRect.height / 2;
    const dx = mouse.x - centerX;
    const dy = mouse.y - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > influenceRadius) {
      setStyle((s) => (s.transform === "none" ? s : { transform: "none" }));
      return;
    }

    const influence = 1 - dist / influenceRadius;
    const rotateY = (dx / influenceRadius) * 30 * influence;
    const rotateX = -(dy / influenceRadius) * 30 * influence;
    const scale = 1 + influence * 0.3;
    const lift = influence * 4;

    setStyle({
      transform: `perspective(320px) translateY(${-lift}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
    });
  }, [mouse, containerRef, influenceRadius]);

  return (
    <div
      ref={ref}
      className="aspect-square rounded-[4px] border transition-transform duration-150 ease-out"
      style={{
        borderStyle: "dashed",
        borderColor: isAmber ? "#E8A33D80" : "#B497CF4D",
        background: isFilled
          ? "linear-gradient(135deg, #6D3FC066, #2E1A5500)"
          : "#2E1A5533",
        transformStyle: "preserve-3d",
        ...style,
      }}
    />
  );
}

/**
 * CubeField — small, responsive, mouse-reactive decorative cube grid.
 * - `repeat(auto-fill, minmax(...))` means the number of columns adapts to
 *   whatever width its parent gives it, so it never overflows or needs a
 *   fixed viewport size.
 * - Cubes are capped with `max-h` + `overflow-hidden` on the wrapper so it
 *   sits neatly under the subtext instead of pushing the footer down.
 * - Colors pull from the existing brand set: indigo (#6D3FC0), violet
 *   (#2E1A55), amber (#E8A33D) as an occasional accent.
 * - Mouse position is tracked relative to the grid container and passed
 *   down; each Cube tilts toward the cursor when it's nearby.
 */
function CubeField({ className = "", count = 40 }) {
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState(null);
  const frame = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setMouse({ x, y }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    setMouse(null);
  }, []);

  useEffect(() => () => frame.current && cancelAnimationFrame(frame.current), []);

  const cubes = Array.from({ length: count });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`grid grid-cols-[repeat(auto-fill,minmax(22px,1fr))] gap-2 ${className}`}
      style={{ perspective: "600px" }}
      aria-hidden="true"
    >
      {cubes.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.012, ease: "easeOut" }}
        >
          <Cube
            containerRef={containerRef}
            mouse={mouse}
            isAmber={i % 9 === 0}
            isFilled={i % 5 === 0}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.email || !form.password) {
      setStatus("error");
      setErrorMsg("Enter both your email and password to continue.");
      return;
    }

    setStatus("submitting");
    try {
      // TODO: replace with your real auth call
      // const res = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error("Invalid email or password");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F6FC]">
      <section className="relative z-10 flex min-h-screen text-[#1F1533]">
        {/* ================= LEFT — BRAND PANEL (desktop only) ================= */}
        <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-gradient-to-br from-[#1B0F38]/95 via-[#2E1A55]/95 to-[#3A2170]/95 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <DotGrid className="pointer-events-none absolute right-6 top-8" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 bottom-0 h-[380px] w-[380px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #6D3FC0 0%, transparent 70%)" }}
          />

          <div className="relative flex items-center gap-2 text-white">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #6D3FC0, #E8A33D)" }}
            >
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">Creative Adhyayan</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative max-w-sm"
          >
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Welcome back
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-white">
              Pick up right where you left off.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Log in to track your course progress, join live batches, and stay
              connected with your mentors.
            </p>

            {/* Cube grid sits directly under the subtext, sized to the panel's
                own width — grows/shrinks with it, never overflows. */}
            <CubeField className="mt-6 max-h-[240px] overflow-hidden" count={40} />
          </motion.div>

          <p className="relative text-xs text-white/40">
            © {new Date().getFullYear()} Creative Adhyayan. All rights reserved.
          </p>
        </div>

        {/* ================= RIGHT — FORM ================= */}
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-xl shadow-violet-900/10 backdrop-blur-sm lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0"
          >
            {/* mobile-only brand mark */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #6D3FC0, #2E1A55)" }}
              >
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="text-lg font-black tracking-tight text-[#2E1A55]">
                Creative Adhyayan
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-tight">Log in</h2>
            <p className="mt-2 text-sm text-[#6b5f87]">
              New here?{" "}
              <a href="/signup" className="font-semibold text-[#6D3FC0] hover:underline">
                Create an account
              </a>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* email */}
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
                    className="w-full rounded-xl border border-violet-100 bg-white py-3 pl-10 pr-4 text-sm text-[#1F1533] placeholder:text-[#A79BC4] outline-none transition-colors focus:border-[#6D3FC0] focus:ring-2 focus:ring-[#6D3FC0]/20"
                  />
                </div>
              </div>

              {/* password */}
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

              {/* remember me */}
              <label className="flex select-none items-center gap-2 text-sm text-[#4A3D66]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-violet-200 text-[#6D3FC0] focus:ring-[#6D3FC0]/30"
                />
                Remember me
              </label>

              {/* error */}
              {status === "error" && errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
                >
                  {errorMsg}
                </motion.p>
              )}

              {/* submit — two-part pill, matching the rest of the site */}
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
                <span
                  className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#2E1A55] transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:rotate-45"
                >
                  {status === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  )}
                </span>
              </button>
            </form>

            {/* divider */}
            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-violet-100" />
              <span className="text-xs font-medium uppercase tracking-wide text-[#A79BC4]">or</span>
              <span className="h-px flex-1 bg-violet-100" />
            </div>

            {/* social login */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-violet-100 bg-white py-3 text-sm font-semibold text-[#2E1A55] transition-colors hover:border-violet-200 hover:bg-violet-50"
            >
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
              Continue with Google
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