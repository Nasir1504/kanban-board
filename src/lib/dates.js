// Date helpers shared by the board cards and the task modal. Everything here
// works on the string form the API hands back, so nothing depends on the
// viewer's timezone the way `new Date(value)` would.

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2026-08-25T10:30:00" -> "Aug 25, 2026"
export const formatDay = (value) => {
  if (!value) return null;

  // "2026-08-25T10:30:00" -> "2026-08-25" -> ["2026", "08", "25"]
  const [year, month, day] = value.split("T")[0].split("-");

  // MONTHS is zero-indexed, so month 08 lives at position 7, and Number(day)
  // strips the leading zero: "05" -> 5.
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
};

// The card-sized version of the above: "2026-08-25" -> "Aug 25".
export const formatShortDay = (value) => {
  if (!value) return null;

  const [, month, day] = value.split("T")[0].split("-");

  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
};

// formats both the date and the time.
export const formatStamp = (value) => {
  if (!value) return null;

  const day = formatDay(value);
  const time = value.split("T")[1];
  if (!time) return day;

  const [rawHour, minute] = time.split(":");
  const hour = Number(rawHour);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${day}, ${hour12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
};

export const todayAsISO = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
};

// Calendar date as YYYY-MM-DD, whether the source is a date-only string,
// an ISO datetime, or a Date (e.g. from Mongo). Lexicographic compare is
// then safe against todayAsISO().
export const toDateOnlyISO = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    const datePart = value.split("T")[0];
    return DATE_ONLY.test(datePart) ? datePart : null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  // Date-only values from Mongo/JSON are stored as UTC midnight of that day.
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// A due date only reads as late while the task still has work left in it, so
// anything sitting in the done column is never flagged.
export const isOverdue = (dueDateISO, stageId) =>
  Boolean(dueDateISO) && dueDateISO < todayAsISO() && stageId !== "done";
