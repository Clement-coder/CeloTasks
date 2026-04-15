"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type TaskStatus = "open" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  currency: string;
  status: TaskStatus;
  creator: string;
  acceptor?: string;
  createdAt: string;
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Write a Twitter thread about Celo", description: "Create a 10-tweet thread explaining Celo's mission and ecosystem. Must include stats and links.", reward: "5", currency: "cUSD", status: "open", creator: "0x1234...abcd", createdAt: "2026-04-14" },
  { id: "2", title: "Translate docs to Spanish", description: "Translate the CeloTasks README and onboarding guide into Spanish. Native speaker preferred.", reward: "12", currency: "cUSD", status: "open", creator: "0x5678...ef01", createdAt: "2026-04-13" },
  { id: "3", title: "Design a logo for CeloTasks", description: "Create a modern, minimal logo. Deliver SVG + PNG. Must match teal/green/yellow brand colors.", reward: "25", currency: "cUSD", status: "in_progress", creator: "0x9abc...2345", acceptor: "0xdef0...6789", createdAt: "2026-04-12" },
  { id: "4", title: "Test MiniPay wallet flow", description: "Run through the full task creation and payment flow on MiniPay. Submit a bug report.", reward: "8", currency: "CELO", status: "open", creator: "0x1111...aaaa", createdAt: "2026-04-11" },
  { id: "5", title: "Record a demo video", description: "Record a 2-minute walkthrough of CeloTasks. Upload to YouTube and share the link.", reward: "15", currency: "cUSD", status: "completed", creator: "0x2222...bbbb", acceptor: "0x3333...cccc", createdAt: "2026-04-10" },
  { id: "6", title: "Write smart contract tests", description: "Write Hardhat tests for the CeloTasks contract covering all edge cases.", reward: "30", currency: "cUSD", status: "open", creator: "0x4444...dddd", createdAt: "2026-04-09" },
];

interface TaskStore {
  tasks: Task[];
  myAddress: string | null;
  setMyAddress: (addr: string) => void;
  createTask: (title: string, description: string, reward: string, currency: string) => void;
  acceptTask: (id: string) => void;
  completeTask: (id: string) => void;
  releasePayment: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  browseTasks: Task[];
  myCreatedTasks: Task[];
  myAcceptedTasks: Task[];
}

const TaskContext = createContext<TaskStore | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [myAddress, setMyAddress] = useState<string | null>(null);

  const update = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const createTask = useCallback((title: string, description: string, reward: string, currency: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title, description, reward, currency,
      status: "open",
      creator: myAddress ?? "0xYou...r",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, [myAddress]);

  const acceptTask = useCallback((id: string) => {
    update(id, { status: "in_progress", acceptor: myAddress ?? "0xYou...r" });
  }, [update, myAddress]);

  const completeTask = useCallback((id: string) => {
    update(id, { status: "completed" });
  }, [update]);

  const releasePayment = useCallback((id: string) => {
    // payment released — keep as completed but could mark "paid" in real contract
    update(id, { status: "completed" });
  }, [update]);

  const getTask = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  const browseTasks = tasks.filter((t) => t.status === "open");
  const myCreatedTasks = tasks.filter((t) => t.creator === (myAddress ?? "0xYou...r") || t.creator === "0x1234...abcd");
  const myAcceptedTasks = tasks.filter((t) => t.acceptor === (myAddress ?? "0xYou...r") || t.acceptor === "0x3333...cccc" || t.acceptor === "0xdef0...6789");

  return (
    <TaskContext.Provider value={{ tasks, myAddress, setMyAddress, createTask, acceptTask, completeTask, releasePayment, getTask, browseTasks, myCreatedTasks, myAcceptedTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskStore() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskStore must be used within TaskProvider");
  return ctx;
}
