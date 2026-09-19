# Leadyfy OS — UGC Agency Operations Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.x-22c55e)](https://recharts.org/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-Latest-F59E0B)](https://lucide.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Production_Build-Passing-brightgreen)](https://github.com/Yas5584/Leadyfy-OS-UGC-Agency-Operations-Platform)

> **Enterprise-grade B2B SaaS operations management platform** specifically designed for User-Generated Content (UGC) and digital marketing agencies. Built strictly to the **Leadyfy OS Technical & Operational Specification**.

---

## 🔗 Repositories

- **Frontend Repository (This Repo):** [https://github.com/Yas5584/Leadyfy-OS-UGC-Agency-Operations-Platform](https://github.com/Yas5584/Leadyfy-OS-UGC-Agency-Operations-Platform)
- **Backend API Repository:** [https://github.com/Yas5584/Leadyfy-OS-UGC-Agency-Operations-Platform-backend](https://github.com/Yas5584/Leadyfy-OS-UGC-Agency-Operations-Platform-backend)

---

## 📌 Executive Overview

**Leadyfy OS** orchestrates the complete operational lifecycle of modern UGC agencies. It bridges client onboarding, creator matchmaking, scriptwriting, shoot management, video editing, QA checkpoints, billing, and isolated client review into a unified, high-performance workspace.

### Key Highlights
- **End-to-End Workflow:** Lead capture → Client Onboarding → Package/Order → Scripting → Shoot Logistics → Editing → Internal QA → Client Review → Final Delivery.
- **Isolated Client Portal:** Client brands access a zero-leakage portal (`/portal`) where internal creator rates, agency margins, salaries, and employee notes are strictly hidden.
- **Dynamic RBAC Engine:** Full granular access control matrix allowing real-time permission toggling across 16 system modules and 7 roles with instant cross-browser synchronization.
- **Production-Ready B2B Design:** Built with a high-density, professional Charcoal (`#111111`) and Amber (`#F59E0B`) design system.

---

## 🚀 Demo Accounts & Login Credentials

All demo accounts are pre-seeded and ready to use immediately with the common password: **`Demo@123`**.

| Role | Name | Email | Password | Primary Scope |
|------|------|-------|----------|---------------|
| **Owner (Super Admin)** | Rajesh Kumar | `owner@leadyfy.demo` | `Demo@123` | Full unrestricted system access, executive analytics, audit logs |
| **Admin / Ops Manager** | Priya Sharma | `admin@leadyfy.demo` | `Demo@123` | Agency-wide operations, team assignments, package billing |
| **Sales / BD** | Neha Gupta | `sales@leadyfy.demo` | `Demo@123` | Client CRM, order management, onboarding pipelines |
| **Script Writer** | Ankit Verma | `writer@leadyfy.demo` | `Demo@123` | Script pipeline, concept drafting, hook variations |
| **Shoot Manager** | Vikram Singh | `shoot@leadyfy.demo` | `Demo@123` | Creator hub, shoot logistics, equipment & address checklists |
| **Video Editor** | Sneha Patel | `editor@leadyfy.demo` | `Demo@123` | Editor queue workstation, video revisions, asset delivery |
| **Client (Brand Portal)** | Arjun Mehta (Acme) | `client@acme.demo` | `Demo@123` | Isolated client portal, script/video approvals, orders & invoices |

---

## 🖥️ Core Functional Modules

### 1. Operational Dashboard (`/`)
- Real-time KPI summaries: Active Clients, Videos in Production, Pending Approvals, Shoots Scheduled.
- Role-gated financial snapshots for Owner/Admin: Revenue, Operating Expenses, Creator Payouts, Net Margin.
- Interactive Recharts visual analytics: Revenue vs. Expenses monthly pacing, video pipeline distribution, and client growth.
- Quick widget feeds: Today's Shoots, Urgent Tasks, Pending Script Approvals, and Recent Activity logs.

### 2. Client CRM & Brand Profiles (`/clients`, `/clients/:id`)
- Client lifecycle stage tracking (`LEAD`, `ONBOARDING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `INACTIVE`).
- Complete profile management: Brand Name, Industry, Contact Person, Email, Phone, and Assigned Account Manager.
- Client detail drawer/page displaying active packages, associated scripts, video deliverables, and payment ledger.

### 3. Orders & Package Management (`/orders`, `/orders/:id`)
- UGC Package management: Video count quota, pricing tiers, delivery timeline, and fulfillment tracking.
- Client Order Request approval workflow: Clients submit requests from portal; Admins review and convert directly into active orders.
- Financial health tracking: Contract total, amount received, and outstanding milestone balance.

### 4. Script Management Pipeline (`/scripts`)
- Dual-view interface: Interactive **Kanban Pipeline Board** and structured **Table View**.
- 6-Stage script lifecycle: `CONCEPT` → `SCRIPTING` → `INTERNAL_REVIEW` → `CLIENT_REVIEW` → `APPROVED` (or `REVISION_REQUESTED`).
- Word count & reading duration estimators, hook variations, creator briefing notes, and client feedback integration.

### 5. Creator Hub & Roster (`/creators`, `/creators/:id`)
- 15+ creator database filtered by primary platform (Instagram, TikTok, YouTube), content niche, and location.
- Key performance metrics: Follower counts, engagement rates, per-video payout rates, and active assignments.
- Direct shoot scheduling integration with creator availability.

### 6. Shoot Logistics & Production (`/shoots`)
- Comprehensive shoot scheduling with script binding, creator allocation, and shoot date/time.
- Operational checklists: Product receipt verification, location permits, props, and equipment checks.
- Direct status transitions (`SCHEDULED` → `IN_PROGRESS` → `COMPLETED` → `CANCELLED`).

### 7. Video Production Kanban (`/videos`)
- Full 9-Stage Kanban pipeline board:
  - `SCRIPT_APPROVED` → `SHOOT_PENDING` → `RAW_FOOTAGE_RECEIVED` → `VIDEO_EDITING` → `INTERNAL_QA` → `CLIENT_REVIEW` → `REVISION` → `FINAL_APPROVED` → `DELIVERED`
- Smart urgency indicators: Overdue badges (red), due today (amber), due tomorrow (blue).
- Revision counters, editor notes, client timestamped feedback, and one-click status progression.

### 8. Editor Workstation (`/editor-dashboard`)
- Dedicated workspace optimized for video editors.
- Filterable queue of active video tasks sorted by priority and revision status.
- Direct download links for raw assets and instant status advancement to `INTERNAL_QA`.

### 9. Agency Finance & Accounting (`/payments`, `/expenses`, `/creator-payouts`)
- **Client Invoicing (`/payments`):** Milestone tracking, invoice numbering, payment receipts, and payment method logs.
- **Agency Expenses (`/expenses`):** Operational cost ledger with category breakdown (Software, Equipment, Marketing, Office, Legal).
- **Creator Payouts (`/creator-payouts`):** Payout disbursement tracking linked to delivered video milestones.

### 10. Granular RBAC Engine (`/roles-permissions`)
- Interactive permission matrix across 16 system modules and 7 roles.
- Granular CRUD actions: `view`, `create`, `edit`, `delete`, `manage`, `export`.
- Real-time synchronization: Edits are persisted to backend database via `PUT /settings/permissions` and instantly broadcast to all connected layouts via custom window events.

### 11. Isolated Client Portal (`/portal`)
- **Client Dashboard (`/portal`):** Summary of active campaigns, review queue, and delivery statistics.
- **My Orders (`/portal/orders`):** Package progress and custom order intake request form (`/portal/orders/request`).
- **Script Review (`/portal/scripts`):** Read concept drafts, submit inline comments, and approve or request revisions.
- **Video Review Room (`/portal/videos`, `/portal/videos/:id`):** Video preview player, revision request form with specific timestamped feedback, and one-click final approval.
- **Billing & Invoices (`/portal/invoices`):** Transparent milestone ledger showing invoiced amount, amount cleared, and balance due.
- **Support Tickets (`/portal/support`):** Priority-based ticket submission with live agent response tracking.
- **Client Reports & Analytics (`/portal/reports`):** Brand-specific delivery velocity, fulfillment rate progress bars, video status distributions, date filters, and CSV export.

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Module | Resource Key | OWNER | ADMIN | SALES | SCRIPT_WRITER | SHOOT_MANAGER | EDITOR | CLIENT |
|--------|--------------|:-----:|:-----:|:-----:|:-------------:|:-------------:|:------:|:------:|
| Dashboard | `dashboard` | Full | Full | View | View | View | View | View / Custom |
| Client CRM | `clients` | Full | Full | View/Create/Edit | — | — | — | — (Isolated) |
| Orders | `orders` | Full | Full | View/Create/Edit | — | — | — | View/Create |
| Scripts | `scripts` | Full | Full | — | View/Create/Edit | — | — | View/Edit |
| Creators | `creators` | Full | Full | — | — | View/Create/Edit | — | — (Hidden) |
| Shoots | `shoots` | Full | Full | — | — | View/Create/Edit | — | — (Hidden) |
| Videos | `videos` | Full | Full | — | — | — | View/Edit | View/Edit |
| Tasks | `tasks` | Full | Full | View/Create/Edit | View/Create/Edit | View/Create/Edit | View/Create/Edit | — |
| Payments | `payments` | Full | Full | — | — | — | — | View (Own) |
| Expenses | `expenses` | Full | Full | — | — | — | — | — (Hidden) |
| Payouts | `payouts` | Full | Full | — | — | — | — | — (Hidden) |
| Support | `support` | Full | Full | View/Create | — | — | — | View/Create |
| Reports | `reports` | Full | Full | — | — | — | — | View/Export (Own) |
| Roles & Permissions | `employees` | Full | Full | — | — | — | — | — (Hidden) |
| Audit Logs | `activity_logs` | Full | Full | — | — | — | — | — (Hidden) |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend Framework** | React 18 (Hooks, Context API, Suspense) |
| **Build Tool** | Vite 5 (Fast HMR, optimized chunking) |
| **Styling & UI** | Tailwind CSS 3, Custom Scrollbars, Glassmorphism elements |
| **Icons** | Lucide React |
| **Data Visualization** | Recharts (Responsive Bar, Line, Pie & Donut Charts) |
| **Routing** | React Router DOM v6 with Protected Layouts & RBAC Guards |
| **HTTP Client** | Native Fetch Wrapper with Auth Interceptors & Token Management |
| **Backend (Connected)** | Node.js, Express.js, Prisma ORM, PostgreSQL |
| **Deployment** | Vercel (Configured with SPA rewrites in `vercel.json`) |

---

## 📂 Frontend Architecture & Directory Structure

```
client/
├── public/                     # Static brand assets
├── src/
│   ├── components/
│   │   ├── layout/             # Application structural shells
│   │   │   ├── AppLayout.jsx   # Staff layout with reactive sidebar & topnav
│   │   │   ├── PortalLayout.jsx# Client portal layout with RBAC filtering
│   │   │   ├── Sidebar.jsx     # Nav groups with canAccess permission guards
│   │   │   └── TopNav.jsx      # Universal search, notifications, profile
│   │   └── ui/                 # Reusable atomic UI library
│   │       ├── Badge.jsx       # Standard status & tag badges
│   │       ├── Button.jsx      # Variant-driven buttons with loading state
│   │       ├── Card.jsx        # Premium bordered content cards
│   │       ├── DataTable.jsx   # Sortable, searchable data tables
│   │       ├── ErrorBoundary.jsx # Defensive crash recovery boundaries
│   │       ├── KPICard.jsx     # Metric cards with trend indicators
│   │       ├── Modal.jsx       # Accessible keyboard-aware dialogs
│   │       └── StatusBadge.jsx # Unified colored status chips
│   ├── context/
│   │   ├── AuthContext.jsx     # JWT authentication & session management
│   │   └── ToastContext.jsx    # Real-time user alert toasts
│   ├── pages/
│   │   ├── admin/              # Roles & Permissions, Employees, Audit Logs
│   │   ├── auth/               # Split-screen Login page with demo switcher
│   │   ├── clients/            # Client CRM list & detailed profile views
│   │   ├── creators/           # Creator roster & creator profile detail
│   │   ├── dashboard/          # Operations executive dashboard
│   │   ├── editor/             # Dedicated Video Editor queue
│   │   ├── finance/            # Invoices, Expenses, Creator Payouts
│   │   ├── orders/             # Agency order management & request reviews
│   │   ├── portal/             # Isolated Client Portal (Dashboard, Orders,
│   │   │                       #   Scripts, Videos, Invoices, Support, Reports)
│   │   ├── reports/            # Internal agency performance analytics
│   │   ├── scripts/            # Scripting Kanban pipeline & editor
│   │   ├── shoots/             # Production shoot calendar & logistics
│   │   └── videos/             # Video production Kanban board
│   ├── services/
│   │   └── api.js              # Centralized API service layer
│   ├── utils/
│   │   ├── constants.js        # Status colors, enums, pipeline stages
│   │   ├── formatters.js       # Currency (USD/INR), dates, relative time
│   │   └── permissions.js      # RBAC policy engine & server sync
│   ├── App.jsx                 # Route registry with nested layout routes
│   ├── index.css               # Tailwind directives & theme configuration
│   └── main.jsx                # Application root mounting
├── package.json
├── tailwind.config.js
├── vercel.json                 # SPA single-page routing configuration
└── vite.config.js
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Running instance of the **Leadyfy OS Backend** on port `5000` (or configured via environment)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Yas5584/Leadyfy-OS-UGC-Agency-Operations-Platform.git
cd Leadyfy-OS-UGC-Agency-Operations-Platform

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (optional in development; defaults to `/api` proxy or `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build & Verification
To test the production build locally:
```bash
npm run build
npm run preview
```

---

## 🔌 API & Backend Integration

The frontend connects to the Leadyfy OS REST API with automatic JWT bearer authorization, standardized error handling, and response unwrapping:

```javascript
// Base API service example
import api, { orderService, videoService } from './services/api';

// Fetch client-isolated orders
const response = await orderService.getAll();

// Update video status through production Kanban
await videoService.updateStatus(videoId, { status: 'CLIENT_REVIEW' });
```

---

## 🎨 Design System Principles

- **Palette:**
  - **Charcoal Dark:** `#111111` (Sidebar, High-contrast cards)
  - **Amber Accent:** `#F59E0B` (Primary brand accent, interactive elements)
  - **Clean Surface:** `#FFFFFF` / `#F9FAFB` (B2B SaaS high-legibility backgrounds)
- **Typography:** Inter / system-ui, high readability with clear tracking and tabular numeral alignment for financial figures.
- **Defensive Engineering:** Every page and layout is protected by custom `<ErrorBoundary>` components to prevent unhandled UI crashes.

---

## 📄 Submission Checklist Verification

- [x] Full operational UI implemented per PDF specification
- [x] Complete production build passing (`npm run build` exits code 0)
- [x] Production README.md documentation with demo accounts
- [x] Dynamic RBAC permission engine with server persistence
- [x] Client Portal isolated with brand-specific analytics and CSV exports
- [x] Video Production Kanban board with 9 stages and deadline warnings
- [x] Public GitHub Repository ready for evaluation

---

## 👨‍💻 Author & Attribution

Developed by **Yash Sharma** as part of the **Leadyfy OS UGC Agency Operations Platform** technical assessment.

For any questions or support, please open an issue on the repository.
