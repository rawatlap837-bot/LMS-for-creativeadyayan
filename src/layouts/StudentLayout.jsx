import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/Firebase";
import CA2Logo from "../assets/Images/CA2.png";
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
  AlertCircle,
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
const COLLAPSE_KEY = "ca2:sidebar-collapsed";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Courses", to: "/dashboard/my-courses", icon: BookOpen },
  { label: "Progress", to: "/dashboard/progress", icon: TrendingUp },
  { label: "Assignments", to: "/dashboard/assignments", icon: ClipboardList },
  { label: "Certificates", to: "/dashboard/certificates", icon: Award },
  { label: "Payments", to: "/dashboard/payments", icon: CreditCard },
  { label: "Profile", to: "/dashboard/profile", icon: UserCircle },
];

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

/** Renders the user's profile photo when available, falling back to
 *  an initials circle. `loading` shows a pulse skeleton instead. */
function Avatar({ user, size = 32, className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const dimension = { height: size, width: size };

  if (user === undefined) {
    return (
      <span
        className={`shrink-0 animate-pulse rounded-full bg-white/15 ${className}`}
        style={dimension}
      />
    );
  }

  if (user?.photoURL && !imgFailed) {
    return (
      <img
        src={user.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={dimension}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ ...dimension, background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`, fontSize: size * 0.34 }}
    >
      {initialsFrom(user?.displayName, user?.email)}
    </span>
  );
}

/** Resolve a page title from the current path, falling back gracefully
 *  for nested/dynamic routes (e.g. /dashboard/my-courses/:id). */
function titleForPath(pathname) {
  const exact = NAV_ITEMS.find((item) => item.to === pathname);
  if (exact) return exact.label;
  const nested = NAV_ITEMS.find(
    (item) => item.to !== "/dashboard" && pathname.startsWith(item.to + "/")
  );
  return nested ? nested.label : "Dashboard";
}

/* ------------------------------------------------------------------
   Sidebar — shared by desktop rail and mobile drawer. `collapsed`
   only applies on desktop; the mobile drawer always renders labels.
------------------------------------------------------------------- */
function SidebarContent({ collapsed, onNavigate, user, onLogout, firstLinkRef }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col px-3 py-5 text-white">
      {/* brand */}
      <div className={`mb-8 flex items-center gap-2.5 px-2 ${collapsed ? "justify-center" : ""}`}>
        <img src={CA2Logo} alt="Creative Adhyayan" className="h-13 w-13 shrink-0 rounded-lg object-contain" />
      </div>

      {/* nav */}
      <nav className="flex flex-1 flex-col gap-1" aria-label="Student dashboard">
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }, idx) => {
          const isActive = end
            ? location.pathname === to
            : location.pathname === to || location.pathname.startsWith(to + "/");

          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              ref={idx === 0 ? firstLinkRef : undefined}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
                  className="absolute inset-y-0 left-0 my-auto h-5 w-[3px] rounded-full"
                  style={{ background: AMBER }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}

              <Icon
                className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105 ${collapsed ? "mx-auto" : ""
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
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white ${collapsed ? "justify-center" : ""
            }`}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.85} />
          {!collapsed && <span>Log out</span>}
        </button>

        <div className={`mt-3 flex items-center gap-2.5 rounded-xl px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <Avatar user={user} size={32} />
          {!collapsed && (
            <div className="min-w-0">
              {user === undefined ? (
                <>
                  <span className="mb-1 block h-3 w-20 animate-pulse rounded bg-white/15" />
                  <span className="block h-2.5 w-28 animate-pulse rounded bg-white/10" />
                </>
              ) : (
                <>
                  <p className="truncate text-xs font-semibold text-white">
                    {user?.displayName || "Student"}
                  </p>
                  <p className="truncate text-[11px] text-white/45">{user?.email || ""}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // undefined = auth state unknown (still resolving), null = signed out
  const [user, setUser] = useState(undefined);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  const accountRef = useRef(null);
  const searchRef = useRef(null);
  const searchWrapRef = useRef(null);
  const notifRef = useRef(null);
  const mobileMenuBtnRef = useRef(null);
  const drawerFirstLinkRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // persist collapse preference
  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // lock body scroll + manage focus while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) {
      // move focus into the drawer for keyboard/screen-reader users
      const id = requestAnimationFrame(() => drawerFirstLinkRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    // return focus to the trigger when the drawer closes
    mobileMenuBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // close account/search/notifications on outside click or Escape; ⌘K / Ctrl+K focuses search
  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") {
        setAccountOpen(false);
        setMobileOpen(false);
        setSearchOpen(false);
        setNotifOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // auto-dismiss the logout error toast
  useEffect(() => {
    if (!logoutError) return;
    const t = setTimeout(() => setLogoutError(null), 5000);
    return () => clearTimeout(t);
  }, [logoutError]);

  const handleLogout = useCallback(async () => {
    setLogoutError(null);
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setLogoutError("Couldn't log you out — check your connection and try again.");
    }
  }, [navigate]);

  const closeMobileNav = useCallback(() => setMobileOpen(false), []);

  // quick-nav search over the dashboard sections. Swap SEARCH_INDEX below
  // for real course/lesson data once it's available (same {label, to, icon} shape).
  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(query));
  }, [searchValue]);

  useEffect(() => {
    setActiveResultIndex(searchResults.length ? 0 : -1);
  }, [searchResults]);

  const selectSearchResult = useCallback(
    (item) => {
      if (!item) return;
      navigate(item.to);
      setSearchValue("");
      setSearchOpen(false);
      searchRef.current?.blur();
    },
    [navigate]
  );

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSearchOpen(true);
        setActiveResultIndex((i) => (i + 1) % Math.max(searchResults.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSearchOpen(true);
        setActiveResultIndex((i) => (i <= 0 ? searchResults.length - 1 : i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectSearchResult(searchResults[activeResultIndex]);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    },
    [searchResults, activeResultIndex, selectSearchResult]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const pageTitle = useMemo(() => titleForPath(location.pathname), [location.pathname]);
  const firstName = (user?.displayName || "there").split(" ")[0];
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="flex min-h-screen" style={{ background: CANVAS }}>
      {/* skip link for keyboard users */}

      {/* logout error toast */}
      <AnimatePresence>
        {logoutError && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed left-1/2 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border border-red-100 bg-white py-3 pl-3 pr-2 shadow-xl shadow-red-900/10"
            style={{ borderLeft: "4px solid #DC2626" }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </span>
            <p className="flex-1 pt-1.5 text-sm font-medium text-red-700">{logoutError}</p>
            <button
              type="button"
              onClick={() => setLogoutError(null)}
              aria-label="Dismiss"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
          onNavigate={() => { }}
        />

        {/* collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="group absolute -right-4 top-11 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ background: ACCENT, outlineColor: AMBER }}
        >
          <ChevronsLeft
            className={`h-5 w-5 text-white transition-transform duration-300 ${collapsed ? "rotate-180" : ""
              }`}
            strokeWidth={2.75}
          />

          {/* tooltip */}
          <span
            className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
            style={{ background: "#1B0E3D" }}
          >
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
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
              onClick={closeMobileNav}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Student navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[78%] max-w-[280px] lg:hidden"
              style={{ background: SIDEBAR_BG }}
            >
              <button
                type="button"
                onClick={closeMobileNav}
                aria-label="Close menu"
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent
                collapsed={false}
                user={user}
                onLogout={handleLogout}
                onNavigate={closeMobileNav}
                firstLinkRef={drawerFirstLinkRef}
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
            ref={mobileMenuBtnRef}
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
              {location.pathname === "/dashboard" ? "Overview" : "Student Dashboard"}
            </p>
            <h1 className="truncate text-lg font-bold text-[#1B0E3D] sm:text-xl">
              {location.pathname === "/dashboard" ? `${greeting}, ${firstName}` : pageTitle}
            </h1>
          </div>

          {/* search — desktop only */}
          <div ref={searchWrapRef} className="relative hidden w-64 shrink-0 md:block">
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#A79BC4]" />
              <input
                ref={searchRef}
                type="search"
                role="combobox"
                aria-expanded={searchOpen}
                aria-controls="student-search-listbox"
                aria-autocomplete="list"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search courses, lessons…"
                aria-label="Search courses and lessons"
                className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-12 text-sm text-[#1F1533] placeholder:text-[#A79BC4] outline-none ring-1 ring-transparent transition focus:ring-2"
                style={{ "--tw-ring-color": ACCENT }}
              />
              {!searchValue && (
                <kbd className="pointer-events-none absolute right-3.5 rounded-md border border-violet-100 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#8A82A6]">
                  ⌘K
                </kbd>
              )}
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-[#A79BC4] hover:text-[#1B0E3D]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>

            <AnimatePresence>
              {searchOpen && (
                <motion.ul
                  id="student-search-listbox"
                  role="listbox"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl shadow-violet-900/10"
                >
                  {searchResults.length === 0 ? (
                    <li className="px-3 py-4 text-center text-sm text-[#8A82A6]">
                      No matches for “{searchValue}”
                    </li>
                  ) : (
                    searchResults.map((item, idx) => (
                      <li key={item.to} role="option" aria-selected={idx === activeResultIndex}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveResultIndex(idx)}
                          onClick={() => selectSearchResult(item)}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${idx === activeResultIndex
                            ? "bg-violet-50 text-[#1B0E3D]"
                            : "text-[#4A3D66] hover:bg-violet-50"
                            }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-[#8A82A6]" />
                          {item.label}
                        </button>
                      </li>
                    ))
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* notifications */}
          <div ref={notifRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Notifications"
              aria-expanded={notifOpen}
              aria-haspopup="menu"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1B0E3D] transition-transform hover:scale-105"
              style={{ background: LIGHT }}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                  style={{ background: AMBER }}
                />
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl shadow-violet-900/10"
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-sm font-semibold text-[#1B0E3D]">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-semibold text-[#5227FF] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="my-1 h-px bg-violet-100" />
                  {notifications.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-[#8A82A6]">
                      You're all caught up.
                    </p>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <div
                            className={`rounded-xl px-3 py-2.5 text-sm ${n.read ? "text-[#8A82A6]" : "bg-violet-50/60 text-[#1B0E3D]"
                              }`}
                          >
                            <p className="font-medium">{n.title}</p>
                            {n.body && <p className="mt-0.5 text-xs text-[#8A82A6]">{n.body}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* account menu */}
          <div ref={accountRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white"
            >
              <Avatar user={user} size={28} />
              <ChevronDown
                className={`hidden h-3.5 w-3.5 text-[#1B0E3D] transition-transform sm:block ${accountOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  role="menu"
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
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[#4A3D66] hover:bg-violet-50"
                  >
                    <Settings className="h-4 w-4" />
                    Account settings
                  </NavLink>
                  <button
                    type="button"
                    role="menuitem"
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
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}