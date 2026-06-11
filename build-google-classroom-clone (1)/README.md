# Classroom - A Google Classroom Clone

A full-featured learning management system built with Next.js 16, PostgreSQL, and Drizzle ORM.

## Features

### 🔐 Authentication
- User registration and login
- Session-based authentication with secure cookies
- User profiles with colorful avatars

### 🏫 Class Management
- Create classes as a teacher
- Join classes with a 7-character code
- Themed class cards with auto-generated colors
- Archive classes

### 📢 Stream (Announcements)
- Post announcements to your class
- Comment threads on announcements
- Real-time feel with instant updates

### 📝 Classwork
- Create assignments, quizzes, questions, and materials
- Set points and due dates
- Organize work by topics
- Different icons for each work type

### 👥 People
- View teachers and students in a class
- Remove students (teachers only)
- Leave a class (students)

### 📊 Grades
- **Students**: View all grades in one place with percentage
- **Teachers**: Grade matrix showing all students × all assignments
- Grade submissions with private feedback
- Return assignments to students

### 💬 Comments
- Class comments on announcements
- Class comments on assignments
- Private comments on submissions

---

## 🚀 Running Locally

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+ (running locally or via Docker)
- **npm** or **pnpm**

### Step 1: Clone or Download the Project

```bash
# If you have access to the repo
git clone <repo-url> classroom
cd classroom

# Or download and extract the ZIP
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up PostgreSQL

**Option A: Using Docker (Recommended)**

```bash
docker run --name classroom-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 \
  -d postgres:16
```

**Option B: Local PostgreSQL**

1. Install PostgreSQL on your system
2. Create a database:
```sql
CREATE DATABASE app_db;
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Adjust the connection string if your PostgreSQL credentials are different.

### Step 5: Push Database Schema

```bash
npx drizzle-kit push
```

This will create all necessary tables in your database.

### Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 7: Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication routes
│   │   ├── classes/        # Class management routes
│   │   └── comments/       # Comment routes
│   ├── class/
│   │   └── [classId]/      # Class detail pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── tabs/               # Class tabs (Stream, Classwork, etc.)
│   ├── AuthPage.tsx        # Login/Register form
│   ├── AuthProvider.tsx    # Auth context
│   ├── Avatar.tsx          # User avatar
│   ├── ClassCard.tsx       # Class card component
│   ├── ClassView.tsx       # Class detail view
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Header.tsx          # Navigation header
│   ├── Icons.tsx           # Iconly-inspired icons
│   └── Modal.tsx           # Modal component
├── db/
│   ├── index.ts            # Database connection
│   └── schema.ts           # Drizzle schema
└── lib/
    ├── api.ts              # API helper functions
    └── auth.ts             # Auth utilities
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `sessions` | Authentication sessions |
| `classes` | Classes/courses |
| `enrollments` | User-class relationships |
| `announcements` | Stream posts |
| `topics` | Assignment groupings |
| `assignments` | Assignments, quizzes, materials |
| `submissions` | Student submissions |
| `comments` | Comments on various items |

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npx drizzle-kit push` | Push schema to database |
| `npx drizzle-kit studio` | Open Drizzle Studio GUI |

---

## 🎨 Customization

### Theme Colors

Class theme colors are randomly selected from:
- `#1967D2` (Blue)
- `#1E8E3E` (Green)
- `#E8710A` (Orange)
- `#D93025` (Red)
- `#9334E6` (Purple)
- `#185ABC` (Dark Blue)

You can modify these in `src/app/api/classes/route.ts`.

### Icons

All icons are in `src/components/Icons.tsx` using Iconly-inspired design (rounded, 1.5px stroke). Feel free to add more icons following the same pattern.

---

## 🐛 Troubleshooting

### "Unauthorized" errors after login

Make sure cookies are being sent with requests. The app uses `credentials: "include"` in all API calls.

### Database connection errors

1. Verify PostgreSQL is running
2. Check your `DATABASE_URL` in `.env`
3. Ensure the database exists

### Port 5432 already in use

Another PostgreSQL instance may be running. Stop it or use a different port:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/app_db
```

---

## 📄 License

MIT License - feel free to use this for learning or as a starting point for your own projects.

---

## 🙏 Credits

- **Next.js** - React framework
- **Drizzle ORM** - TypeScript ORM
- **Tailwind CSS** - Utility-first CSS
- **PostgreSQL** - Database
- **Iconly** - Icon design inspiration
