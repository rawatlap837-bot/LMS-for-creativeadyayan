import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, ArrowUpRight, Heart, BookOpen, Layers, ChevronDown } from "lucide-react";
import {
    CATEGORY_ICONS,
    TRUST_POINTS,
    CATEGORIES as DEFAULT_CATEGORIES,
    COURSES_BY_CATEGORY as DEFAULT_COURSES_BY_CATEGORY,
} from "../data/LiveCoursesData";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const isExternalHref = (href) => typeof href === "string" && /^https?:\/\//.test(href);

/* ------------------------------------------------------------------ */
/*  Ambient background — pure CSS, zero dependencies.                  */
/* ------------------------------------------------------------------ */
function AmbientBackground({ className = "" }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
        >
            <style>{`
                @keyframes courseAmbientDrift {
                    0%, 100% {
                        transform: translate(-50%, -30%) scale(1);
                        border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
                    }
                    33% {
                        transform: translate(-46%, -22%) scale(1.08);
                        border-radius: 58% 42% 30% 70% / 55% 45% 45% 55%;
                    }
                    66% {
                        transform: translate(-54%, -26%) scale(0.95);
                        border-radius: 30% 70% 45% 55% / 60% 30% 70% 40%;
                    }
                }
                @keyframes courseImgShimmer {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .course-ambient-blob,
                    .course-img-shimmer {
                        animation: none !important;
                    }
                }
            `}</style>
            <div
                className="course-ambient-blob absolute left-1/2 top-0 h-[380px] w-[380px] opacity-20 blur-[90px] sm:h-[520px] sm:w-[520px]"
                style={{
                    background: "linear-gradient(135deg, #1B0E3D, #5227FF)",
                    animation: "courseAmbientDrift 18s ease-in-out infinite",
                }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Trust bar — Expert Instructors / Flexible Learning / Certificates / */
/*  Lifetime Access. Quick-scan credibility strip above the tabs.       */
/* ------------------------------------------------------------------ */
function TrustBar() {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TRUST_POINTS.map(({ icon: Icon, label, sub }) => (
                <div
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl border border-violet-100 bg-white/70 px-3 py-2.5 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3"
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[#5227FF] sm:h-9 sm:w-9">
                        <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-[11px] font-bold text-[#1B0E3D] sm:text-sm">
                            {label}
                        </span>
                        <span className="hidden text-[11px] text-slate-500 sm:block">{sub}</span>
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Category tabs — horizontally scrollable pill row, mobile-first.    */
/*  Shows a leading icon, live course count, and supports arrow-key    */
/*  navigation between tabs for accessibility.                         */
/* ------------------------------------------------------------------ */
function CategoryTabs({ categories, activeIndex, onSelect, counts }) {
    const railRef = useRef(null);

    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;
        const btn = rail.children[activeIndex];
        if (!btn) return;
        const railBox = rail.getBoundingClientRect();
        const btnBox = btn.getBoundingClientRect();
        if (btnBox.left < railBox.left || btnBox.right > railBox.right) {
            btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
    }, [activeIndex]);

    const handleKeyDown = (e, i) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            onSelect((i + 1) % categories.length);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            onSelect((i - 1 + categories.length) % categories.length);
        }
    };

    return (
        <div
            ref={railRef}
            role="tablist"
            aria-label="Course categories"
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:gap-3 [&::-webkit-scrollbar]:hidden"
        >
            {categories.map((category, i) => {
                const isActive = i === activeIndex;
                const Icon = CATEGORY_ICONS[category] || BookOpen;
                const count = counts?.[category] ?? 0;
                return (
                    <button
                        key={category}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onSelect(i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold tracking-tight outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#5227FF] focus-visible:ring-offset-2 sm:px-5 sm:py-3 sm:text-sm ${isActive
                            ? "text-white"
                            : "border border-violet-200 bg-white text-[#1B0E3D] hover:border-violet-300"
                            }`}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="category-pill-active"
                                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                className="absolute inset-0 rounded-full"
                                style={{ background: "linear-gradient(120deg, #5227FF, #8B5CF6)" }}
                            />
                        )}
                        <Icon className="relative h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.2} />
                        <span className="relative">{category}</span>
                        <span
                            className={`relative rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${isActive ? "bg-white/25 text-white" : "bg-violet-100 text-[#5227FF]"
                                }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Course media — skeleton while loading, crossfade carousel on       */
/*  hover (desktop) or auto-cycle (touch), duration badge, gradient.   */
/* ------------------------------------------------------------------ */
function CourseMedia({ images, title, duration, saved, onToggleSave }) {
    const pics = images?.length ? images : [];
    const [loaded, setLoaded] = useState(false);
    const [active, setActive] = useState(0);
    const [hovering, setHovering] = useState(false);
    const cycleRef = useRef(null);

    // desktop: crossfade through images while the card is hovered
    useEffect(() => {
        if (!hovering || pics.length < 2) return;
        cycleRef.current = setInterval(() => {
            setActive((i) => (i + 1) % pics.length);
        }, 1100);
        return () => clearInterval(cycleRef.current);
    }, [hovering, pics.length]);

    useEffect(() => {
        if (!hovering) setActive(0);
    }, [hovering]);

    return (
        <div
            className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {/* shimmer skeleton until the first image finishes loading */}
            {!loaded && (
                <div
                    className="course-img-shimmer absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(90deg, #ece9f7 0px, #f6f4fc 40px, #ece9f7 80px)",
                        backgroundSize: "600px 100%",
                        animation: "courseImgShimmer 1.4s linear infinite",
                    }}
                />
            )}

            <AnimatePresence>
                {pics.map((src, i) =>
                    i === active ? (
                        <motion.img
                            key={src}
                            src={src}
                            alt={title}
                            loading="lazy"
                            onLoad={() => setLoaded(true)}
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: hovering ? 1.06 : 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ opacity: { duration: 0.5 }, scale: { duration: 0.9, ease: "easeOut" } }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : null
                )}
            </AnimatePresence>

            {/* top gradient for badge legibility, bottom gradient for depth */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

            {duration && (
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#1B0E3D] shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3.5 sm:text-[11px]">
                    <Clock className="h-3 w-3 text-[#5227FF]" strokeWidth={2.5} />
                    {duration}
                </span>
            )}

            {/* type="button" + preventDefault/stopPropagation keep this from
                triggering the parent <Link>'s navigation — without this, every
                "save" click was also opening the course page. */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSave();
                }}
                aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
                aria-pressed={saved}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 outline-none shadow-sm backdrop-blur-sm transition-transform duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#5227FF] sm:right-4 sm:top-4"
            >
                <Heart
                    className={`h-4 w-4 transition-colors ${saved ? "fill-rose-500 text-rose-500" : "text-[#1B0E3D]"}`}
                    strokeWidth={2.2}
                />
            </button>

            {pics.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                    {pics.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* soft scrim on hover to lift the CTA below */}
            <div className="pointer-events-none absolute inset-0 bg-[#1B0E3D]/0 transition-colors duration-300 group-hover:bg-[#1B0E3D]/10" />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Course card — media, tags, description, feature checklist,        */
/*  duration/mode, CTA. Matches the LiveCoursesData.js content shape.  */
/* ------------------------------------------------------------------ */
const FEATURES_PREVIEW_COUNT = 3;

function CourseCard({ course, category, index, saved, onToggleSave }) {
    const allFeatures = course.features ?? [];
    const extraFeatureCount = Math.max(0, allFeatures.length - FEATURES_PREVIEW_COUNT);

    // "+N more" toggles between the short preview list and the full list,
    // in place, without navigating anywhere — this used to be a static,
    // non-interactive <li>.
    const [showAllFeatures, setShowAllFeatures] = useState(false);
    const visibleFeatures = showAllFeatures ? allFeatures : allFeatures.slice(0, FEATURES_PREVIEW_COUNT);

    // Where this card's CTA sends people. Prefer an explicit `course.link`
    // set in LiveCoursesData.js; otherwise fall back to the app's real
    // route, /courses/:courseId (see App.jsx — no category segment).
    const courseId = course.id ?? course.title;
    const courseHref = course.link || `/courses/${encodeURIComponent(courseId)}`;

    // If `course.link` points off-site (a partner/registration page), use a
    // plain <a> that opens in a new tab. Otherwise use React Router's <Link>
    // so navigation stays client-side within the app.
    const external = isExternalHref(courseHref);
    const CourseLink = external ? "a" : Link;
    const courseLinkProps = external
        ? { href: courseHref, target: "_blank", rel: "noopener noreferrer" }
        : { to: courseHref };

    // subtle 3D tilt that follows the pointer (desktop only — touch devices
    // never fire mousemove, so this is a no-op there). Disabled entirely for
    // people who prefer reduced motion.
    const prefersReducedMotion = useReducedMotion();
    const rotateXRaw = useMotionValue(0);
    const rotateYRaw = useMotionValue(0);
    const rotateX = useSpring(rotateXRaw, { stiffness: 300, damping: 25 });
    const rotateY = useSpring(rotateYRaw, { stiffness: 300, damping: 25 });

    const handlePointerMove = (e) => {
        if (prefersReducedMotion) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotateYRaw.set(px * 3);
        rotateXRaw.set(py * -3);
    };
    const handlePointerLeave = () => {
        rotateXRaw.set(0);
        rotateYRaw.set(0);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            whileHover={{ y: -6 }}
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_1px_2px_rgba(27,14,61,0.04),0_8px_24px_-12px_rgba(27,14,61,0.12)] transition-all duration-300 hover:border-violet-200 hover:shadow-[0_1px_2px_rgba(27,14,61,0.06),0_24px_48px_-16px_rgba(82,39,255,0.28)]"
        >
            <CourseLink {...courseLinkProps} className="block" aria-label={`View ${course.title}`}>
                <CourseMedia
                    images={course.images}
                    title={course.title}
                    duration={course.duration}
                    saved={saved}
                    onToggleSave={onToggleSave}
                />
            </CourseLink>

            <div className="flex flex-1 flex-col p-4 sm:p-6">
                {course.tags?.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                        {course.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-violet-100 bg-violet-50/70 px-2.5 py-1 text-[10px] font-semibold text-[#5227FF] sm:text-[11px]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <CourseLink {...courseLinkProps} className="hover:text-[#5227FF]">
                    <h3 className="text-base font-bold leading-snug tracking-tight text-[#1B0E3D] sm:text-lg">
                        {course.title}
                    </h3>
                </CourseLink>

                {course.description && (
                    <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {course.description}
                    </p>
                )}

                {allFeatures.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-violet-50 pt-4">
                        {visibleFeatures.map((feature) => (
                            <motion.li
                                key={feature}
                                initial={false}
                                animate={{ opacity: 1 }}
                                className="flex items-start gap-2 text-[13px] text-slate-600"
                            >
                                <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-violet-100">
                                    <CheckCircle2 className="h-3 w-3 text-[#5227FF]" strokeWidth={3} />
                                </span>
                                <span className="leading-snug">{feature}</span>
                            </motion.li>
                        ))}
                        {extraFeatureCount > 0 && (
                            <li>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        // Stop this from bubbling up into the card's
                                        // <Link> wrapper and navigating away — this
                                        // toggle should only expand the list in place.
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowAllFeatures((prev) => !prev);
                                    }}
                                    aria-expanded={showAllFeatures}
                                    className="flex w-full items-center gap-2 rounded-md pl-6 text-xs font-semibold text-[#5227FF] outline-none transition-colors duration-150 hover:text-[#1B0E3D] focus-visible:ring-2 focus-visible:ring-[#5227FF]"
                                >
                                    <Layers className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                                    <span>
                                        {showAllFeatures
                                            ? "Show less"
                                            : `+${extraFeatureCount} more benefit${extraFeatureCount > 1 ? "s" : ""}`}
                                    </span>
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${showAllFeatures ? "rotate-180" : ""
                                            }`}
                                        strokeWidth={2.5}
                                    />
                                </button>
                            </li>
                        )}
                    </ul>
                )}

                <div className="mt-5 flex flex-col gap-2.5 border-t border-violet-50 pt-4">
                    {course.mode && (
                        <span className="text-xs font-medium leading-snug text-slate-400">
                            {course.mode}
                        </span>
                    )}

                    <CourseLink
                        {...courseLinkProps}
                        className="group/cta inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B0E3D] px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-[#5227FF] focus-visible:ring-2 focus-visible:ring-[#5227FF] focus-visible:ring-offset-2"
                    >
                        View Course
                        <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                            strokeWidth={2.5}
                        />
                    </CourseLink>
                </div>
            </div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  LiveCourses section                                                 */
/* ------------------------------------------------------------------ */
/**
 * @param {string[]} [categories] - tab labels.
 * @param {Record<string, Array<{
 *   id: string, title: string, images?: string[], tags?: string[], description?: string,
 *   features?: string[], duration?: string, mode?: string, link?: string
 * }>>} [coursesByCategory] - keys must match entries in `categories`.
 * @param {string} [eyebrow] - small uppercase label above the title.
 * @param {string} title
 * @param {string} subtitle
 * @param {string} [exploreAllHref] - if provided, shows an "Explore all courses" link
 *   in the header. Internal paths (e.g. "/courses") use client-side routing;
 *   full URLs (e.g. "https://...") open in a new tab.
 */
export default function LiveCourses({
    categories = DEFAULT_CATEGORIES,
    coursesByCategory = DEFAULT_COURSES_BY_CATEGORY,
    eyebrow = "Our Programs",
    title = "Our Courses",
    subtitle = "Real-Time Learning With Lifetime Access.",
    exploreAllHref,
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [savedIds, setSavedIds] = useState(() => new Set());
    const [searchParams] = useSearchParams();
    const activeCategory = categories[activeIndex] ?? null;
    const courses = activeCategory ? coursesByCategory[activeCategory] ?? [] : [];

    // Navbar "Courses" dropdown links here as /?category=<name>#live-courses.
    // Preselect the matching tab (case-insensitive) and scroll the section
    // into view so the click actually lands on the right course list.
    useEffect(() => {
        const requested = searchParams.get("category");
        if (!requested) return;
        const idx = categories.findIndex(
            (c) => c.toLowerCase() === requested.toLowerCase()
        );
        if (idx !== -1) setActiveIndex(idx);
        document.getElementById("live-courses")?.scrollIntoView({ behavior: "smooth" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const categoryCounts = useMemo(() => {
        const counts = {};
        categories.forEach((c) => {
            counts[c] = coursesByCategory[c]?.length ?? 0;
        });
        return counts;
    }, [categories, coursesByCategory]);

    const toggleSaved = (id) => {
        setSavedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Same internal/external split as course cards, applied to the header's
    // "Explore all courses" link.
    const exploreExternal = isExternalHref(exploreAllHref);
    const ExploreLink = exploreExternal ? "a" : Link;
    const exploreLinkProps = exploreAllHref
        ? exploreExternal
            ? { href: exploreAllHref, target: "_blank", rel: "noopener noreferrer" }
            : { to: exploreAllHref }
        : {};

    return (
        <section id="live-courses" className="relative overflow-hidden bg-violet-100 py-10 sm:py-20 lg:py-28">
            <AmbientBackground />

            <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 xl:px-12">
                {(title || subtitle) && (
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                        <div>
                            {eyebrow && (
                                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5227FF] sm:text-xs">
                                    {eyebrow}
                                </span>
                            )}
                            {title && (
                                <h2 className="mt-1 font-[Space_Grotesk,sans-serif] text-2xl font-bold tracking-tight text-[#1B0E3D] sm:text-3xl lg:text-5xl">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="mt-2 text-xs text-slate-500 sm:mt-3 sm:text-base">{subtitle}</p>
                            )}
                        </div>

                        {exploreAllHref && (
                            <ExploreLink
                                {...exploreLinkProps}
                                className="inline-flex shrink-0 items-center gap-1 rounded-full px-1 text-xs font-semibold text-[#5227FF] outline-none transition-colors hover:text-[#1B0E3D] focus-visible:ring-2 focus-visible:ring-[#5227FF] sm:text-sm"
                            >
                                Explore all courses
                                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </ExploreLink>
                        )}
                    </div>
                )}

                <div className="mt-6 sm:mt-10">
                    <TrustBar />
                </div>

                {categories.length > 0 && (
                    <div className="mt-6 sm:mt-10">
                        <CategoryTabs
                            categories={categories}
                            activeIndex={activeIndex}
                            onSelect={setActiveIndex}
                            counts={categoryCounts}
                        />
                    </div>
                )}

                {courses.length > 0 && (
                    <p className="mt-4 text-center text-[11px] font-medium text-slate-400 sm:text-left sm:text-xs">
                        {courses.length} course{courses.length > 1 ? "s" : ""} in {activeCategory}
                        {savedIds.size > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-rose-500">
                                <Heart className="h-3 w-3 fill-rose-500" />
                                {savedIds.size} saved
                            </span>
                        )}
                    </p>
                )}

                <div className="relative mt-3 min-w-0 sm:mt-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory ?? "empty"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            {courses.length > 0 ? (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                                    {courses.map((course, i) => {
                                        const id = course.id ?? course.title;
                                        return (
                                            <CourseCard
                                                key={id}
                                                course={course}
                                                category={activeCategory}
                                                index={i}
                                                saved={savedIds.has(id)}
                                                onToggleSave={() => toggleSaved(id)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-white/50 py-12 text-center">
                                    <BookOpen className="h-8 w-8 text-violet-300" strokeWidth={1.5} />
                                    <p className="text-sm text-slate-400">
                                        No courses in this category yet — check back soon.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}