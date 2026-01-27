# Docuee — Education Infrastructure for Project Writing & Academic Workflows (Demo)

![Node.js](https://img.shields.io/badge/node.js-18.17.1-green)
![Next.js](https://img.shields.io/badge/Next.js-14.1.1-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Live-Demo-blue)](https://docuee.com)

Docuee is an education SaaS platform designed to modernize how students plan, write, review, and present academic projects — while giving institutions structure, visibility, and control over academic workflows.

This repository contains a **demo / lightweight version** of Docuee.  
The demo focuses specifically on **project writing and presentation**, which represents **one component** of the full Docuee platform.

> ⚠️ **Important:** This is **not** the full production system.  
> Sensitive production logic, real AI pipelines, billing systems, and institutional controls are intentionally excluded.

---

## 🔗 Live Demo Access

You can explore the demo environment here:

👉 **https://docuee-demo.vercel.app/**

### Demo Login (Student Account)

- **Username:** `demo_student`
- **Password:** `DemoStudent@2026!`

> These credentials are provided strictly for demonstration and evaluation purposes.  
> The demo uses sample data and does not connect to real institutions or users.

---

## 🎯 What Docuee Solves

In many educational systems, especially in higher education:

- Students struggle with **structuring projects**
- Supervision workflows are **manual, opaque, or inconsistent**
- Project writing is often **outsourced**, reducing learning outcomes
- Institutions lack **end-to-end visibility** into academic work

Docuee addresses this by providing:

- Structured project workflows
- Transparent supervision stages
- Real-time collaboration
- Guided thinking and feedback (**AI-assisted in production**)

---

## ✨ Demo Features

The demo highlights the **core student project experience**:

- 📄 Project writing editor with structured stages
- 🧠 Guided idea development and argument flow (**AI is simulated in the demo**)
- 📊 Project presentation (demo slide flow)
- 🤝 Real-time collaboration (limited demo scope)
- 🔁 Clear project lifecycle: draft → review → completion

---

## 🧱 Tech Stack

- **Frontend:** React, Next.js
- **Backend & APIs:** Node.js, Next.js API Routes
- **Database:** MongoDB
- **Realtime Collaboration:** Liveblocks
- **Data & State Management:** Convex
- **Deployment:** Vercel (Demo)
- **Tooling:** ESLint, Prettier, GitHub Actions (CI/CD)

---

## 🏗 Architecture Overview

Docuee is built with a **modular, scalable architecture**:

### Frontend Layer

- React + Next.js pages and components
- Optimized for clarity and academic workflows

### Backend Layer

- API routes for authentication, project logic, and validations
- Designed to evolve into service-based architecture

### Database Layer

- MongoDB for users, projects, activity logs, and metadata

### Real-Time Layer

- Liveblocks for collaborative editing and presence

### AI & Processing (Production)

- Convex orchestrates AI suggestions, state, and events
- **Demo version uses mocked/simulated AI behavior**

---

## ⚠️ Limitations of the Demo

To protect intellectual property and ensure safety, the demo has the following limitations:

- ❌ No AI model calls
- ❌ No billing, payments, or subscriptions
- ❌ No real institution, supervisor, or admin workflows
- ❌ No exam, quiz, grading, or result systems
- ❌ Limited collaboration scale and permissions

These limitations are **intentional**.  
They ensure the demo remains lightweight, secure, and suitable for public evaluation.

---

## 🚀 Future Roadmap

The full Docuee platform is designed to scale across institutions and regions.

### Academic Workflows

- Supervisor dashboards & approval pipelines
- Anti-outsourcing & originality checks
- Structured grading and rubric-based evaluation
- Fine-grained submission deadlines and penalties

### AI & Intelligence

- Real AI-powered writing guidance
- Supervisor feedback augmentation
- Plagiarism detection and originality scoring
- Institutional analytics and insights

### Institutional Features

- Exams, quizzes, results, transcripts
- Department and faculty management
- Role-based permissions and audit logs
- Multi-tenant institution support

### Platform & Scale

- Enterprise authentication
- Advanced collaboration & versioning
- Offline support for low-connectivity regions
- Regional compliance and data residency

---

## 🛠 Installation (Local Demo)

```bash
git clone https://github.com/YourUsername/docuee-demo.git
cd docuee-demo
npm install
npm run dev

📄 License

This demo is released under the MIT License.
```
