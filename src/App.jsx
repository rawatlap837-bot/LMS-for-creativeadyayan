import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout.jsx'

import Home from './pages/Home.jsx'
import ShortCourses from './pages/ShortCourses.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

// Auth guards + layouts — lazy loaded (only needed once logged in)
const RequireAuth = lazy(() => import('./auth/RequireAuth.jsx'))
const RequireAdmin = lazy(() => import('./auth/RequireAdmin.jsx'))
const StudentLayout = lazy(() => import('./layouts/StudentLayout.jsx'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'))

// Student pages — lazy loaded
const Dashboard = lazy(() => import('./student/Dashboard.jsx'))
const MyCourses = lazy(() => import('./student/MyCourses.jsx'))
const Progress = lazy(() => import('./student/Progress.jsx'))
const Certificates = lazy(() => import('./student/Certificates.jsx'))
const Payments = lazy(() => import('./student/Payments.jsx'))
const Profile = lazy(() => import('./student/Profile.jsx'))

// Admin pages — lazy loaded
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard.jsx'))
const Students = lazy(() => import('./Admin/Students.jsx'))
const AdminCourses = lazy(() => import('./Admin/Courses.jsx'))
const Lessons = lazy(() => import('./Admin/Lessons.jsx'))
const AdminPayments = lazy(() => import('./Admin/Payments.jsx'))
const Analytics = lazy(() => import('./Admin/Analytics.jsx'))

function App() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ShortCourses" element={<ShortCourses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student dashboard — signed-in users only */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <StudentLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="progress" element={<Progress />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin panel — admins only */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
