"use client"

import { useEffect, useRef, useState } from "react";
import { assignees, PRIORITIES, TAGS } from "@/Data/data";

// The selected priority pill borrows its own colour; the rest stay neutral outlines.
const PRIORITY_STYLES = {
    Critical: "border-red-300 text-red-600",
    High: "border-orange-300 text-orange-600",
    Medium: "border-amber-400 text-amber-600",
    Low: "border-emerald-300 text-emerald-600",
};

const TAG_STYLES = {
    Design: "bg-purple-50 text-purple-600",
    Frontend: "bg-blue-50 text-blue-600",
    Backend: "bg-teal-50 text-teal-600",
    Feature: "bg-orange-50 text-orange-600",
    Bug: "bg-rose-50 text-rose-600",
    Performance: "bg-emerald-50 text-emerald-600",
    Infrastructure: "bg-slate-100 text-slate-600",
    Documentation: "bg-indigo-50 text-indigo-600",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Dates in the seed data are plain strings ("2026-09-01", "2026-08-23T10:40:00"),
// so parse the parts by hand instead of via `new Date` — that keeps the rendered
// day from shifting with the viewer's timezone.
const formatDay = (value) => {
    if (!value) return null;

    const [year, month, day] = value.split("T")[0].split("-");

    return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
};

const formatStamp = (value) => {
    if (!value) return null;

    const day = formatDay(value);
    const time = value.split("T")[1];
    if (!time) return day;

    const [rawHour, minute] = time.split(":");
    const hour = Number(rawHour);
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${day}, ${hour12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
};

const todayAsISO = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
};

const Label = ({ children }) => (
    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">{children}</span>
);

const CONTROL = "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-gray-400";

const TaskModal = ({ task, stage, onUpdate, onDelete, onClose }) => {

    const closeRef = useRef(null);
    const descriptionRef = useRef(null);

    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [draft, setDraft] = useState(task.description ?? "");
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== "Escape") return;

            // Escape backs out of the description editor first, then the modal.
            if (isEditingDescription) {
                setDraft(task.description ?? "");
                setIsEditingDescription(false);
                return;
            }

            onClose();
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose, isEditingDescription, task.description]);

    useEffect(() => {
        closeRef.current?.focus();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    useEffect(() => {
        if (!isEditingDescription) return;

        const field = descriptionRef.current;
        field?.focus();
        field?.setSelectionRange(field.value.length, field.value.length);
    }, [isEditingDescription]);

    const isOverdue = task.dueDate && task.dueDate < todayAsISO() && stage.id !== "done";
    const unusedTags = TAGS.filter(tag => !task.tags.includes(tag));

    const commitDescription = () => {
        setIsEditingDescription(false);

        const next = draft.trim();
        if ((task.description ?? "") === next) return;

        onUpdate(task.id, { description: next || null });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-modal-title"
                className="relative z-10 flex w-full max-w-2xl max-h-[85vh] flex-col overflow-y-auto rounded-xl bg-white px-8 py-7 text-black shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
            >
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-5 top-5 rounded-md p-1.5 text-gray-400 outline-none hover:bg-gray-100 hover:text-gray-700 focus-visible:bg-gray-100"
                >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-4 w-4">
                        <path d="M4 4l12 12M16 4L4 16" />
                    </svg>
                </button>

                <h2 id="task-modal-title" className="pr-10 text-2xl font-semibold leading-snug text-gray-900">
                    {task.title}
                </h2>

                <p className="mt-1.5 text-[13px] text-gray-400">
                    {task.updatedAt ? `Updated ${formatStamp(task.updatedAt)}` : "Not updated yet"}
                </p>

                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label>Assignee</Label>
                        <select
                            value={task.assigneeId ?? ""}
                            onChange={e => onUpdate(task.id, { assigneeId: e.target.value || null })}
                            className={`${CONTROL} ${task.assigneeId ? "" : "text-gray-400"}`}
                        >
                            <option value="">Unassigned</option>
                            {assignees.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Due date</Label>
                        <input
                            type="date"
                            value={task.dueDate ?? ""}
                            onChange={e => onUpdate(task.id, { dueDate: e.target.value || null })}
                            className={`${CONTROL} ${isOverdue ? "border-red-300 text-red-600" : ""}`}
                        />
                    </div>
                </div>

                <div className="mt-7 flex flex-col gap-2">
                    <Label>Priority</Label>
                    <div className="flex flex-wrap gap-2">
                        {PRIORITIES.map(priority => {
                            const isSelected = task.priority === priority;

                            return (
                                <button
                                    key={priority}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => onUpdate(task.id, { priority })}
                                    className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${isSelected ? PRIORITY_STYLES[priority] : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                                >
                                    {priority}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-7 flex flex-col gap-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap items-center gap-2">
                        {task.tags.map(tag => (
                            <span
                                key={tag}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] ${TAG_STYLES[tag] ?? "bg-gray-100 text-gray-600"}`}
                            >
                                {tag}
                                <button
                                    type="button"
                                    aria-label={`Remove ${tag}`}
                                    onClick={() => onUpdate(task.id, { tags: task.tags.filter(current => current !== tag) })}
                                    className="opacity-60 transition-opacity hover:opacity-100"
                                >
                                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3">
                                        <path d="M4 4l12 12M16 4L4 16" />
                                    </svg>
                                </button>
                            </span>
                        ))}

                        {unusedTags.length > 0 && (
                            <select
                                value=""
                                aria-label="Add tag"
                                onChange={e => onUpdate(task.id, { tags: [...task.tags, e.target.value] })}
                                className="h-8 rounded-md border border-gray-200 bg-white px-2 text-[13px] text-gray-500 outline-none focus:border-gray-400"
                            >
                                <option value="" disabled>+ Add tag</option>
                                {unusedTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="mt-7 flex flex-col gap-2">
                    <Label>Description</Label>

                    {isEditingDescription ? (
                        <textarea
                            ref={descriptionRef}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onBlur={commitDescription}
                            rows={4}
                            placeholder="Add a description…"
                            className="w-full resize-y rounded-lg border border-gray-200 p-3 text-sm leading-relaxed text-gray-700 outline-none focus:border-gray-400"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditingDescription(true)}
                            className={`-mx-2 rounded-lg px-2 py-1.5 text-left text-sm leading-relaxed hover:bg-gray-50 ${task.description ? "text-gray-700" : "text-gray-400"}`}
                        >
                            {task.description ?? "No description — click to add one"}
                        </button>
                    )}
                </div>

                <div className="mt-7 flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                    <span className="text-[13px] text-gray-400">
                        {task.createdAt ? `Created ${formatDay(task.createdAt)}` : "—"}
                    </span>

                    <button
                        type="button"
                        onClick={() => (confirmingDelete ? onDelete(task.id) : setConfirmingDelete(true))}
                        onBlur={() => setConfirmingDelete(false)}
                        className="rounded-md px-2 py-1 text-[15px] font-medium text-red-600 hover:bg-red-50"
                    >
                        {confirmingDelete ? "Click again to delete" : "Delete task"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskModal;
