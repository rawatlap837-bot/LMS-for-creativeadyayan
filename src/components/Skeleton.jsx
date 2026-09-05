/**
 * Skeleton.jsx — reusable skeleton loading primitives for the LMS.
 *
 * WHAT THIS IS
 * ─────────────
 * A "skeleton" is a gray placeholder shape that mimics the layout of the
 * content that's about to load — instead of a blank screen, a spinner, or
 * text like "Loading…". It reserves the right amount of space so nothing
 * jumps around once real data arrives, and feels faster to the user.
 *
 * HOW TO USE THIS FILE
 * ──────────────────────
 * 1. Drop this file at src/components/Skeleton.jsx
 * 2. Import the piece you need: `import { Skeleton, StatCardSkeleton,
 *    TableRowSkeleton, CourseCardSkeleton } from "../components/Skeleton";`
 * 3. Wherever a component currently does something like:
 *
 *      if (loading) return <p>Loading...</p>;
 *
 *    replace it with a skeleton that matches the real layout below it —
 *    see the two examples at the bottom of this comment block, and the
 *    two files I've also rewritten (CourseCard.jsx and AdminDashboard's
 *    StatCard usage) as worked examples you can copy the pattern from.
 *
 * DESIGN
 * ───────
 * Uses your existing violet brand palette so skeletons don't look like a
 * generic library default — a soft violet-tinted gray with a gentle pulse.
 *
 * EXAMPLE — swapping a "Loading…" table row (Students.jsx pattern):
 *
 *   {loading ? (
 *     Array.from({ length: 5 }).map((_, i) => (
 *       <TableRowSkeleton key={i} columns={5} />
 *     ))
 *   ) : (
 *     filtered.map((student) => <tr key={student.id}>...</tr>)
 *   )}
 *
 * EXAMPLE — swapping a "…" stat value (AdminDashboard.jsx pattern):
 *
 *   <StatCard
 *     label="Total Students"
 *     value={loading ? <Skeleton className="h-6 w-16" /> : totalStudents}
 *     icon={Users}
 *   />
 */

/**
 * Skeleton — the base building block. A pulsing gray/violet rectangle.
 * Compose your own layouts by combining these with flex/grid, sizing them
 * with Tailwind width/height classes to match the real content's shape.
 *
 * Props:
 *   className   — Tailwind classes for size/shape (e.g. "h-4 w-32 rounded")
 *   circle      — true for avatar/icon placeholders (renders as a circle)
 */
export function Skeleton({ className = "", circle = false }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "block animate-pulse bg-violet-100/80",
        circle ? "rounded-full" : "rounded-md",
        className,
      ].join(" ")}
    />
  );
}

/**
 * StatCardSkeleton — matches AdminDashboard.jsx's StatCard layout
 * (icon + label + big number). Render one of these per StatCard while
 * loading, or just use <Skeleton className="h-6 w-16" /> inline for the
 * value only, keeping the label static (see AdminDashboard example file).
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton circle className="h-9 w-9" />
      </div>
      <Skeleton className="mt-4 h-7 w-20" />
    </div>
  );
}

/**
 * TableRowSkeleton — matches admin table rows (Students.jsx, Payments.jsx,
 * Courses.jsx, Lessons.jsx all use similar <table>/<tr>/<td> structures).
 *
 * Props:
 *   columns — how many <td> cells this table has (match your real <thead>)
 */
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}

/**
 * CourseCardSkeleton — matches CourseCard.jsx / MyCourses.jsx card layout
 * (thumbnail image + title + short line). Render a grid of these while
 * courses are loading.
 */
export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * ListRowSkeleton — matches simple list rows like notifications, tasks,
 * or schedule items in student/Dashboard.jsx (small icon + two lines).
 */
export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton circle className="h-9 w-9 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/**
 * SkeletonGrid — convenience wrapper: renders N of any skeleton component
 * in a grid, so you don't have to write Array.from(...) at every call site.
 *
 * Example: <SkeletonGrid count={6} as={CourseCardSkeleton} cols={3} />
 */
export function SkeletonGrid({ count = 3, as: SkeletonComponent, cols = 3 }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}
// src/components/Skeleton.jsx
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-violet-200/60 rounded-md ${className}`} />
);

export const CourseCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden border border-gray-100 p-4 space-y-3">
    <Skeleton className="h-32 w-full rounded-md" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="p-4 rounded-lg border border-gray-100 space-y-2">
    <Skeleton className="h-3 w-1/3" />
    <Skeleton className="h-6 w-1/2" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr>
    <td className="p-3"><Skeleton className="h-4 w-full" /></td>
    <td className="p-3"><Skeleton className="h-4 w-full" /></td>
    <td className="p-3"><Skeleton className="h-4 w-2/3" /></td>
  </tr>
);

export const ListRowSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2 w-1/2" />
    </div>
  </div>
);
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-violet-200/60 rounded-md ${className}`} />
);

export const CourseCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden border border-gray-100 p-4 space-y-3">
    <Skeleton className="h-32 w-full rounded-md" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="p-4 rounded-lg border border-gray-100 space-y-2">
    <Skeleton className="h-3 w-1/3" />
    <Skeleton className="h-6 w-1/2" />
  </div>
);

export const TableRowSkeleton = ({ columns = 3 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const ListRowSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2 w-1/2" />
    </div>
  </div>
);

export const RingSkeleton = ({ size = 56 }) => (
  <div
    className="rounded-full animate-pulse bg-violet-200/60"
    style={{ height: size, width: size }}
  />
);