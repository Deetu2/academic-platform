import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SocialSignup from './pages/SocialSignup';
import OAuthCallback from './pages/OAuthCallback';

// Common Pages
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyCourses from './pages/student/MyCourses';
import EnrollCourse from './pages/student/EnrollCourse';
import LecturerDirectory from './pages/student/LecturerDirectory';
import LecturerProfile from './pages/student/LecturerProfile';
import Assignments from './pages/student/Assignments';
import AssignmentDetails from './pages/student/AssignmentDetails';
import SubmitAssignment from './pages/student/SubmitAssignment';
import SubmissionHistory from './pages/student/SubmissionHistory';
import MyGrades from './pages/student/MyGrades';
import SubmissionDetails from './pages/student/SubmissionDetails';
import CourseDetails from './pages/student/CourseDetails';

// Lecturer Pages
import LecturerDashboard from './pages/lecturer/Dashboard';
import LecturerCourses from './pages/lecturer/MyCourses';
import CreateCourse from './pages/lecturer/CreateCourse';
import EditCourse from './pages/lecturer/EditCourse';
import LecturerCourseDetails from './pages/lecturer/CourseDetails';
import CreateAssignment from './pages/lecturer/CreateAssignment';
import GradeSubmissions from './pages/lecturer/GradeSubmissions';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseOversight from './pages/admin/CourseOversight';

import Navbar from './components/Navbar';

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/social-signup" element={<SocialSignup />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Common Authenticated Routes */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <CourseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/enroll"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <EnrollCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lecturers"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <LecturerDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lecturers/:lecturerId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <LecturerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:assignmentId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AssignmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:assignmentId/submit"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SubmitAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/submissions"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SubmissionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:assignmentId/history"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SubmissionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MyGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/submissions/:submissionId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SubmissionDetails />
            </ProtectedRoute>
          }
        />

        {/* Lecturer Routes */}
        <Route
          path="/lecturer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/courses"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <LecturerCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/courses/create"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <CreateCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/courses/:courseId/edit"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <EditCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/courses/:courseId"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <LecturerCourseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/courses/:courseId/assignments/create"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <CreateAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/submissions"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <GradeSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/assignments/:assignmentId/grade"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <GradeSubmissions />
            </ProtectedRoute>
          }
        />

       {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CourseOversight />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;