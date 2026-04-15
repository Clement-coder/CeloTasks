"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const TASK_CATEGORIES = ["Writing", "Design", "Development", "Testing", "Marketing", "Video"] as const;
export const TASK_DIFFICULTIES = ["Quick", "Standard", "Advanced"] as const;
export const TASK_CURRENCIES = ["cUSD", "CELO"] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskDifficulty = (typeof TASK_DIFFICULTIES)[number];
export type TaskCurrency = (typeof TASK_CURRENCIES)[number];
export type TaskStatus = "open" | "in_progress" | "submitted" | "approved" | "paid";
export type ActivityType =
  | "created"
  | "accepted"
  | "submitted"
  | "revision_requested"
  | "approved"
  | "paid";

export interface TaskSubmission {
  proofText: string;
  proofLink: string;
  submittedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  currency: TaskCurrency;
  status: TaskStatus;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  creator: string;
  acceptor?: string;
  createdAt: string;
  deadline: string;
  estimatedHours: string;
  deliverables: string[];
  submissionGuide: string;
  tags: string[];
  submission?: TaskSubmission;
  creatorFeedback?: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface ActivityItem {
  id: string;
  taskId: string;
  type: ActivityType;
  actor: string;
  taskTitle: string;
  note: string;
  at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  reward: string;
  currency: TaskCurrency;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  deadline: string;
  estimatedHours: string;
  deliverables: string[];
  submissionGuide: string;
  tags: string[];
}

interface TaskStore {
  tasks: Task[];
  activity: ActivityItem[];
  myAddress: string | null;
  currentUser: string;
  setMyAddress: (addr: string) => void;
  createTask: (input: CreateTaskInput) => string;
  acceptTask: (id: string) => void;
  submitTask: (id: string, payload: { proofText: string; proofLink: string }) => void;
  requestRevision: (id: string, feedback: string) => void;
  approveTask: (id: string) => void;
  releasePayment: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  browseTasks: Task[];
  myCreatedTasks: Task[];
  myAcceptedTasks: Task[];
  reviewQueue: Task[];
  paymentQueue: Task[];
  stats: {
    openTasks: number;
    inProgressTasks: number;
    reviewQueue: number;
    readyForPayout: number;
    earnings: number;
    spend: number;
    successRate: number;
  };
}

const STORAGE_KEY = "celotasks_frontend_store_v2";
const FALLBACK_USER = "0xCelo...Tasks";

const INITIAL_TASKS: Task[] = [
  {
    id: "task-101",
    title: "Write a launch thread for CeloTasks",
    description: "Create a 10-post launch thread that explains the problem, product, and how MiniPay users can earn from day one.",
    reward: "14",
    currency: "cUSD",
    status: "open",
    category: "Writing",
    difficulty: "Standard",
    creator: "0xNova...Labs",
    createdAt: "2026-04-13",
    deadline: "2026-04-20",
    estimatedHours: "3",
    deliverables: ["10 short posts", "1 headline hook", "CTA with wallet onboarding"],
    submissionGuide: "Submit the draft in plain text plus a final polished version.",
    tags: ["launch", "copywriting", "social"],
  },
  {
    id: "task-102",
    title: "Record a MiniPay walkthrough video",
    description: "Create a 90-second vertical demo showing task browsing, acceptance, and payout flow for social promotion.",
    reward: "22",
    currency: "cUSD",
    status: "in_progress",
    category: "Video",
    difficulty: "Standard",
    creator: FALLBACK_USER,
    acceptor: "0xStudio...Flow",
    createdAt: "2026-04-12",
    deadline: "2026-04-18",
    estimatedHours: "5",
    deliverables: ["Vertical MP4", "Thumbnail still", "Caption copy"],
    submissionGuide: "Share an unlisted drive or Loom link with export assets.",
    tags: ["video", "marketing", "minipay"],
  },
  {
    id: "task-103",
    title: "QA the wallet connect flow on Android",
    description: "Test connection, disconnect, reconnection, and error handling on Android devices and document failures clearly.",
    reward: "9",
    currency: "CELO",
    status: "submitted",
    category: "Testing",
    difficulty: "Quick",
    creator: FALLBACK_USER,
    acceptor: "0xQA...Spark",
    createdAt: "2026-04-11",
    deadline: "2026-04-17",
    estimatedHours: "2",
    deliverables: ["Bug list", "Screen recording", "Device matrix"],
    submissionGuide: "Submit a public notion doc or markdown report link.",
    tags: ["qa", "android", "wallet"],
    submission: {
      proofText: "Documented 4 wallet edge cases, including one reconnect issue after app backgrounding.",
      proofLink: "https://example.com/qa-wallet-report",
      submittedAt: "2026-04-14T10:45:00.000Z",
    },
  },
  {
    id: "task-104",
    title: "Design creator and worker profile cover art",
    description: "Create two profile header treatments for the app, optimized for mobile first and matching the current brand palette.",
    reward: "18",
    currency: "cUSD",
    status: "approved",
    category: "Design",
    difficulty: "Standard",
    creator: FALLBACK_USER,
    acceptor: "0xPixel...Mint",
    createdAt: "2026-04-10",
    deadline: "2026-04-15",
    estimatedHours: "4",
    deliverables: ["2 mobile-ready Figma frames", "Exported PNG previews"],
    submissionGuide: "Attach Figma link and exported image previews.",
    tags: ["design", "profile", "mobile"],
    submission: {
      proofText: "Delivered two visual directions with updated gradients and tighter mobile spacing.",
      proofLink: "https://example.com/profile-cover-designs",
      submittedAt: "2026-04-13T09:20:00.000Z",
    },
    approvedAt: "2026-04-14T08:10:00.000Z",
  },
  {
    id: "task-105",
    title: "Translate onboarding copy to French",
    description: "Translate the main landing page and dashboard empty states into French, preserving the product tone.",
    reward: "11",
    currency: "cUSD",
    status: "paid",
    category: "Writing",
    difficulty: "Quick",
    creator: "0xOrbit...Team",
    acceptor: FALLBACK_USER,
    createdAt: "2026-04-08",
    deadline: "2026-04-12",
    estimatedHours: "2",
    deliverables: ["Localized copy", "Glossary of product terms"],
    submissionGuide: "Submit translated copy in a shareable doc.",
    tags: ["translation", "french", "product"],
    submission: {
      proofText: "Translated the landing page, CTA buttons, onboarding prompts, and empty-state language.",
      proofLink: "https://example.com/french-copy",
      submittedAt: "2026-04-10T15:00:00.000Z",
    },
    approvedAt: "2026-04-11T10:00:00.000Z",
    paidAt: "2026-04-11T10:04:00.000Z",
  },
  {
    id: "task-106",
    title: "Ship a dashboard stats visual refresh",
    description: "Polish the dashboard KPI cards with stronger hierarchy, spacing, and more deliberate CTA placement.",
    reward: "16",
    currency: "cUSD",
    status: "in_progress",
    category: "Design",
    difficulty: "Advanced",
    creator: "0xDesign...Ops",
    acceptor: FALLBACK_USER,
    createdAt: "2026-04-14",
    deadline: "2026-04-19",
    estimatedHours: "6",
    deliverables: ["Revised dashboard mock", "Design notes", "Spacing tokens"],
    submissionGuide: "Send a Figma link and 3 screenshots covering mobile and desktop.",
    tags: ["dashboard", "ui", "design"],
  },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: "activity-1",
    taskId: "task-105",
    type: "paid",
    actor: "0xOrbit...Team",
    taskTitle: "Translate onboarding copy to French",
    note: "Released payment after final copy review.",
    at: "2026-04-11T10:04:00.000Z",
  },
  {
    id: "activity-2",
    taskId: "task-104",
    type: "approved",
    actor: FALLBACK_USER,
    taskTitle: "Design creator and worker profile cover art",
    note: "Approved the submitted assets and queued payment.",
    at: "2026-04-14T08:10:00.000Z",
  },
  {
    id: "activity-3",
    taskId: "task-103",
    type: "submitted",
    actor: "0xQA...Spark",
    taskTitle: "QA the wallet connect flow on Android",
    note: "Submitted the QA report and device matrix for review.",
    at: "2026-04-14T10:45:00.000Z",
  },
];

