import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import {
    collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/Firebase";
import { COURSES_BY_CATEGORY as LONG_COURSES_BY_CATEGORY } from "../data/Sitedata.js";
import {
    AT, Pill, Card, Modal, Field, PrimaryButton, GhostButton, EmptyState, ConfirmDeleteModal,
} from "./AdminUI";
import {
    ICON_KEYS, iconForCategory, estimateLessons, DEFAULT_PRICE, DEFAULT_INSTRUCTOR,
} from "../lib/CoursesMeta.js";

/* ------------------------------------------------------------------ */
/*  Firestore collection name — SAME collection holds BOTH short and   */
/*  long courses, distinguished by the `type` field ("long" | "short").*/
/*  Public pages (LiveCourses.jsx / ShortCourses.jsx / MyCourses.jsx)  */
/*  read from here too, filtered by type + status === "published".     */
/* ------------------------------------------------------------------ */
const COURSES_COLLECTION = "courses";

/* ------------------------------------------------------------------ */
/*  AUTO-IMPORT: your original course list lived as hardcoded JS —     */
/*  long courses in Sitedata.js, short courses used to be hardcoded    */
/*  inside ShortCourses.jsx as COURSE_GROUPS. The very first time this */
/*  panel loads and finds the `courses` collection empty, it silently  */
/*  writes all of them into Firestore (as status: "published", since   */
/*  they were already live) so they simply appear — no button, no      */
/*  separate script. It only ever runs while the collection is empty,  */
/*  so it can't create duplicates on later visits.                     */
/*                                                                      */
/*  Both types now get icon/price/lessons/instructor defaults so       */
/*  MyCourses.jsx (buy + progress tracking) works identically for      */
/*  long and short courses right out of the import.                    */
/* ------------------------------------------------------------------ */
const SHORT_COURSE_GROUPS = [
    {
        label: "Office & Computer Basics",
        courses: [
            { title: "CCC / BCC", duration: "2 Month", color: "#6D3FC0", description: "Core computer literacy for absolute beginners." },
            { title: "MS Word", duration: "1 Month", color: "#2B579A", description: "Type, format, and produce professional documents." },
            { title: "MS Excel", duration: "1 Month", color: "#217346", description: "Build spreadsheets, formulas, and simple reports.", popular: true },
            { title: "Adv. Excel", duration: "1 Month", color: "#217346", description: "Pivot tables, macros, and data analysis at scale." },
            { title: "MS PowerPoint", duration: "1 Month", color: "#D24726", description: "Design decks that pitch, teach, and persuade." },
            { title: "MS Access", duration: "1 Month", color: "#A4373A", description: "Design simple databases and manage records." },
            { title: "Internet", duration: "1 Week", color: "#3A7BD5", description: "Browse, search, and stay safe online with confidence." },
        ],
    },
    {
        label: "Programming & Development",
        courses: [
            { title: "C Programming", duration: "3 Month", color: "#3A3A3A", description: "Learn logic-building with the foundation language." },
            { title: "C++ Programming", duration: "3 Month", color: "#00599C", description: "Object-oriented programming for real applications." },
            { title: "Core Java", duration: "3 Months", color: "#EA2D2E", description: "Master Java fundamentals and OOP concepts." },
            { title: "Full Java", duration: "9 Month", color: "#F89820", description: "End-to-end Java development for enterprise apps.", popular: true },
            { title: "PHP", duration: "3 Months", color: "#4F5B93", description: "Build dynamic, database-driven websites." },
            { title: "Python", duration: "3 Month", color: "#3776AB", description: "The most in-demand language for scripting & data.", popular: true },
            { title: "MySQL / MariaDB", duration: "2 Months", color: "#00758F", description: "Query, manage, and structure relational databases." },
        ],
    },
    {
        label: "Design & Creative Tools",
        courses: [
            { title: "Graphic Design", duration: "6 Month", color: "#6D3FC0", description: "Visual design fundamentals for branding & print.", popular: true },
            { title: "Web Designing", duration: "6 Months", color: "#E8A33D", description: "Design responsive, user-friendly websites." },
            { title: "Photoshop", duration: "2 Month", color: "#31A8FF", description: "Photo editing, retouching, and digital art." },
            { title: "CorelDRAW", duration: "2 Month", color: "#00A651", description: "Vector illustration for logos and layouts." },
            { title: "Illustrator", duration: "1 Months", color: "#FF9A00", description: "Create scalable icons, logos, and artwork." },
            { title: "After Effects", duration: "1 Month", color: "#9999FF", description: "Motion graphics and video visual effects." },
            { title: "3ds Max", duration: "3 Month", color: "#20BFA9", description: "3D modeling, texturing, and rendering basics." },
        ],
    },
    {
        label: "Web & Scripting",
        courses: [
            { title: "WordPress", duration: "1 Month", color: "#21759B", description: "Build and manage websites without heavy coding." },
            { title: "HTML & CSS", duration: "1 Month", color: "#E34F26", description: "The building blocks of every website, from scratch." },
            { title: "JavaScript", duration: "1 Months", color: "#D6B90A", description: "Add interactivity and logic to the modern web.", popular: true },
            { title: "MIS", duration: "2 Month", color: "#2E1A55", description: "Manage information systems for business decisions." },
        ],
    },
];

async function importLegacyCourses() {
    for (const category of Object.keys(LONG_COURSES_BY_CATEGORY)) {
        for (const course of LONG_COURSES_BY_CATEGORY[category]) {
            await addDoc(collection(db, COURSES_COLLECTION), {
                type: "long",
                title: course.title,
                category,
                description: course.description || "",
                duration: course.duration || "",
                mode: course.mode || "",
                link: course.link || "",
                images: course.image ? [course.image] : [],
                tags: course.tags || [],
                features: course.features || [],
                instructor: DEFAULT_INSTRUCTOR,
                icon: iconForCategory(category),
                color: "#5227FF",
                lessons: estimateLessons(course.duration || ""),
                price: DEFAULT_PRICE,
                students: 0,
                status: "published",
                createdAt: serverTimestamp(),
            });
        }
    }

    for (const group of SHORT_COURSE_GROUPS) {
        for (const course of group.courses) {
            await addDoc(collection(db, COURSES_COLLECTION), {
                type: "short",
                title: course.title,
                category: group.label,
                description: course.description || "",
                duration: course.duration || "",
                image: course.image || "",
                color: course.color || "#6D3FC0",
                popular: !!course.popular,
                tags: [],
                instructor: DEFAULT_INSTRUCTOR,
                icon: iconForCategory(group.label),
                lessons: estimateLessons(course.duration || ""),
                price: DEFAULT_PRICE,
                students: 0,
                status: "published",
                createdAt: serverTimestamp(),
            });
        }
    }
}

function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const d = new Date(value);
    return isNaN(d) ? null : d;
}

