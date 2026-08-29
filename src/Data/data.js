// Fake seed data for the Kanban board.
// Shape: `workflow` is keyed by stage id (insertion order = column order on screen),
// and each stage owns its own `items` array of task objects.

export const PRIORITIES = ["Critical", "High", "Medium", "Low"];

export const TAGS = [
  "Design",
  "Frontend",
  "Backend",
  "Feature",
  "Bug",
  "Performance",
  "Infrastructure",
  "Documentation",
];

export const assignees = [
  {
    id: "u1",
    name: "Aisha Rahman",
    initials: "AR",
    avatar: "https://i.pravatar.cc/80?img=45",
  },
  {
    id: "u2",
    name: "Marcus Chen",
    initials: "MC",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    id: "u3",
    name: "Priya Nair",
    initials: "PN",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: "u4",
    name: "Diego Alvarez",
    initials: "DA",
    avatar: "https://i.pravatar.cc/80?img=68",
  },
  {
    id: "u5",
    name: "Sofia Ivanova",
    initials: "SI",
    avatar: "https://i.pravatar.cc/80?img=26",
  },
];

export const workflow = {
  backlog: {
    id: "backlog",
    title: "Backlog",
    emoji: "📋",
    items: [
      {
        id: "t-101",
        title: "Floating Action Button",
        assigneeId: null,
        dueDate: "2026-09-01",
        priority: "Medium",
        tags: ["Design", "Frontend", "Feature"],
        description: null,
        createdAt: "2026-08-15",
        updatedAt: "2026-08-23T10:40:00",
      },
      {
        id: "t-102",
        title: "Add real-time presence indicators",
        assigneeId: null,
        dueDate: "2026-04-01",
        priority: "Medium",
        tags: ["Frontend", "Feature"],
        description:
          "Show who else is viewing a board in real time. Needs a presence channel on the socket server and an avatar stack in the board header.",
        createdAt: "2026-08-02",
        updatedAt: "2026-08-18T09:15:00",
      },
      {
        id: "t-103",
        title: "Implement authentication flow with Azure AD",
        assigneeId: "u1",
        dueDate: "2026-03-01",
        priority: "Critical",
        tags: ["Frontend", "Feature"],
        description:
          "Replace the placeholder login with MSAL. Covers sign-in, silent token refresh, and a protected-route wrapper.",
        createdAt: "2026-07-28",
        updatedAt: "2026-08-21T16:02:00",
      },
      {
        id: "t-104",
        title: "Database migration: add activity log table",
        assigneeId: "u5",
        dueDate: "2026-03-10",
        priority: "Medium",
        tags: ["Infrastructure", "Backend"],
        description:
          "Append-only table capturing task moves, edits, and deletes so the card detail view can render a history timeline.",
        createdAt: "2026-07-30",
        updatedAt: "2026-08-20T11:47:00",
      },
    ],
  },

  inProgress: {
    id: "inProgress",
    title: "In Progress",
    emoji: "🔧",
    items: [
      {
        id: "t-201",
        title: "Optimize dashboard initial load performance",
        assigneeId: "u2",
        dueDate: "2026-02-28",
        priority: "High",
        tags: ["Frontend", "Performance"],
        description:
          "First paint is sitting around 3.4s on a cold cache. Split the board bundle, defer the avatar sprites, and memoize the column renderer.",
        createdAt: "2026-07-12",
        updatedAt: "2026-08-24T08:30:00",
      },
      {
        id: "t-202",
        title: "Fix date picker timezone inconsistency",
        assigneeId: "u2",
        dueDate: "2026-02-22",
        priority: "Medium",
        tags: ["Bug", "Frontend"],
        description:
          "Due dates shift by a day for users east of UTC. The picker emits a local Date while the API expects a plain YYYY-MM-DD string.",
        createdAt: "2026-07-19",
        updatedAt: "2026-08-24T14:05:00",
      },
      {
        id: "t-203",
        title: "Set up CI/CD pipeline with GitHub Actions",
        assigneeId: "u5",
        dueDate: "2026-02-10",
        priority: "High",
        tags: ["Infrastructure"],
        description:
          "Lint, test, and build on every PR; deploy main to the staging environment on merge.",
        createdAt: "2026-07-05",
        updatedAt: "2026-08-22T17:20:00",
      },
    ],
  },

  inReview: {
    id: "inReview",
    title: "In Review",
    emoji: "👀",
    items: [
      {
        id: "t-301",
        title: "Add keyboard shortcuts for power users",
        assigneeId: null,
        dueDate: null,
        priority: "Low",
        tags: ["Frontend", "Feature"],
        description:
          "N to create a task, / to focus search, arrow keys to move between columns, and a ? overlay listing the bindings.",
        createdAt: "2026-06-24",
        updatedAt: "2026-08-19T13:11:00",
      },
      {
        id: "t-302",
        title: "Fix memory leak in WebSocket connection handler",
        assigneeId: "u4",
        dueDate: "2026-02-20",
        priority: "Critical",
        tags: ["Bug", "Performance"],
        description:
          "Reconnects register a new message listener without tearing down the old one, so heap usage climbs on every network blip.",
        createdAt: "2026-07-08",
        updatedAt: "2026-08-23T19:44:00",
      },
      {
        id: "t-303",
        title: "Write API documentation with OpenAPI spec",
        assigneeId: "u3",
        dueDate: "2026-03-20",
        priority: "Low",
        tags: ["Documentation"],
        description:
          "Document the board, task, and comment endpoints, then publish the generated spec at /docs.",
        createdAt: "2026-07-15",
        updatedAt: "2026-08-17T10:00:00",
      },
    ],
  },

  done: {
    id: "done",
    title: "Done",
    emoji: "✅",
    items: [
      {
        id: "t-401",
        title: "Design system: create Button component variants",
        assigneeId: "u3",
        dueDate: "2026-02-15",
        priority: "High",
        tags: ["Design", "Frontend"],
        description:
          "Primary, secondary, ghost, and destructive variants in three sizes, with focus and disabled states.",
        createdAt: "2026-06-10",
        updatedAt: "2026-08-14T15:30:00",
      },
      {
        id: "t-402",
        title: "Implement drag-and-drop task reordering",
        assigneeId: "u1",
        dueDate: "2026-02-25",
        priority: "High",
        tags: ["Frontend", "Feature"],
        description:
          "Move cards between columns and reorder within a column, with an optimistic update and a rollback if the save fails.",
        createdAt: "2026-06-18",
        updatedAt: "2026-08-16T12:25:00",
      },
    ],
  },
};

export default workflow;
