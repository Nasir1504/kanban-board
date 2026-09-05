"use client";

import { useEffect, useRef, useState } from "react";
import { PRIORITIES, TAGS } from "@/Data/data";
import { formatDay, formatStamp, isOverdue, toDateOnlyISO } from "@/lib/dates";
// The selected priority pill borrows its own colour; the rest stay neutral
// outlines — same palette the cards on the board use.
import { PRIORITY_STYLES, tagStyle } from "@/lib/taskStyles";

const Label = ({ children }) => (
  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
    {children}
  </span>
);

const CONTROL =
  "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-gray-400";

const TaskModal = ({ task, stage, assignees, onUpdate, onDelete, onClose }) => {
  const closeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [draft, setDraft] = useState(task.description ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;

      // Escape backs out of an open editor first, then the modal.
      if (isEditingTitle) {
        setTitleDraft(task.title);
        setIsEditingTitle(false);
        return;
      }

      if (isEditingDescription) {
        setDraft(task.description ?? "");
        setIsEditingDescription(false);
        return;
      }

      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    onClose,
    isEditingTitle,
    task.title,
    isEditingDescription,
    task.description,
  ]);

  useEffect(() => {
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!isEditingTitle) return;

    const field = titleRef.current;
    field?.focus();
    field?.setSelectionRange(field.value.length, field.value.length);
  }, [isEditingTitle]);

  useEffect(() => {
    if (!isEditingDescription) return;

    const field = descriptionRef.current;
    field?.focus();
    field?.setSelectionRange(field.value.length, field.value.length);
  }, [isEditingDescription]);

  const dueDateISO = toDateOnlyISO(task.dueDate);
  const late = isOverdue(dueDateISO, stage.id);
  const unusedTags = TAGS.filter((tag) => !task.tags.includes(tag));

  const commitTitle = () => {
    setIsEditingTitle(false);

    const next = titleDraft.trim();

    // A task always keeps a title, so an empty draft snaps back to the current one.
    if (!next || next === task.title) {
      setTitleDraft(task.title);
      return;
    }

    onUpdate(task.id, { title: next });
  };

  const commitDescription = () => {
    setIsEditingDescription(false);

    const next = draft.trim();
    if ((task.description ?? "") === next) return;

    onUpdate(task.id, { description: next || null });
  };

  // Clicking Save blurs whichever editor is open, which already commits it —
  // these calls cover the draft that is somehow still open when Save runs.
  const handleSave = () => {
    if (isEditingTitle) commitTitle();
    if (isEditingDescription) commitDescription();

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

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
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="h-4 w-4"
          >
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        <h2
          id="task-modal-title"
          className="pr-10 text-2xl font-semibold leading-snug text-gray-900"
        >
          {isEditingTitle ? (
            <input
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                // Enter blurs instead of committing directly, so the title only saves once.
                if (e.key !== "Enter") return;

                e.preventDefault();
                e.currentTarget.blur();
              }}
              aria-label="Task title"
              className="-mx-2 block w-[calc(100%_+_1rem)] rounded-lg border border-gray-200 px-2 py-1 text-2xl font-semibold leading-snug text-gray-900 outline-none focus:border-gray-400"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleDraft(task.title);
                setIsEditingTitle(true);
              }}
              className="-mx-2 block w-[calc(100%_+_1rem)] rounded-lg px-2 py-1 text-left leading-snug hover:bg-gray-50"
            >
              {task.title}
            </button>
          )}
        </h2>

        <p className="mt-1.5 text-[13px] text-gray-400">
          {task.updatedAt
            ? `Updated ${formatStamp(task.updatedAt)}`
            : "Not updated yet"}
        </p>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Assignee</Label>
            <select
              value={task.assigneeId ?? ""}
              onChange={(e) =>
                onUpdate(task.id, { assigneeId: e.target.value || null })
              }
              className={`${CONTROL} ${task.assigneeId ? "" : "text-gray-400"}`}
            >
              <option value="">Unassigned</option>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Due date</Label>
            <input
              type="date"
              value={dueDateISO ?? ""}
              onChange={(e) =>
                onUpdate(task.id, { dueDate: e.target.value || null })
              }
              className={`${CONTROL} ${late ? "border-red-300 text-red-600" : ""}`}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <Label>Priority</Label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((priority) => {
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
            {task.tags.map((tag) => (
              <span
                key={tag}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] ${tagStyle(tag)}`}
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() =>
                    onUpdate(task.id, {
                      tags: task.tags.filter((current) => current !== tag),
                    })
                  }
                  className="opacity-60 transition-opacity hover:opacity-100"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="h-3 w-3"
                  >
                    <path d="M4 4l12 12M16 4L4 16" />
                  </svg>
                </button>
              </span>
            ))}

            {unusedTags.length > 0 && (
              <select
                value=""
                aria-label="Add tag"
                onChange={(e) =>
                  onUpdate(task.id, { tags: [...task.tags, e.target.value] })
                }
                className="h-8 rounded-md border border-gray-200 bg-white px-2 text-[13px] text-gray-500 outline-none focus:border-gray-400"
              >
                <option value="" disabled>
                  + Add tag
                </option>
                {unusedTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
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
              onChange={(e) => setDraft(e.target.value)}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-gray-900 px-4 py-1.5 text-[15px] font-medium text-white transition-colors hover:bg-gray-700"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() =>
                confirmingDelete ? onDelete(task.id) : setConfirmingDelete(true)
              }
              onBlur={() => setConfirmingDelete(false)}
              className="rounded-md px-3 py-1.5 text-[15px] font-medium text-red-600 hover:bg-red-50"
            >
              {confirmingDelete ? "Click again to delete" : "Delete task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