function splitLines(str) {
    return (str || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

function splitCommas(str) {
    return (str || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

/* ---------------------------- small UI bits ---------------------------- */

function TextArea({ label, value, onChange, rows = 3, hint }) {
    return (
        <div className="mb-3">
            <label className="block text-xs font-medium mb-1" style={{ color: AT.sub }}>{label}</label>
            <textarea
                value={value}
                onChange={onChange}
                rows={rows}
                className="w-full text-sm rounded-lg border px-3 py-2 outline-none"
                style={{ borderColor: AT.line, color: AT.ink }}
            />
            {hint && <p className="text-[11px] mt-1" style={{ color: AT.sub }}>{hint}</p>}
        </div>
    );
}

function ComboField({ label, value, onChange, suggestions = [], listId, hint }) {
    return (
        <div className="mb-3">
            <label className="block text-xs font-medium mb-1" style={{ color: AT.sub }}>{label}</label>
            <input
                list={listId}
                value={value}
                onChange={onChange}
                className="w-full text-sm rounded-lg border px-3 py-2 outline-none"
                style={{ borderColor: AT.line, color: AT.ink }}
            />
            <datalist id={listId}>
                {suggestions.map((s) => <option key={s} value={s} />)}
            </datalist>
            {hint && <p className="text-[11px] mt-1" style={{ color: AT.sub }}>{hint}</p>}
        </div>
    );
}

function Checkbox({ label, checked, onChange }) {
    return (
        <label className="mb-3 flex items-center gap-2 text-sm" style={{ color: AT.ink }}>
            <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
            {label}
        </label>
    );
}

function ColorField({ label, value, onChange }) {
    return (
        <div className="mb-3">
            <label className="block text-xs font-medium mb-1" style={{ color: AT.sub }}>{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={/^#([0-9a-f]{3}){1,2}$/i.test(value) ? value : "#6D3FC0"}
                    onChange={onChange}
                    className="h-9 w-9 shrink-0 rounded cursor-pointer border"
                    style={{ borderColor: AT.line }}
                />
                <input
                    value={value}
                    onChange={onChange}
                    placeholder="#6D3FC0"
                    className="w-full text-sm rounded-lg border px-3 py-2 outline-none"
                    style={{ borderColor: AT.line, color: AT.ink }}
                />
            </div>
        </div>
    );
}

function SelectField({ label, value, onChange, options, hint }) {
    return (
        <div className="mb-3">
            <label className="block text-xs font-medium mb-1" style={{ color: AT.sub }}>{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full text-sm rounded-lg border px-3 py-2 outline-none"
                style={{ borderColor: AT.line, color: AT.ink }}
            >
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
            {hint && <p className="text-[11px] mt-1" style={{ color: AT.sub }}>{hint}</p>}
        </div>
    );
}

function TypeBadge({ type }) {
    const isLong = type === "long";
    return (
        <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{
                background: isLong ? "#EDE7FB" : "#FDF1DE",
                color: isLong ? "#5227FF" : "#B4790F",
            }}
        >
            {isLong ? "Long" : "Short"}
        </span>
    );
}

function SegmentedTypeControl({ value, onChange }) {
    return (
        <div className="mb-3 flex rounded-lg border p-0.5 w-fit" style={{ borderColor: AT.line }}>
            {["long", "short"].map((t) => (
                <button
                    key={t}
                    type="button"
                    onClick={() => onChange(t)}
                    className="px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors"
                    style={
                        value === t
                            ? { background: AT.ink, color: "#fff" }
                            : { color: AT.sub }
                    }
                >
                    {t} course
                </button>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all"); // all | long | short
    const [modal, setModal] = useState(null); // null | 'new' | course (edit)
    const [viewing, setViewing] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        let hasTriedImport = false;

        const unsub = onSnapshot(
            collection(db, COURSES_COLLECTION),
            async (snap) => {
                if (snap.empty && !hasTriedImport) {
                    // First-ever load with nothing in Firestore yet: pull in the
                    // existing Sitedata.js + legacy short-course list once. The
                    // onSnapshot listener will fire again automatically once the
                    // writes land, this time with the imported courses.
                    hasTriedImport = true;
                    setSeeding(true);
                    try {
                        await importLegacyCourses();
                    } catch (err) {
                        setError(err.message);
                        setLoading(false);
                    } finally {
                        setSeeding(false);
                    }
                    return;
                }
                setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
        return () => unsub();
    }, []);

    // categories the admin has already used, split by type — powers the
    // datalist suggestions in the form so new courses stay consistent
    // with existing ones without hardcoding a category list in code.
    const categorySuggestions = useMemo(() => {
        const byType = { long: new Set(), short: new Set() };
        courses.forEach((c) => {
            if (c.category && byType[c.type]) byType[c.type].add(c.category);
        });
        return { long: [...byType.long].sort(), short: [...byType.short].sort() };
    }, [courses]);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return courses.filter((c) => {
            if (typeFilter !== "all" && c.type !== typeFilter) return false;
            return (
                c.title?.toLowerCase().includes(q) ||
                c.category?.toLowerCase().includes(q) ||
                c.instructor?.toLowerCase().includes(q)
            );
        });
    }, [courses, query, typeFilter]);

    const counts = useMemo(() => ({
        all: courses.length,
        long: courses.filter((c) => c.type === "long").length,
        short: courses.filter((c) => c.type === "short").length,
    }), [courses]);

    async function toggleStatus(course) {
        try {
            await updateDoc(doc(db, COURSES_COLLECTION, course.id), {
                status: course.status === "published" ? "draft" : "published",
            });
        } catch (err) {
            setError(err.message);
        }
    }

    async function save(form) {
        setSaving(true);
        try {
            const base = {
                type: form.type,
                title: form.title,
                category: form.category || "",
                description: form.description || "",
                duration: form.duration || "",
                tags: splitCommas(form.tagsInput),
                // shared across both types now — buy + progress works the
                // same way regardless of long/short.
                instructor: form.instructor || DEFAULT_INSTRUCTOR,
                icon: form.icon || iconForCategory(form.category),
                price: form.price || DEFAULT_PRICE,
                lessons: form.lessons ? Number(form.lessons) : estimateLessons(form.duration || ""),
            };

            const payload =
                form.type === "long"
                    ? {
                        ...base,
                        mode: form.mode || "",
                        link: form.link || "",
                        images: splitLines(form.imagesInput),
                        features: splitLines(form.featuresInput),
                        color: form.color || "#5227FF",
                    }
                    : {
                        ...base,
                        image: form.image || "",
                        color: form.color || "#6D3FC0",
                        popular: !!form.popular,
                    };

            if (form.id) {
                await updateDoc(doc(db, COURSES_COLLECTION, form.id), payload);
            } else {
                await addDoc(collection(db, COURSES_COLLECTION), {
                    ...payload,
                    students: 0,
                    status: "draft",
                    createdAt: serverTimestamp(),
                });
            }
            setModal(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function remove(course) {
        try {
            await deleteDoc(doc(db, COURSES_COLLECTION, course.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setConfirmDelete(null);
            setViewing(null);
        }
    }

    return (
        <Card>
            {error && (
                <div className="px-4 py-2 text-sm" style={{ background: "#fdecea", color: "#b3261e" }}>
                    {error}. Check COURSES_COLLECTION at the top of this file and your Firestore security
                    rules.
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: AT.line }}>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 flex-1 min-w-[180px]" style={{ borderColor: AT.line }}>
                    <Search size={15} color={AT.sub} />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search courses by title, category or instructor…"
                        className="text-sm outline-none w-full"
                    />
                </div>
                <p className="text-sm" style={{ color: AT.sub }}>{filtered.length} courses</p>
                <PrimaryButton onClick={() => setModal("new")}>
                    <Plus size={15} /> Add Course
                </PrimaryButton>
            </div>

            <div className="flex gap-2 px-4 pt-3">
                {[
                    ["all", `All (${counts.all})`],
                    ["long", `Long (${counts.long})`],
                    ["short", `Short (${counts.short})`],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTypeFilter(key)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
                        style={
                            typeFilter === key
                                ? { background: AT.ink, color: "#fff", borderColor: AT.ink }
                                : { color: AT.sub, borderColor: AT.line }
                        }
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left" style={{ color: AT.sub }}>
                            <th className="px-4 py-3 font-medium">Course</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Price</th>
                            <th className="px-4 py-3 font-medium">Enrolled</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading || seeding ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-sm" style={{ color: AT.sub }}>
                                    {seeding ? "Importing your existing courses…" : "Loading courses…"}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c) => (
                                <tr
                                    key={c.id}
                                    className="border-t cursor-pointer hover:bg-black/[0.02]"
                                    style={{ borderColor: AT.line }}
                                    onClick={() => setViewing(c)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium" style={{ color: AT.ink }}>{c.title}</p>
                                        <p className="text-xs" style={{ color: AT.sub }}>
                                            {c.instructor || "No instructor set"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3"><TypeBadge type={c.type} /></td>
                                    <td className="px-4 py-3" style={{ color: AT.ink }}>{c.category || "—"}</td>
                                    <td className="px-4 py-3" style={{ color: AT.ink }}>{c.price || "—"}</td>
                                    <td className="px-4 py-3" style={{ color: AT.ink }}>{c.students ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={(e) => { e.stopPropagation(); toggleStatus(c); }}>
                                            <Pill tone={c.status} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                            <button title="View details" onClick={() => setViewing(c)} style={{ color: AT.sub }}>
                                                <Eye size={16} />
                                            </button>
                                            <button title="Edit" onClick={() => setModal(c)} style={{ color: AT.sub }}>
                                                <Pencil size={16} />
                                            </button>
                                            <button title="Delete" onClick={() => setConfirmDelete(c)} style={{ color: AT.danger }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {!loading && filtered.length === 0 && (
                    <EmptyState text={query ? "No courses match your search." : "No courses yet — add your first one."} />
                )}
            </div>

            {modal && (
                <CourseForm
                    initial={modal === "new" ? null : modal}
                    saving={saving}
                    categorySuggestions={categorySuggestions}
                    onCancel={() => setModal(null)}
                    onSave={save}
                />
            )}

            {viewing && (
                <CourseDetail
                    course={viewing}
                    onClose={() => setViewing(null)}
                    onEdit={() => {
                        setModal(viewing);
                        setViewing(null);
                    }}
                    onDelete={() => setConfirmDelete(viewing)}
                />
            )}

            {confirmDelete && (
                <ConfirmDeleteModal
                    name={confirmDelete.title}
                    onCancel={() => setConfirmDelete(null)}
                    onConfirm={() => remove(confirmDelete)}
                />
            )}
        </Card>
    );
}

function CourseForm({ initial, saving, categorySuggestions, onCancel, onSave }) {
    const [form, setForm] = useState(
        initial
            ? {
                ...initial,
                tagsInput: (initial.tags || []).join(", "),
                featuresInput: (initial.features || []).join("\n"),
                imagesInput: (initial.images || []).join("\n"),
                lessons: initial.lessons ?? estimateLessons(initial.duration || ""),
                price: initial.price || "",
                icon: initial.icon || iconForCategory(initial.category),
                instructor: initial.instructor || "",
            }
            : {
                type: "long",
                title: "",
                category: "",
                instructor: "",
                duration: "",
                mode: "Online & Offline Both available",
                link: "",
                imagesInput: "",
                image: "",
                color: "#6D3FC0",
                popular: false,
                description: "",
                tagsInput: "",
                featuresInput: "",
                icon: "BookOpen",
                price: "",
                lessons: "",
            }
    );

    const isLong = form.type === "long";
    const suggestions = isLong ? categorySuggestions.long : categorySuggestions.short;

    return (
        <Modal title={initial ? "Edit course" : "Add course"} onClose={onCancel}>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
                {!initial && (
                    <SegmentedTypeControl value={form.type} onChange={(t) => setForm({ ...form, type: t })} />
                )}
                {initial && <div className="mb-3"><TypeBadge type={form.type} /></div>}

                <Field label="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

                <ComboField
                    label="Category"
                    listId="course-category-suggestions"
                    suggestions={suggestions}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    hint={isLong ? "e.g. Web Development, UI/UX Design" : "e.g. Programming & Development"}
                />

                <TextArea
                    label="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                />

                {/* -------- shared "buy + progress" fields, both types -------- */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Price (e.g. ₹4,999 or 'Contact us')" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <Field
                        label="Lessons (number)"
                        value={form.lessons}
                        onChange={(e) => setForm({ ...form, lessons: e.target.value.replace(/[^\d]/g, "") })}
                        hint="Drives the progress bar students see."
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
                    <SelectField
                        label="Icon"
                        value={form.icon}
                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                        options={ICON_KEYS}
                        hint="Shown on the course card in MyCourses."
                    />
                </div>
                {/* -------------------------------------------------------------- */}

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                    {isLong ? (
                        <Field label="Mode" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} />
                    ) : (
                        <ColorField label="Card color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                    )}
                </div>

                {isLong ? (
                    <>
                        <Field label="Enroll link (contact popup)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                        <TextArea
                            label="Image URLs"
                            value={form.imagesInput}
                            onChange={(e) => setForm({ ...form, imagesInput: e.target.value })}
                            rows={3}
                            hint="One URL per line — the card cycles through them on hover."
                        />
                        <TextArea
                            label="Features"
                            value={form.featuresInput}
                            onChange={(e) => setForm({ ...form, featuresInput: e.target.value })}
                            rows={4}
                            hint="One feature per line."
                        />
                    </>
                ) : (
                    <>
                        <Field label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                        <Checkbox
                            label="Mark as popular"
                            checked={form.popular}
                            onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                        />
                    </>
                )}

                <Field
                    label="Tags (comma separated)"
                    value={form.tagsInput}
                    onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                />
            </div>
            <div className="flex justify-end gap-2 mt-2">
                <GhostButton onClick={onCancel}>Cancel</GhostButton>
                <PrimaryButton disabled={saving} onClick={() => form.title.trim() && onSave(form)}>
                    {saving ? "Saving…" : "Save"}
                </PrimaryButton>
            </div>
        </Modal>
    );
}

function CourseDetail({ course, onClose, onEdit, onDelete }) {
    const created = toDate(course.createdAt);
    const isLong = course.type === "long";
    const previewImage = isLong ? course.images?.[0] : course.image;

    return (
        <Modal title="Course details" onClose={onClose}>
            <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4">
                {previewImage && (
                    <img
                        src={previewImage}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-lg"
                        style={{ border: `1px solid ${AT.line}` }}
                    />
                )}

                <div className="flex items-center gap-2">
                    <TypeBadge type={course.type} />
                    <div>
                        <p className="text-base font-semibold" style={{ color: AT.ink }}>{course.title}</p>
                        <p className="text-sm" style={{ color: AT.sub }}>{course.category || "Uncategorized"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <DetailRow label="Instructor" value={course.instructor || "—"} />
                    <DetailRow label="Price" value={course.price || "—"} />
                    <DetailRow label="Lessons" value={course.lessons ?? "—"} />
                    <DetailRow label="Icon" value={course.icon || "—"} />
                    {isLong ? (
                        <>
                            <DetailRow label="Mode" value={course.mode || "—"} />
                            <DetailRow label="Link" value={course.link || "—"} />
                        </>
                    ) : (
                        <>
                            <DetailRow label="Popular" value={course.popular ? "Yes" : "No"} />
                            <DetailRow
                                label="Color"
                                node={
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded-full inline-block" style={{ background: course.color }} />
                                        {course.color || "—"}
                                    </span>
                                }
                            />
                        </>
                    )}
                    <DetailRow label="Enrolled" value={course.students ?? 0} />
                    <DetailRow label="Duration" value={course.duration || "—"} />
                    <DetailRow label="Status" node={<Pill tone={course.status} />} />
                    <DetailRow label="Added" value={created ? created.toLocaleDateString() : "—"} />
                </div>

                {course.description && (
                    <div>
                        <p className="text-xs mb-1" style={{ color: AT.sub }}>Description</p>
                        <p className="text-sm" style={{ color: AT.ink }}>{course.description}</p>
                    </div>
                )}

                {course.tags?.length > 0 && (
                    <div>
                        <p className="text-xs mb-1.5" style={{ color: AT.sub }}>Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                            {course.tags.map((t) => (
                                <span
                                    key={t}
                                    className="text-[11px] px-2 py-0.5 rounded-full"
                                    style={{ background: AT.line, color: AT.ink }}
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {isLong && course.features?.length > 0 && (
                    <div>
                        <p className="text-xs mb-1.5" style={{ color: AT.sub }}>Features</p>
                        <ul className="text-sm list-disc pl-4 space-y-0.5" style={{ color: AT.ink }}>
                            {course.features.map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-between gap-2 pt-2">
                    <button onClick={onDelete} className="text-sm" style={{ color: AT.danger }}>
                        Remove course
                    </button>
                    <div className="flex gap-2">
                        <GhostButton onClick={onClose}>Close</GhostButton>
                        <PrimaryButton onClick={onEdit}>Edit</PrimaryButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function DetailRow({ label, value, node }) {
    return (
        <div>
            <p className="text-xs" style={{ color: AT.sub }}>{label}</p>
            {node ?? <p style={{ color: AT.ink }}>{value}</p>}
        </div>
    );
}