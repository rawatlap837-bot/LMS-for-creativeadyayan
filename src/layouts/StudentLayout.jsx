import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../data/Firebase";
import CALogo from "../assets/Images/CA.png";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  ClipboardList,
  Award,
  CreditCard,
  UserCircle,
  LogOut,
  ChevronsLeft,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";

/**
 * StudentLayout — Creative Adhyayan
 * Dark violet sidebar (same gradient/canvas tokens as the site Navbar:
 * #2C1A5E → #1B0E3D on #ECEEF3) with a collapsible rail, an animated
 * sliding active-indicator (framer-motion layoutId), and a mobile drawer
 * that mirrors the Navbar's slide/fade pattern. Topbar carries a greeting,
 * search, notifications, and an account menu wired to Firebase auth.
 */

const CANVAS = "#ECEEF3";
const LIGHT = "#ffffff";
const DARK = "#c7cbd9";
const SIDEBAR_BG = "linear-gradient(165deg, #2C1A5E 0%, #1B0E3D 100%)";
const ACCENT = "#5227FF";
const AMBER = "#E8A33D";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Courses", to: "/dashboard/my-courses", icon: BookOpen },
  { label: "Progress", to: "/dashboard/progress", icon: TrendingUp },
  { label: "Assignments", to: "/dashboard/assignments", icon: ClipboardList },
  { label: "Certificates", to: "/dashboard/certificates", icon: Award },
  { label: "Payments", to: "/dashboard/payments", icon: CreditCard },
  { label: "Profile", to: "/dashboard/profile", icon: UserCircle },
];

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/my-courses": "My Courses",
  "/dashboard/progress": "Progress",
  "/dashboard/assignments": "Assignments",
  "/dashboard/certificates": "Certificates",
  "/dashboard/payments": "Payments",
  "/dashboard/profile": "Profile",
};

function initialsFrom(name, email) {
  const source = (name || email || "?").trim();
  if (!source) return "?";
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------
   Sidebar — shared by desktop rail and mobile drawer. `collapsed`
   only applies on desktop; the mobile drawer always renders labels.
------------------------------------------------------------------- */
function SidebarContent({ collapsed, onNavigate, user, onLogout }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col px-3 py-5 text-white">
      {/* brand */}
      <div className={`mb-8 flex items-center gap-2.5 px-2 ${collapsed ? "justify-center" : ""}`}>
        <img src={CALogo} alt="Creative Adhyayan" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="brand-label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden whitespace-nowrap text-sm font-bold tracking-tight text-white"
            >
              Creative Adhyayan
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => {
          const isActive = end
            ? location.pathname === to
            : location.pathname === to || location.pathname.startsWith(to + "/");

          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.62)" }}
              title={collapsed ? label : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.10)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ background: AMBER }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}

              <Icon
                className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105 ${
                  collapsed ? "mx-auto" : ""
                }`}
                strokeWidth={isActive ? 2.25 : 1.85}
              />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key={`${to}-label`}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.16 }}
                    className="relative z-10 overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* collapsed tooltip */}
              {collapsed && (
                <span
                  className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B0E3D] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                  style={{ background: LIGHT }}
                >
                  {label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* user card / logout */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.85} />
          {!collapsed && <span>Log out</span>}
        </button>

        <div className={`mt-3 flex items-center gap-2.5 rounded-xl px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}
          >
            {initialsFrom(user?.displayName, user?.email)}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.displayName || "Student"}
              </p>
              <p className="truncate text-[11px] text-white/45">{user?.email || ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState(null);
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // close account menu on outside click / Escape
  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") {
        setAccountOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      // sign-out rarely fails; if it does the person is still on a
      // protected page, which is the safe default.
    }
  };

  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";
  const firstName = (user?.displayName || "there").split(" ")[0];
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="flex min-h-screen" style={{ background: CANVAS }}>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 260 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="sticky top-0 hidden h-screen shrink-0 lg:block"
        style={{ background: SIDEBAR_BG }}
      >
        <SidebarContent
          collapsed={collapsed}
          user={user}
          onLogout={handleLogout}
          onNavigate={() => {}}
        />

        {/* collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-9 flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-105"
          style={{ background: LIGHT, borderColor: DARK }}
        >
          <ChevronsLeft
            className={`h-3.5 w-3.5 text-[#1B0E3D] transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </motion.aside>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[78%] max-w-[280px] lg:hidden"
              style={{ background: SIDEBAR_BG }}
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent
                collapsed={false}
                user={user}
                onLogout={handleLogout}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ================= MAIN COLUMN ================= */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* topbar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3.5 backdrop-blur sm:px-6"
          style={{ background: "rgba(236,238,243,0.85)", borderColor: DARK }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1B0E3D] lg:hidden"
            style={{ background: LIGHT }}
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#8A82A6]">
              {greeting}
            </p>
            <h1 className="truncate text-lg font-bold text-[#1B0E3D] sm:text-xl">
              {location.pathname === "/dashboard" ? `${greeting}, ${firstName}` : pageTitle}
            </h1>
          </div>

          {/* search — desktop only */}
          <label className="relative hidden w-64 shrink-0 items-center md:flex">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#A79BC4]" />
            <input
              type="search"
              placeholder="Search courses, lessons…"
              className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F1533] placeholder:text-[#A79BC4] outline-none ring-1 ring-transparent transition focus:ring-2"
              style={{ "--tw-ring-color": ACCENT }}
            />
          </label>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1B0E3D] transition-transform hover:scale-105"
            style={{ background: LIGHT }}
          >
            <Bell className="h-4 w-4" />
            <span
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
              style={{ background: AMBER }}
            />
          </button>

          {/* account menu */}
          <div ref={accountRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              aria-expanded={accountOpen}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}
              >
                {initialsFrom(user?.displayName, user?.email)}
              </span>
              <ChevronDown
                className={`hidden h-3.5 w-3.5 text-[#1B0E3D] transition-transform sm:block ${
                  accountOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl shadow-violet-900/10"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-[#1B0E3D]">
                      {user?.displayName || "Student"}
                    </p>
                    <p className="truncate text-xs text-[#8A82A6]">{user?.email || ""}</p>
                  </div>
                  <div className="my-1 h-px bg-violet-100" />
                  <NavLink
                    to="/dashboard/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[#4A3D66] hover:bg-violet-50"
                  >
                    <Settings className="h-4 w-4" />
                    Account settings
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* routed page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}