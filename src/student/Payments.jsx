import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db } from "../firebase/Firebase"; // adjust path to match your project
import { CreditCard, CheckCircle2, IndianRupee, Loader2, ShieldCheck } from "lucide-react";

const ACCENT = "#5227FF";
const AMBER = "#E8A33D";
const VIOLET = "#2E1A55";
const cardShadow = "shadow-lg shadow-violet-900/[0.06]";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" } }),
};

// Loads the Razorpay checkout script once and caches the promise.
let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

export default function Payments() {
  const [uid, setUid] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: "", email: "", phone: "" });

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [enrolledIds, setEnrolledIds] = useState(new Set());

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [payingId, setPayingId] = useState(null); // course currently mid-checkout
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      setUserProfile({
        name: user?.displayName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
      });
    });
    return unsub;
  }, []);

  /* all purchasable courses */
  useEffect(() => {
    setCoursesLoading(true);
    const unsub = onSnapshot(
      collection(db, "courses"),
      (snap) => {
        setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCoursesLoading(false);
      },
      () => setCoursesLoading(false)
    );
    return unsub;
  }, []);

  /* which of those the user already owns */
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "enrollments"), where("uid", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      setEnrolledIds(new Set(snap.docs.map((d) => d.data().courseId)));
    });
    return unsub;
  }, [uid]);

  /* payment history */
  useEffect(() => {
    if (!uid) return;
    setHistoryLoading(true);
    const q = query(collection(db, "payments"), where("uid", "==", uid), where("status", "==", "paid"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const paidAt = data.paidAt?.toDate ? data.paidAt.toDate() : null;
          return { id: d.id, ...data, paidAt };
        });
        rows.sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));
        setHistory(rows);
        setHistoryLoading(false);
      },
      () => setHistoryLoading(false)
    );
    return unsub;
  }, [uid]);

  const handleBuy = async (course) => {
    setError("");
    if (!uid) {
      setError("Please log in to purchase a course.");
      return;
    }
    setPayingId(course.id);

    try {
      await loadRazorpayScript();

      const functions = getFunctions();
      const createOrder = httpsCallable(functions, "createRazorpayOrder");
      const verifyPayment = httpsCallable(functions, "verifyRazorpayPayment");

      const { data: order } = await createOrder({
        courseId: course.id,
        courseName: course.name,
        amount: course.price,
      });

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Creative Adhyayan",
        description: course.name,
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
          contact: userProfile.phone,
        },
        theme: { color: ACCENT },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // enrollments listener above will flip this course to "Enrolled" automatically
          } catch (err) {
            console.error(err);
            setError("Payment verification failed. If money was deducted, it will be refunded — contact support with your payment ID.");
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      });

      rzp.on("payment.failed", (resp) => {
        console.error(resp.error);
        setError(`Payment failed: ${resp.error.description || "please try again."}`);
        setPayingId(null);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Couldn't start checkout. Please try again in a moment.");
      setPayingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-[#1B0E3D]">Payments</h2>
        <p className="mt-1 text-sm text-[#6b5f87]">Secure checkout powered by Razorpay — UPI, cards, netbanking, wallets.</p>
      </motion.div>

      {error && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </motion.div>
      )}

      {/* purchasable courses */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
        <h3 className="mb-3 text-sm font-bold text-[#1B0E3D]">Available courses</h3>

        {coursesLoading ? (
          <div className={`rounded-3xl bg-white p-10 text-center ${cardShadow}`}>
            <p className="text-xs text-[#A79BC4]">Loading courses…</p>
          </div>
        ) : courses.length === 0 ? (
          <div className={`rounded-3xl bg-white p-10 text-center ${cardShadow}`}>
            <p className="text-xs text-[#A79BC4]">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((course, i) => {
              const owned = enrolledIds.has(course.id);
              const paying = payingId === course.id;
              return (
                <motion.div
                  key={course.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={3 + i}
                  className={`flex flex-col justify-between rounded-3xl bg-white p-5 ${cardShadow}`}
                >
                  <div>
                    <p className="text-sm font-bold text-[#1B0E3D]">{course.name}</p>
                    {course.description && <p className="mt-1 line-clamp-2 text-[11px] text-[#8A82A6]">{course.description}</p>}
                    <p className="mt-3 flex items-center gap-0.5 text-lg font-black" style={{ color: ACCENT }}>
                      <IndianRupee className="h-4 w-4" />
                      {course.price?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {owned ? (
                    <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 py-2 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Enrolled
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={paying}
                      onClick={() => handleBuy(course)}
                      className="mt-4 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${VIOLET})` }}
                    >
                      {paying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3.5 w-3.5" />
                          Buy now
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* payment history */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8} className="mt-8">
        <h3 className="mb-3 text-sm font-bold text-[#1B0E3D]">Payment history</h3>
        {historyLoading ? (
          <div className={`rounded-3xl bg-white p-6 text-center ${cardShadow}`}>
            <p className="text-xs text-[#A79BC4]">Loading…</p>
          </div>
        ) : history.length === 0 ? (
          <div className={`rounded-3xl bg-white p-6 text-center ${cardShadow}`}>
            <p className="text-xs text-[#A79BC4]">No payments yet.</p>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-3xl bg-white ${cardShadow}`}>
            {history.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 px-5 py-3 ${i !== history.length - 1 ? "border-b border-[#F0ECFA]" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#1B0E3D]">{p.courseName}</p>
                  <p className="mt-0.5 text-[10px] text-[#8A82A6]">
                    {p.paidAt ? p.paidAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    {" · "}
                    {p.razorpayPaymentId}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#1B0E3D]">
                  <IndianRupee className="h-3 w-3" />
                  {p.amount?.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#B4ABCB]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Payments are verified server-side and never trusted from the browser.
      </p>
    </div>
  );
}