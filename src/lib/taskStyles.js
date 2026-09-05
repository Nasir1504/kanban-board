// The colour vocabulary a task carries with it: the same pill on a card and in
// the modal, so a tag reads as the same thing wherever it turns up.

export const PRIORITY_STYLES = {
  Critical: "border-red-300 text-red-600",
  High: "border-orange-300 text-orange-600",
  Medium: "border-amber-400 text-amber-600",
  Low: "border-emerald-300 text-emerald-600",
};

export const TAG_STYLES = {
  Design: "bg-purple-50 text-purple-600",
  Frontend: "bg-blue-50 text-blue-600",
  Backend: "bg-teal-50 text-teal-600",
  Feature: "bg-orange-50 text-orange-600",
  Bug: "bg-rose-50 text-rose-600",
  Performance: "bg-emerald-50 text-emerald-600",
  Infrastructure: "bg-slate-100 text-slate-600",
  Documentation: "bg-indigo-50 text-indigo-600",
};

export const tagStyle = (tag) => TAG_STYLES[tag] ?? "bg-gray-100 text-gray-600";

export const priorityStyle = (priority) =>
  PRIORITY_STYLES[priority] ?? "border-gray-200 text-gray-600";
