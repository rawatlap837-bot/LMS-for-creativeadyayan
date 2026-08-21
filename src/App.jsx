import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout.jsx'
import StudentLayout from './layouts/StudentLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

import RequireAuth from './auth/RequireAuth.jsx'
import RequireAdmin from './auth/RequireAdmin.jsx'

import Home from './pages/Home.jsx'
import ShortCourses from './pages/ShortCourses.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

import Dashboard from './Student/Dashboard.jsx'
import MyCourses from './Student/MyCourses.jsx'
import CoursePlayer from './Student/CoursePlayer.jsx'
import Progress from './Student/Progress.jsx'
import Assignments from './Student/Assignments.jsx'
import Certificates from './Student/Certificates.jsx'
import Payments from './Student/Payments.jsx'
import Profile from './Student/Profile.jsx'

import AdminDashboard from "./Admin/AdminDashboard.jsx";
import Students from './Admin/Students.jsx'
import AdminCourses from './Admin/Courses.jsx'
import Lessons from './Admin/Lessons.jsx'
import AdminPayments from './Admin/Payments.jsx'
import Analytics from './Admin/Analytics.jsx'

function App() {
  return (
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
        <Route path="course-player/:courseId" element={<CoursePlayer />} />
        <Route path="progress" element={<Progress />} />
        <Route path="assignments" element={<Assignments />} />
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
  )
}

export default App