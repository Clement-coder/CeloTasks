<div align="center">

<br/>

<img src="celo-frontend/public/celoTasklogo.png" alt="CeloTasks" width="88" height="88" />

<br/>
<br/>

# CeloTasks

**Micro tasks. Instant pay. Onchain reputation.**

<p>
  Complete small tasks and get paid instantly on Celo using MiniPay.<br/>
  Build your verifiable reputation. Earn on your terms.
</p>

<br/>

[![Live App](https://img.shields.io/badge/Live%20App-celo--tasks.vercel.app-35D07F?style=for-the-badge)](https://celo-tasks.vercel.app)

<br/>

[![Celo](https://img.shields.io/badge/Celo-Mainnet-35D07F?style=flat-square&logo=ethereum&logoColor=white)](https://celo.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square)](https://web.dev/progressive-web-apps)
[![MiniPay](https://img.shields.io/badge/MiniPay-Native-35D07F?style=flat-square)](https://minipay.opera.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## What is CeloTasks?

CeloTasks is a **decentralized micro-task marketplace** on the Celo blockchain. Post a task with a cUSD reward, complete it, get paid — instantly, trustlessly, onchain.

No middlemen. No waiting. No banks.

Built mobile-first for **MiniPay** users across Africa and beyond. Earn real money from your phone in minutes.

---

## Demo

> _Add screenshots or a GIF here once deployed_

| Landing | Dashboard | Task Detail | Profile |
|:---:|:---:|:---:|:---:|
| Hero + live stats | Browse & filter | Apply, submit, earn | Reputation & history |

---

## Features

**For workers**
- Browse open tasks filtered by category, reward, and deadline
- Apply to tasks and submit your work directly onchain
- Get paid in cUSD the moment your submission is approved — under 3 seconds
- Build a permanent, verifiable reputation score with every completed task

**For task posters**
- Post tasks with custom cUSD rewards, deadlines, categories, and tags
- Review submissions and approve or reject with one click
- Payment is released automatically on approval — no manual transfers

**Platform**
- 🔎 Global search — find tasks by title or tag from the navbar
- 📊 Activity feed — full history of every action and payment
- 💼 Wallet modal — live cUSD balance, MoonPay on-ramp, CELO send
- 📲 PWA — install as a native app, works offline
- 🔔 Live stats — real-time tasks posted, completed, and total paid out

---

## How It Works

```
1. Connect Wallet   →  Open in MiniPay or connect any Celo wallet. No sign-up.
2. Browse or Post   →  Find tasks that match your skills, or post one with a reward.
3. Complete & Earn  →  Finish the work, get verified onchain, receive cUSD instantly.
```

### Task Lifecycle

```
Open → Applied → In Progress → Submitted → Approved → Paid
                                         ↘ Rejected → Resubmit
```

Every state transition is recorded in the activity feed and contributes to your onchain reputation score.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org/) App Router | Full-stack, SSR + RSC |
| Language | TypeScript 5 | Strict mode throughout |
| Styling | Tailwind CSS 4 | Mobile-first utility classes |
| Blockchain | [Celo Mainnet](https://celo.org/) | EVM-compatible, low fees |
| Wallet Auth | [Privy](https://privy.io/) | MiniPay + MetaMask + embedded wallets |
| Onchain Reads | [wagmi](https://wagmi.sh/) + [viem](https://viem.sh/) | Type-safe contract calls |
| Fiat On-ramp | [MoonPay](https://moonpay.com/) | Cards, bank, Apple Pay |
| State | React Context + custom hooks | No external state library |
| PWA | Web App Manifest + Service Worker | Offline shell caching |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Celo wallet — [MiniPay](https://minipay.opera.com), MetaMask, or Privy embedded wallet

### Run Locally

```bash
git clone https://github.com/Clement-coder/CeloTasks.git
cd CeloTasks/celo-frontend

npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
celo-frontend/
├── app/
│   ├── page.tsx            # Landing — hero, stats, features, testimonials
│   ├── layout.tsx          # Root layout, metadata, PWA config
│   ├── dashboard/          # Task browsing with filters & search
│   ├── create-task/        # Task creation form
│   ├── task/[id]/          # Task detail, apply, submit, review, pay
│   ├── activity/           # Activity feed
│   ├── profile/            # Wallet stats, reputation, task history
│   └── offline/            # Offline fallback
├── components/
│   ├── Navbar.tsx          # Sticky nav — wallet, global search, links
│   ├── BottomNav.tsx       # Mobile tab bar
│   ├── BrowseTasks.tsx     # Task list with category/status filters
│   ├── CreateTaskForm.tsx  # Multi-field task creation
│   ├── TaskCard.tsx        # Task preview card
│   ├── WalletModal.tsx     # Balance, MoonPay fund, CELO withdraw
│   ├── LiveStats.tsx       # Real-time platform metrics
│   └── ...
├── lib/
│   ├── taskStore.tsx       # Global task state (React Context)
│   ├── wagmi.ts            # Wagmi + Privy config
│   └── mockData.ts         # Dev seed data
├── hooks/
│   ├── useContract.ts      # Smart contract hook
│   ├── useCUSDBalance.ts   # Live cUSD balance
│   └── useToast.ts         # Toast notifications
└── public/
    ├── manifest.json       # PWA manifest + shortcuts
    ├── sw.js               # Service worker
    └── *.png               # App icons (16px → 512px)
```

---

## PWA & Mobile

| Feature | Details |
|---|---|
| Offline support | Service Worker caches the app shell |
| Install prompt | Native banner on Android and iOS |
| MiniPay detection | Auto-detects MiniPay and adapts the UI |
| Standalone mode | Runs like a native app from the home screen |
| App shortcuts | Quick-launch Browse, Create, Activity from the icon |

---

## Wallet

- Connect via **MiniPay**, **MetaMask**, or **Privy embedded wallet**
- Live **cUSD balance** fetched directly from Celo
- **Add funds** via MoonPay — Visa, Mastercard, Apple Pay, bank transfer
- **Send CELO** to any address on the Celo network

---

## Contributing

PRs are welcome. For major changes, open an issue first.

```bash
git checkout -b feat/your-feature
git commit -m "feat: describe your change"
git push origin feat/your-feature
# then open a PR
```

---

## License

MIT © 2026 CeloTasks