const TaskContext = createContext<TaskStore | null>(null);

function sortByNewest(items: { createdAt?: string; at?: string }[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date((a.at ?? a.createdAt) || 0).getTime();
    const bTime = new Date((b.at ?? b.createdAt) || 0).getTime();
    return bTime - aTime;
  });
}

function appendActivity(
  prev: ActivityItem[],
  task: Task,
  type: ActivityType,
  actor: string,
  note: string,
): ActivityItem[] {
  return sortByNewest([
    {
      id: `activity-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      taskId: task.id,
      type,
      actor,
      taskTitle: task.title,
      note,
      at: new Date().toISOString(),
    },
    ...prev,
  ]) as ActivityItem[];
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activity, setActivity] = useState<ActivityItem[]>(sortByNewest(INITIAL_ACTIVITY) as ActivityItem[]);
  const [myAddress, setMyAddress] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { tasks?: Task[]; activity?: ActivityItem[] };
        if (parsed.tasks?.length) setTasks(parsed.tasks);
        if (parsed.activity?.length) setActivity(parsed.activity);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, activity }));
  }, [tasks, activity, hydrated]);

  const currentUser = myAddress ?? FALLBACK_USER;

  const createTask = (input: CreateTaskInput) => {
    const id = `task-${Date.now()}`;
    const task: Task = {
      id,
      title: input.title,
      description: input.description,
      reward: input.reward,
      currency: input.currency,
      status: "open",
      category: input.category,
      difficulty: input.difficulty,
      creator: currentUser,
      createdAt: new Date().toISOString().slice(0, 10),
      deadline: input.deadline,
      estimatedHours: input.estimatedHours,
      deliverables: input.deliverables,
      submissionGuide: input.submissionGuide,
      tags: input.tags,
    };
    setTasks((prev) => sortByNewest([task, ...prev]) as Task[]);
    setActivity((prev) => appendActivity(prev, task, "created", currentUser, "Published a new task and funded the mock escrow."));
    return id;
  };

  const acceptTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id && task.status === "open"
          ? { ...task, status: "in_progress", acceptor: currentUser }
          : task,
      ),
    );

    const task = tasks.find((item) => item.id === id);
    if (task) {
      setActivity((prev) => appendActivity(prev, { ...task, status: "in_progress", acceptor: currentUser }, "accepted", currentUser, "Accepted the task and started work."));
    }
  };

  const submitTask = (id: string, payload: { proofText: string; proofLink: string }) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "submitted",
              creatorFeedback: undefined,
              submission: {
                proofText: payload.proofText,
                proofLink: payload.proofLink,
                submittedAt: now,
              },
            }
          : task,
      ),
    );

    const task = tasks.find((item) => item.id === id);
    if (task) {
      setActivity((prev) => appendActivity(prev, { ...task, status: "submitted" }, "submitted", currentUser, "Submitted work proof for creator review."));
    }
  };

  const requestRevision = (id: string, feedback: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "in_progress",
              creatorFeedback: feedback,
            }
          : task,
      ),
    );

    const task = tasks.find((item) => item.id === id);
    if (task) {
      setActivity((prev) => appendActivity(prev, { ...task, status: "in_progress" }, "revision_requested", currentUser, feedback));
    }
  };

  const approveTask = (id: string) => {
    const approvedAt = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "approved",
              approvedAt,
              creatorFeedback: undefined,
            }
          : task,
      ),
    );

    const task = tasks.find((item) => item.id === id);
    if (task) {
      setActivity((prev) => appendActivity(prev, { ...task, status: "approved", approvedAt }, "approved", currentUser, "Approved the submission and queued payment."));
    }
  };

  const releasePayment = (id: string) => {
    const paidAt = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "paid",
              paidAt,
            }
          : task,
      ),
    );

    const task = tasks.find((item) => item.id === id);
    if (task) {
      setActivity((prev) => appendActivity(prev, { ...task, status: "paid", paidAt }, "paid", currentUser, `Released ${task.reward} ${task.currency} to the worker.`));
    }
  };

  const getTask = (id: string) => tasks.find((task) => task.id === id);

  const browseTasks = tasks.filter((task) => task.status === "open" && task.creator !== currentUser);
  const myCreatedTasks = sortByNewest(tasks.filter((task) => task.creator === currentUser)) as Task[];
  const myAcceptedTasks = sortByNewest(tasks.filter((task) => task.acceptor === currentUser)) as Task[];
  const reviewQueue = sortByNewest(tasks.filter((task) => task.creator === currentUser && task.status === "submitted")) as Task[];
  const paymentQueue = sortByNewest(tasks.filter((task) => task.creator === currentUser && task.status === "approved")) as Task[];

  const completedAsWorker = tasks.filter((task) => task.acceptor === currentUser && task.status === "paid");
  const paidOut = tasks.filter((task) => task.creator === currentUser && task.status === "paid");
  const earnings = completedAsWorker.reduce((sum, task) => sum + Number(task.reward), 0);
  const spend = paidOut.reduce((sum, task) => sum + Number(task.reward), 0);
  const resolved = myAcceptedTasks.filter((task) => task.status === "paid");
  const successRate = myAcceptedTasks.length ? Math.round((resolved.length / myAcceptedTasks.length) * 100) : 100;

  const stats = {
    openTasks: tasks.filter((task) => task.status === "open").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
    reviewQueue: reviewQueue.length,
    readyForPayout: paymentQueue.length,
    earnings,
    spend,
    successRate,
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activity,
        myAddress,
        currentUser,
        setMyAddress,
        createTask,
        acceptTask,
        submitTask,
        requestRevision,
        approveTask,
        releasePayment,
        getTask,
        browseTasks,
        myCreatedTasks,
        myAcceptedTasks,
        reviewQueue,
        paymentQueue,
        stats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskStore() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskStore must be used within TaskProvider");
  return ctx;
}
