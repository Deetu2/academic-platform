# Web-Based Academic Collaboration Platform

A complete platform for academic collaboration between lecturers and students with role-based access control, course management, assignments, messaging, and notifications.

## 🎯 Features

### For Lecturers
- Profile management with photo upload
- Course creation (Selective/Compulsory)
- Join code generation per course
- Materials upload (slides/documents)
- Assignment/Project creation with deadlines
- Submission grading with feedback
- Messaging with enrolled students (delivered/seen receipts)
- Notifications for submissions and messages

### For Students
- Lecturer directory browsing
- Course enrollment via join code
- Drop selective courses
- View/download course materials
- Submit assignments with versioning
- Messaging lecturers
- Notifications for assignments, deadlines, grades, messages

### For Admins
- User management
- Course oversight
- Account deactivation

## 🛠 Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (access + refresh tokens)
- **File Uploads:** Multer (local storage)
- **Validation:** Zod
- **Password Hashing:** bcrypt

## 📁 Project Structure

```
academic-platform/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── lecturers/
│   │   │   ├── courses/
│   │   │   ├── enrollments/
│   │   │   ├── materials/
│   │   │   ├── assignments/
│   │   │   ├── submissions/
│   │   │   ├── messages/
│   │   │   └── notifications/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.js
│   ├── prisma/
│   ├── uploads/
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── api/
    │   ├── store/
    │   ├── routes/
    │   └── styles/
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/academic_platform"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"
PORT=5000
```

5. Run Prisma migrations:
```bash
npx prisma migrate dev
```

6. Seed database (optional):
```bash
npm run seed
```

7. Start backend server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

4. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📅 8-Week Development Milestones

### Week 1: Project Setup & Authentication
- [x] Initialize monorepo structure
- [x] Setup backend with Express + Prisma
- [x] Setup frontend with React + Vite + Tailwind
- [x] Implement user registration/login
- [x] JWT authentication (access + refresh tokens)
- [x] Role-based middleware (Lecturer/Student/Admin)

### Week 2: User Management & Profiles
- [x] User profile CRUD operations
- [x] Lecturer profile with photo upload
- [x] Student profile management
- [x] Admin user management panel
- [x] Account status handling (active/deactivated)

### Week 3: Course Management
- [x] Course CRUD operations
- [x] Join code generation
- [x] Course types (Selective/Compulsory)
- [x] Enrollment system
- [x] Drop course logic (selective only)
- [x] Lecturer directory for students

### Week 4: Materials Management
- [x] File upload system (Multer)
- [x] Materials CRUD per course
- [x] Access control (enrolled students only)
- [x] File download endpoints
- [x] Materials listing UI

### Week 5: Assignments & Submissions
- [x] Assignment/Project creation
- [x] Deadline management
- [x] Submission system with versioning
- [x] Late submission detection
- [x] Submission history tracking
- [x] Active version management

### Week 6: Grading System
- [x] Grade submission endpoint
- [x] Feedback text + file upload
- [x] Grade viewing for students
- [x] Grading UI for lecturers
- [x] Submission status tracking

### Week 7: Messaging & Notifications
- [x] Message thread creation
- [x] Send/receive messages
- [x] Delivered/seen receipts
- [x] Notification system
- [x] Notification types (assignment, deadline, grade, message)
- [x] Real-time notification UI

### Week 8: Testing, Polish & Deployment
- [x] API testing (Postman collection)
- [x] Frontend form validation
- [x] Error handling improvements
- [x] UI/UX polish
- [x] Documentation completion
- [x] Deployment preparation

## 🧪 Testing

Import `backend/postman_collection.json` into Postman for comprehensive API testing.

## 🔐 Default Test Accounts (after seeding)

- **Lecturer:** lecturer@test.com / password123
- **Student:** student@test.com / password123
- **Admin:** admin@test.com / password123

## 📝 API Documentation

See `backend/postman_collection.json` for complete API reference.

### Key Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/courses/enroll` - Enroll with join code
- `POST /api/assignments/:id/submissions` - Submit assignment
- `POST /api/messages` - Send message
- `GET /api/notifications` - Get notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Built as a comprehensive academic collaboration platform.

---

**Note:** This is a production-style implementation. All core features are fully implemented with no TODO placeholders.
