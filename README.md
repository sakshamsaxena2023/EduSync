# MyStudyMatch (EduSync)

MyStudyMatch is a collaborative study platform built using the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS. It features a custom **K-Means Clustering algorithm** implemented in JavaScript to automatically segment and group students into study teams based on their learning patterns and schedules, and provides a Tinder-style matching card hub for direct peer connection requests.

---

## Key Features

1. **Multi-step Onboarding Quiz:** Captures students' tech stacks, coding handles (LeetCode/Codeforces), availability, timings, and learning goals.
2. **"MyStudyMatch" Deck:** An interactive Tinder-style swiping card interface that calculates student compatibility scores using Euclidean distance and allows sending instant "Study Requests".
3. **Smart ML Grouping:** Segment students into optimal clusters ($K$ calculated dynamically based on target group size of 4).
4. **Group Workspace Boards:** Features a shared group discussion board (live chat log) and a collaborative Kanban task board.
5. **Gamification & Sprints:** Reward study groups with points when members complete board tasks or win Group vs. Group study sprints/challenges.
6. **Admin Dashboard:** Control room metrics, user registry inspection, and manual triggers to run the K-Means clustering algorithm.

---

## Directory Layout

```text
📂 MyStudyMatch/
├── 📂 backend/
│   ├── 📂 config/          # MongoDB configuration
│   ├── 📂 controllers/     # Authentication, Match, Group, and Challenge controllers
│   ├── 📂 middleware/      # JWT authorization middleware
│   ├── 📂 models/          # Student/User, StudyGroup, Challenge, and Request schemas
│   ├── 📂 routes/          # API route definitions
│   ├── 📂 utils/           # Custom K-Means clustering algorithm
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/  # Navbars and visual card components
│   │   ├── 📂 context/     # React AuthContext session manager
│   │   ├── 📂 pages/       # Auth, Onboarding, Dashboard, GroupHub, Leaderboards, Admin
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf          # React routing fallback server configuration
│   ├── tailwind.config.js
│   └── package.json
└── docker-compose.yml      # Root multi-container composer
```

---

## Quick Start (Docker Orchestration)

To spin up the database, backend service, and React frontend with a single command, run the following at the project root:

```bash
docker-compose up --build
```

Access the application in your web browser:
* **Frontend Web Client:** `http://localhost:8080`
* **Backend Express API:** `http://localhost:5000`

---

## Local Development (No Docker)

### 1. Database
Make sure you have MongoDB running locally at `mongodb://localhost:27017/mystudymatch`.

### 2. Run Backend Service
```bash
cd backend
npm install
# Setup .env file
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/mystudymatch
# JWT_SECRET=secretkey123
npm run dev
```

### 3. Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
