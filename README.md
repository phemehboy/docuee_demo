# Docuee (Demo Version)

![Node.js](https://img.shields.io/badge/node.js-18.17.1-green)
![Next.js](https://img.shields.io/badge/Next.js-14.1.1-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Live-Demo-blue)](https://docuee.com)

Welcome to **Docuee**, an education SaaS platform designed to help students write projects, think critically, and present their work — with real-time collaboration and AI support (demo version).

**Note:** This is a demo/lightweight version of the full live application. The demo focuses on **project writing and presentation**, which is just **one feature** of the complete Docuee platform. The full platform supports **all school-related activities** including exams, quizzes, results, and more. Sensitive production code is **not included**.

> ⚠️ **Important:** All AI features in this demo are **simulated/hidden**. No real AI calls are made, and no sensitive production data is included.

Try the demo live here: [Docuee Demo](https://docuee.com)

---

## Features (Demo)

- Project editor for students
- Structured idea and argument guidance (**AI is simulated in the demo**)
- Project presentation (demo slides)
- Real-time collaboration (limited demo)
- Clear UI/UX showing the flow of a project from start to finish

---

## Tech Stack

- **Frontend:** React, Next.js
- **Backend & APIs:** Node.js, Next.js API routes
- **Database:** MongoDB
- **Realtime Collaboration:** Liveblocks
- **Data & State Management:** Convex
- **Deployment:** Vercel (demo)
- **Other:** GitHub Actions for CI/CD, ESLint/Prettier for code quality

---

## Architecture

Docuee separates **presentation, business logic, and real-time collaboration**:

1. **Frontend:** Pages and components built in React/Next.js
2. **Backend:** API routes handle project data, authentication, and AI interactions
3. **Database:** MongoDB stores projects, users, and activity logs
4. **Real-time:** Liveblocks manages collaborative editing
5. **AI/Processing:** Convex handles state and real-time updates for AI suggestions (demo: AI is hidden/simulated)

---

## Installation (Demo)

```bash
git clone https://github.com/YourUsername/docuee-demo.git
cd docuee-demo
npm install
npm run dev
```
