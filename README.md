# 🔗 SkillSync — MERN Stack Project

> College students ko skill-based teammates dhundhne ka platform

## 📁 Project Structure (6 Files)

```
skillsync/
├── server.js              ← Backend (Express + MongoDB + JWT + Socket.io)
├── package.json           ← Backend dependencies
├── client/
│   ├── index.html         ← React entry HTML
│   ├── vite.config.js     ← Vite config
│   ├── package.json       ← Frontend dependencies
│   └── src/
│       ├── main.jsx       ← React root mount
│       ├── App.jsx        ← Router + Navbar + Layout
│       ├── pages.jsx      ← ALL pages (Home, Login, Signup, Dashboard, Discover, Connections, Profile, Chat)
│       └── styles.css     ← Full CSS (attractive UI)
```

---

## ⚡ Setup — Step by Step

### 1. MongoDB chalao
MongoDB install karo ya MongoDB Atlas use karo (free hai).

### 2. Backend chalao
```bash
cd skillsync
npm install
node server.js
# Server chalega: http://localhost:5000
```

### 3. Frontend chalao (naya terminal mein)
```bash
cd skillsync/client
npm install
npm run dev
# App chalega: http://localhost:5173
```

---

## 🛠 Tech Stack

| Part       | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js + Plain CSS              |
| Backend    | Node.js + Express.js              |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT + Bcrypt                      |
| Real-time  | Socket.io (chat)                  |

---

## 📄 Pages

| Page        | Features                                      |
|-------------|-----------------------------------------------|
| Home        | Landing page with hero, features, testimonials|
| Signup      | JWT auth, bcrypt password hashing             |
| Login       | JWT token generation                          |
| Dashboard   | Profile %, suggested connections, activity    |
| Discover    | Search by name/skill/college, filter by skill |
| Connections | Incoming/Sent/Friends tabs, accept/decline    |
| Profile     | Edit bio, skills, GitHub, LinkedIn            |
| Chat        | Real-time Socket.io messaging                 |

---

## 🔑 API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (JWT required)

### Users
- `PUT /api/users/profile` — Update profile (JWT required)
- `GET /api/users/discover?search=&skill=` — Discover students

### Connections
- `POST /api/connections/send` — Send request
- `GET /api/connections` — Get all connections
- `PUT /api/connections/:id` — Accept/decline

### Messages
- `GET /api/messages/:userId` — Get chat history

---

## 🌐 Environment Variables (optional)

```env
MONGO_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=your_secret_key
PORT=5000
```

