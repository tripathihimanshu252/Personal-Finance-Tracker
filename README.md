# 💰 Personal-Finance-Tracker (Enterprise Grade MERN Stack)

A highly scalable, secure, and production-ready Personal Finance Management Application built using the **MERN Stack**, **PostgreSQL (Sequelize ORM)**, and **Redis In-Memory Caching**. 

The architecture strictly adheres to enterprise standards implementing **Role-Based Access Control (RBAC)**, precise **Database-Level Data Isolation**, and **Automated Cache Invalidation Hooks** to optimize API performance and eliminate stale data.

---

## 🏗️ System Architecture & Data Flow

The application follows a decoupled client-server pattern. To maximize throughput and guarantee sub-millisecond response times for heavy analytical dashboards, an advanced Redis caching layer sits seamlessly between the Express API controllers and the PostgreSQL cluster.
┌─────────────────┐       HTTP / JSON        ┌──────────────────────┐
│  React Frontend  │ ──────────────────────> │  ExpressJS Backend   │
│  (Vite + Axios)  │ <────────────────────── │     (Node.js REST)   │
└─────────────────┘                          └──────────────────────┘
│              │
Cache Hit / Miss      │              │ DB Operations
(analytics:userId)    ▼              ▼ (Sequelize ORM)
┌───────┐      ┌──────────────┐
│ Redis │      │  PostgreSQL  │
│ Cache │      │   Database   │
└───────┘      └──────────────┘
### Detailed Execution Flow:
1. **Authentication:** The user logs in via JWT. The payload carries structural tenant metadata like `userId` and `role`.
2. **Dashboard Fetching:** The client dispatches a `GET /api/analytics` request. 
3. **Cache Verification:** The backend constructs a user-specific dynamic cache string: `analytics:${userId}`. If a cache entry exists (**Cache Hit**), the JSON payload returns immediately with the indicator `{ source: 'cache' }`.
4. **Database Fetching:** If missing (**Cache Miss**), complex aggregate SQL calls (`SUM` and `GROUP BY`) calculate financial totals. Results populate Redis with a strictly configured 15-minute Time-To-Live (`setEx(key, 900)`), returning `{ source: 'database' }`.
5. **Smart Cache Invalidation:** When any CRUD operation occurs via `POST`, `PUT`, or `DELETE` on transactions, a targeted cache-flush hook intercepts the request and purges *only* that specific user's Redis key (`redisClient.del(analytics:${userId})`). This guarantees instantaneous synchronization.

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

Security enforcement is hardcoded at both Frontend Conditional Rendering routes and Backend Middleware authorization checks.

| Feature / Permission | Admin 👑 | User 👤 | Read-Only 📖 |
| :--- | :---: | :---: | :---: |
| **Add New Transactions (C)** | ✅ Full Access | ✅ Personal Only | ❌ Completely Blocked |
| **Modify/Delete Transactions (UD)** | ✅ System-Wide | ✅ Personal Only | ❌ Buttons Completely Hidden |
| **View Financial Dashboard (R)** | ✅ Global Analytics | ✅ Dynamic Personal | ✅ Isolated View-Only |
| **Multi-Tenant Data Privacy** | Sees all user records | Strict personal isolation | Strict personal isolation |

---

## 🛠️ Tech Stack & Optimization Engineering

* **Frontend:** React.js, TailwindCSS (for high-end atomic styling), Lucide React (Icons), and **Recharts** (Interactive SVG Data Visualizations).
* **Backend:** Node.js, Express.js (REST API Architecture).
* **Database:** PostgreSQL (Relational Integrity, Indexing on Foreign Keys) with **Sequelize ORM** for abstract query building.
* **In-Memory Store:** **Redis** (Advanced Caching Server running on Native Clusters).
* **Security & Auth:** JSON Web Tokens (JWT) for stateless sessions and cryptographic Password Hashing.

### Performance Optimizations Implemented:
* **React `useMemo` Optimization:** Client-side financial analytics calculations are memoized to completely avoid useless browser re-renders on structural UI shifts.
* **React `useCallback` Wrapper:** API fetch configurations are bound within stable component footprints to optimize DOM update lifecycles.
* **Database Pagination:** Lazy loading parameters (`limit` and `offset`) throttle high-volume transaction arrays, keeping network payloads feather-light.

---

## 🚀 Installation & Local Environment Setup

Ensure you have **Node.js**, **PostgreSQL**, and **Redis Server** installed and running locally on your environment.

### 1. Clone the Architecture
```bash
git clone [https://github.com/tripathihimanshu252/Personal-Finance-Tracker.git](https://github.com/tripathihimanshu252/Personal-Finance-Tracker.git)
cd Personal-Finance-Tracker
2. Configure Environment Configurations (.env)
Create a .env file in your server directory:

Code snippet
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/finance_db
REDIS_URL=redis://localhost:6373
JWT_SECRET=your_ultra_secure_jwt_cryptographic_key
3. Initialize Backend Server
Bash
cd backend
npm install
npm run dev   # Runs on local configuration ports
4. Initialize Client Dashboard
Bash
cd ../frontend
npm install
npm run dev   # Boots Vite local multi-threaded ecosystem
🧪 Verified Production Testing Profiles
Use these isolated verification setups to demo systemic RBAC functionality:

User Profile (Full Interactive Client Control):

Email: himanshu.user2026@gmail.com

Capabilities: Full UI rendering of the "Add Transaction" engine, real-time aggregate totals calculation, automated pipeline caching with cache invalidation triggers.

Admin Profile (Global Management Overlook):

Email: ramesh.test2026@gmail.com

Capabilities: Full transactional visibility bypassing specific user boundaries.

Read-Only Profile (Strict View-Only Restrictions):

Capabilities: Entire input form and mutation control buttons (🗑️ / Save) are dynamically extracted from the DOM footprint based on secure auth context states.


---

### 🛠️ Step 3: Terminal Me Yeh Final Commands Chala Do

Ab badle hue code ko online bhejne ke liye apne terminal me ye lines run kar do:

```bash
git add README.md
git commit -m "docs: restored and updated stunning enterprise markdown design"
git push origin main