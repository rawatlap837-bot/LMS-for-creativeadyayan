import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, PlayCircle, FileText, HelpCircle } from "lucide-react";
import { AT, Card, Modal, Field, PrimaryButton, GhostButton, EmptyState, ConfirmDeleteModal } from "./AdminUI.jsx";

const courseOptions = [
  { id: "C-01", title: "Data Structures & Algorithms" },
  { id: "C-02", title: "Digital Signal Processing" },
  { id: "C-04", title: "Operating Systems" },
];

const seedLessons = {
  "C-01": [
    { id: "L-1", title: "Arrays & Time Complexity", type: "video", duration: "18 min" },
    { id: "L-2", title: "Linked Lists Deep Dive", type: "video", duration: "24 min" },
    { id: "L-3", title: "Week 1 Quiz", type: "quiz", duration: "10 questions" },
    { id: "L-4", title: "Recursion Basics", type: "reading", duration: "8 min read" },
  ],
  "C-02": [
    { id: "L-5", title: "Signals & Systems Intro", type: "video", duration: "20 min" },
  ],
  "C-04": [],
};

const typeIcon = { video: PlayCircle, quiz: HelpCircle, reading: FileText };

export default function Lessons() {
  const [courseId, setCourseId] = useState(courseOptions[0].id);
  const [lessons, setLessons] = useState(seedLessons);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const list = lessons[courseId] || [];
  const activeCourse = courseOptions.find((c) => c.id === courseId);

  const save = (form) => {
    setLessons((prev) => {
      const current = prev[courseId] || [];
      if (form.id) {
        return { ...prev, [courseId]: current.map((l) => (l.id === form.id ? { ...l, ...form } : l)) };
      }
      const id = "L-" + Math.floor(1000 + Math.random() * 9000);
      return { ...prev, [courseId]: [...current, { ...form, id }] };
    });
    setModal(null);
  };

  const remove = (id) => {
    setLessons((prev) => ({ ...prev, [courseId]: (prev[courseId] || []).filter((l) => l.id !== id) }));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm" style={{ color: AT.sub }}>Course:</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="text-sm border rounded-lg px-3 py-2 outline-none"
          style={{ borderColor: AT.line, color: AT.ink }}
        >
          {courseOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <PrimaryButton className="ml-auto" onClick={() => setModal("new")}>
          <Plus size={15} /> Add Lesson
        </PrimaryButton>
      </div>

      <Card title={`${activeCourse?.title} · ${list.length} lessons`}>
        <div className="divide-y" style={{ borderColor: AT.line }}>
          {list.map((l, i) => {
            const Icon = typeIcon[l.type] || FileText;
            return (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <GripVertical size={15} color={AT.sub} className="cursor-grab" />
                <span className="text-xs w-5" style={{ color: AT.sub }}>{i + 1}.</span>
                <Icon size={16} color={AT.accentDeep} />
                <div className="flex-1">
                  <p className="font-medium" style={{ color: AT.ink }}>{l.title}</p>
                  <p className="text-xs capitalize" style={{ color: AT.sub }}>{l.type} · {l.duration}</p>
                </div>
                <button onClick={() => setModal(l)} style={{ color: AT.sub }}><Pencil size={16} /></button>
                <button onClick={() => setConfirmDelete(l)} style={{ color: AT.danger }}><Trash2 size={16} /></button>
              </div>
            );
          })}
        </div>
        {list.length === 0 && <EmptyState text="No lessons yet — add the first one for this course." />}
      </Card>

      {modal && (
        <LessonForm initial={modal === "new" ? null : modal} onCancel={() => setModal(null)} onSave={save} />
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          name={confirmDelete.title}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => remove(confirmDelete.id)}
        />
      )}
    </div>
  );
}

function LessonForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial || { title: "", type: "video", duration: "" });
  return (
    <Modal title={initial ? "Edit lesson" : "Add lesson"} onClose={onCancel}>
      <Field label="Lesson title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <label className="block mb-3 text-sm">
        <span className="block mb-1 font-medium" style={{ color: AT.ink }}>Type</span>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
          style={{ borderColor: AT.line }}
        >
          <option value="video">Video</option>
          <option value="reading">Reading</option>
          <option value="quiz">Quiz</option>
        </select>
      </label>
      <Field label="Duration / length" placeholder="e.g. 12 min or 8 questions" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
      <div className="flex justify-end gap-2 mt-2">
        <GhostButton onClick={onCancel}>Cancel</GhostButton>
        <PrimaryButton onClick={() => form.title.trim() && onSave(form)}>Save</PrimaryButton>
      </div>
    </Modal>
  );
}