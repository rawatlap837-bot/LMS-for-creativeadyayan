import { useEffect, useRef, useState } from "react";
import CALogo from "../assets/Images/CA.png";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Megaphone,
  Code2,
  Palette,
  Cpu,
  Layers,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

const NAV_LINKS = [
  {
    label: "Courses",
    dropdown: [
      { label: "Digital Marketing", icon: Megaphone, href: "/courses/digital-marketing" },
      { label: "Web Development", icon: Code2, href: "/courses/web-development" },
      { label: "UI/UX Design", icon: Palette, href: "/courses/ui-ux-design" },
      { label: "Software Dev", icon: Cpu, href: "/courses/software-dev" },
      { label: "Multimedia", icon: Layers, href: "/courses/multimedia" },
      { label: "E-Commerce", icon: ShoppingCart, href: "/courses/e-commerce" },
    ],
  },
  { label: "Mentors", href: "/mentors" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "About", href: "/about" },
];

/* ------------------------------------------------------------------
   Neumorphic tokens — soft off-white canvas, dual-tone shadows.
   Same canvas color used everywhere so raised/pressed shadows read
   correctly (neumorphism relies on background === shadow base).
------------------------------------------------------------------- */
const CANVAS = "#ECEEF3";
const LIGHT = "#ffffff";
const DARK = "#c7cbd9";

const raised = (radius = 9999) => ({
  background: CANVAS,
  borderRadius: radius,
  boxShadow: `6px 6px 14px ${DARK}, -6px -6px 14px ${LIGHT}`,
});

const raisedSm = (radius = 9999) => ({
  background: CANVAS,
  borderRadius: radius,
  boxShadow: `3px 3px 8px ${DARK}, -3px -3px 8px ${LIGHT}`,
});

const pressed = (radius = 9999) => ({
  background: CANVAS,
  borderRadius: radius,
  boxShadow: `inset 3px 3px 6px ${DARK}, inset -3px -3px 6px ${LIGHT}`,
});

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [coursesHover, setCoursesHover] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const navigate = useNavigate();
  const coursesRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (coursesRef.current && !coursesRef.current.contains(e.target)) {
        setCoursesOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") {
        setCoursesOpen(false);
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div
        className="relative z-50 mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-8"
        style={{ background: CANVAS, borderRadius: 9999 }}
      >
        {/* logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src={CALogo}
            alt="Creative Adyayan logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <div key={link.label} ref={coursesRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCoursesOpen((o) => !o)}
                  onMouseEnter={() => setCoursesHover(true)}
                  onMouseLeave={() => setCoursesHover(false)}
                  aria-expanded={coursesOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:text-[#1B0E3D]"
                  style={coursesOpen || coursesHover ? pressed(9999) : {}}
                >
                  {link.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${coursesOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {coursesOpen && (
                  <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
                    <div className="grid grid-cols-2 gap-2 p-3" style={{ background: CANVAS, borderRadius: 28 }}>
                      {link.dropdown.map(({ label, icon: Icon, href }) => (
                        <Link
                          key={label}
                          to={href}
                          onClick={() => setCoursesOpen(false)}
                          onMouseEnter={() => setHoveredLink(label)}
                          onMouseLeave={() => setHoveredLink(null)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 transition-all hover:text-[#1B0E3D]"
                          style={hoveredLink === label ? pressed(16) : { borderRadius: 16 }}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-[#5227FF]" strokeWidth={1.75} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:text-[#1B0E3D]"
                style={hoveredLink === link.label ? pressed(9999) : {}}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, pressed(9999))}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { boxShadow: "none" })}
            className="rounded-full px-6 py-3 text-base font-medium text-[#1B0E3D] transition-colors"
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => navigate("/enroll")}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, {
                boxShadow: `inset 4px 4px 8px rgba(0,0,0,0.45), inset -4px -4px 8px rgba(255,255,255,0.06)`,
              })
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, {
                boxShadow: `4px 4px 10px ${DARK}, -4px -4px 10px ${LIGHT}`,
              })
            }
            className="flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white transition-shadow"
            style={{
              borderRadius: 9999,
              background: "linear-gradient(155deg, #2C1A5E, #1B0E3D)",
              boxShadow: `4px 4px 10px ${DARK}, -4px -4px 10px ${LIGHT}`,
            }}
          >
            Enroll now
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center text-[#1B0E3D] transition-all lg:hidden"
          style={mobileOpen ? pressed(9999) : {}}
        >
          <span className="relative flex h-4 w-5 flex-col items-center justify-between">
            <span
              className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out ${mobileOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
            />
            <span
              className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out ${mobileOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
            />
          </span>
        </button>
      </div>

      {/* mobile menu — always mounted, animated open/close */}
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        style={{ background: CANVAS }}
      >
        <div
          className={`h-full overflow-y-auto px-6 pb-10 pt-28 transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-y-0" : "-translate-y-4"
            }`}
        >
          <nav className="mx-auto flex max-w-md flex-col gap-3">
            <button
              type="button"
              onClick={() => setMobileCoursesOpen((o) => !o)}
              aria-expanded={mobileCoursesOpen}
              className="flex items-center gap-1.5 px-5 py-2.5 text-base font-medium text-slate-700 transition-all hover:text-[#1B0E3D]"
              style={mobileCoursesOpen ? pressed(20) : raisedSm(20)}
            >
              Courses
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${mobileCoursesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileCoursesOpen && (
              <div className="grid grid-cols-2 gap-2 p-3" style={pressed(20)}>
                {NAV_LINKS[0].dropdown.map(({ label, icon: Icon, href }) => (
                  <Link
                    key={label}
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700"
                    style={raisedSm(14)}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#5227FF]" strokeWidth={1.75} />
                    {label}
                  </Link>
                ))}
              </div>
            )}

            {NAV_LINKS.slice(1).map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3.5 text-base font-medium text-slate-700"
                style={raisedSm(20)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
                className="px-4 py-3 text-sm font-medium text-[#1B0E3D]"
                style={pressed(9999)}
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/enroll");
                }}
                onMouseEnter={(e) =>
                  Object.assign(e.currentTarget.style, {
                    boxShadow: `inset 4px 4px 8px rgba(0,0,0,0.45), inset -4px -4px 8px rgba(255,255,255,0.06)`,
                  })
                }
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, {
                    boxShadow: `4px 4px 10px ${DARK}, -4px -4px 10px ${LIGHT}`,
                  })
                }
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-white transition-shadow"
                style={{
                  borderRadius: 9999,
                  background: "linear-gradient(155deg, #2C1A5E, #1B0E3D)",
                  boxShadow: `4px 4px 10px ${DARK}, -4px -4px 10px ${LIGHT}`,
                }}
              >
                Enroll now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}