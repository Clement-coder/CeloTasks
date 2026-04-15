// lib/mockData.ts
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

export const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Write a Twitter thread about Celo",
    description: "Create a 10-tweet thread explaining Celo's mission and ecosystem. Must include stats and links.",
    reward: "5",
    currency: "cUSD",
    status: "open",
    creator: "0x1234...abcd",
    createdAt: "2026-04-14",
  },
  {
    id: "2",
    title: "Translate docs to Spanish",
    description: "Translate the CeloTasks README and onboarding guide into Spanish. Native speaker preferred.",
    reward: "12",
    currency: "cUSD",
    status: "open",
    creator: "0x5678...ef01",
    createdAt: "2026-04-13",
  },
  {
    id: "3",
    title: "Design a logo for CeloTasks",
    description: "Create a modern, minimal logo. Deliver SVG + PNG. Must match teal/green/yellow brand colors.",
    reward: "25",
    currency: "cUSD",
    status: "in_progress",
    creator: "0x9abc...2345",
    acceptor: "0xdef0...6789",
    createdAt: "2026-04-12",
  },
  {
    id: "4",
    title: "Test MiniPay wallet flow",
    description: "Run through the full task creation and payment flow on MiniPay. Submit a bug report.",
    reward: "8",
    currency: "CELO",
    status: "open",
    creator: "0x1111...aaaa",
    createdAt: "2026-04-11",
  },
  {
    id: "5",
    title: "Record a demo video",
    description: "Record a 2-minute walkthrough of CeloTasks. Upload to YouTube and share the link.",
    reward: "15",
    currency: "cUSD",
    status: "completed",
    creator: "0x2222...bbbb",
    acceptor: "0x3333...cccc",
    createdAt: "2026-04-10",
  },
  {
    id: "6",
    title: "Write smart contract tests",
    description: "Write Hardhat tests for the CeloTasks contract covering all edge cases.",
    reward: "30",
    currency: "cUSD",
    status: "open",
    creator: "0x4444...dddd",
    createdAt: "2026-04-09",
  },
];

export const MY_CREATED_TASKS: Task[] = [MOCK_TASKS[0], MOCK_TASKS[2]];
export const MY_ACCEPTED_TASKS: Task[] = [MOCK_TASKS[3], MOCK_TASKS[4]];
