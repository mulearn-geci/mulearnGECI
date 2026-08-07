# µLearn GECI - Official Campus Community Website

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The official website for **µLearn GECI** (Government Engineering College Idukki) — a student-driven tech community fostering peer-to-peer learning, open-source contribution, domain mentorship, and technical innovation.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
- [Admin Portal & Management](#-admin-portal--management)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🌐 Public Portal
- **Hero & Interactive Landing (`/`)**: Engaging overview of community metrics, active interest groups, upcoming events, and call-to-action.
- **Executive Committee & IG Leads (`/execom`)**: Showcase of student leaders, domain leads, and mentors with full social profiles and responsibilities.
- **Alumni Network Directory (`/alumni`)**: Directory celebrating past Execom leads and community graduates working across top tech companies worldwide. Includes interactive **Search** and **Batch Year Filter** popover.
- **Events & Workshops (`/events`)**: Detailed listing of technical bootcamps, hackathons, and workshops with registration capabilities.
- **Photo Gallery (`/gallery`)**: Visual showcase of community events, hackathons, and campus activities.
- **Community Timeline (`/timeline`)**: Interactive milestone tracker detailing the growth of µLearn GECI.
- **Contact & Inquiries (`/contact`)**: Direct communication channel for prospective members and industry partners.
- **Dark Mode Support**: Full light/dark mode theme toggling built with Tailwind CSS.

### 🔐 Admin Control Center (`/admin`)
- **Protected Authentication**: Secure JWT-based admin login (`/admin/login`).
- **Drag-and-Drop Reordering**: Interactive HTML5 drag-and-drop position sorting for **Execom Leads** and **Alumni Members** with real-time backend persistence.
- **Dynamic Content Management (CRUD)**:
  - Add/Edit/Delete Execom & Interest Group Leads.
  - Manage Alumni Directory profiles (Role, Company, Batch, Bio, Domain).
  - Post and manage upcoming events & workshops.
  - Publish news, articles, and community announcements.
- **Media Asset Uploads**: Built-in file upload system powered by Multer with Google Drive image fallback.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Vanilla CSS tokens, responsive layout & dark mode)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose ORM](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing
- **File Uploads**: `multer` image middleware
- **Security**: `helmet`, `cors`, `express-rate-limit`

---

## 📁 Project Architecture

```
mulearnGECI/
├── public/                 # Static assets & favicon
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components (Header, Footer, AdminLayout, etc.)
│   ├── contexts/           # Global React Contexts (AuthContext, ThemeContext)
│   ├── pages/              # Public page views (Home, Execom, Alumni, Events, etc.)
│   │   └── admin/          # Protected Admin panel views (AdminExecom, AdminAlumni, etc.)
│   ├── services/           # Axios API client & endpoint bindings
│   ├── utils/              # Utility helpers (image formatting, Drive extractors)
│   ├── App.tsx             # Main router configuration
│   └── main.tsx            # Application entry point
│
└── server/                 # Backend Node/Express API server
    ├── config/             # Database connection & Atlas configuration
    ├── controllers/        # Route controllers (execomController, alumniController, etc.)
    ├── middleware/         # Auth, upload, and error handling middleware
    ├── models/             # Mongoose database schemas (Execom, Alumni, Event, Post, User)
    ├── routes/             # Express API routes (/api/execom, /api/alumni, /api/auth)
    ├── uploads/            # Server-side uploaded image storage
    └── server.js           # Express server entry point
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.x` or higher
- **MongoDB Atlas Account** (or a local MongoDB server)

---

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mulearn-geci/mulearnGECI.git
   cd mulearnGECI
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

---

### Environment Configuration

1. Create a `.env` file in the **`server`** directory:
   ```bash
   cd server
   cp .env.example .env   # Or create server/.env manually
   ```

2. Add your database URI and secrets to `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mulearn?retryWrites=true&w=majority
   JWT_SECRET=your_secure_jwt_secret_key_here
   JWT_EXPIRE=24h
   ```

---

### Running Locally

You can run both the backend server and frontend development server concurrently:

#### 1. Start the Backend Express Server (Port 5000)
```bash
cd server
npm start
# Output: Server running on port 5000 & MongoDB Connected
```

#### 2. Start the Frontend Development Server (Port 5173)
Open a new terminal window at the project root:
```bash
npm run dev
# Output: VITE v5.4.2 ready at http://localhost:5173/
```

Access the website at **`http://localhost:5173`**.

---

## 🔐 Admin Portal & Management

- **Admin Login Route**: `http://localhost:5173/admin/login`
- **Admin Dashboard**: `http://localhost:5173/admin`
- **Default Seed Admin**: Upon initial server startup with a fresh database, a default admin user is seeded automatically.

### Admin Portals:
| Management Area | Route | Key Functionalities |
|---|---|---|
| **Execom Team** | `/admin/execom` | Drag-and-drop member reordering, CRUD, category assignment (`execom` / `ig_lead`) |
| **Alumni Directory** | `/admin/alumni` | Drag-and-drop ordering, current company/role updates, social link management |
| **Events** | `/admin/events` | Create workshops, hackathons, set event dates & registration links |
| **Posts** | `/admin/posts` | Publish announcements, blogs, and campus updates |

---

## 📡 API Endpoints

### Public Endpoints
- `GET /api/execom` — Fetch Execom members & Interest Group leads
- `GET /api/alumni` — Fetch Alumni directory members
- `GET /api/events` — Fetch community events
- `GET /api/posts` — Fetch published blog posts

### Admin & Protected Endpoints (Requires `Bearer <JWT_TOKEN>`)
- `POST /api/auth/login` — Admin authentication
- `PUT /api/execom/reorder` — Bulk update Execom ordering
- `POST /api/execom` — Create new Execom member
- `PUT /api/execom/:id` — Update Execom member
- `DELETE /api/execom/:id` — Remove Execom member
- `PUT /api/alumni/reorder` — Bulk update Alumni ordering
- `POST /api/alumni` — Add new Alumni profile
- `PUT /api/alumni/:id` — Update Alumni profile
- `DELETE /api/alumni/:id` — Remove Alumni profile

---

## 🤝 Contributing

Contributions are always welcome! If you'd like to improve µLearn GECI:

1. Fork the Repository.
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p center="text-center">
  Crafted with ❤️ by the <b>µLearn GECI Web Team</b> | Government Engineering College Idukki
</p>
