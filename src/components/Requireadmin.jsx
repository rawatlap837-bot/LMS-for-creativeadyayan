import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../data/Firebase";
import { Loader2 } from "lucide-react";

/**
 * RequireAdmin
 * ─────────────
 * Wraps the /admin/* routes. Without this, anyone who types
 * /admin/dashboard into the address bar gets in — the LoginForm redirect
 * only decides where people land right after signing in, it doesn't
 * protect the routes themselves.
 *
 * Usage in your router:
 *
 *   <Route element={<RequireAdmin />}>
 *     <Route path="/admin" element={<AdminLayout />}>
 *       <Route index element={<AdminDashboard />} />
 *       ...
 *     </Route>
 *   </Route>
 */
export default function RequireAdmin() {
  const [state, setState] = useState({ checked: false, allowed: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ checked: true, allowed: false });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? snap.data()?.role : null;
        setState({ checked: true, allowed: role === "admin" });
      } catch {
        // Fail safe: any error reading the role means no access.
        setState({ checked: true, allowed: false });
      }
    });
    return unsub;
  }, []);

  if (!state.checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6FC]">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D3FC0]" />
      </div>
    );
  }

  if (!state.allowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}