import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout.jsx'
import StudentLayout from './layouts/StudentLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

import Home from './pages/Home.jsx'
import ShortCourses from './pages/ShortCourses.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

import Dashboard from './dashboard/Dashboard.jsx'
import MyCourses from './dashboard/MyCourses.jsx'
import CoursePlayer from './dashboard/CoursePlayer.jsx'
import Progress from './dashboard/Progress.jsx'
import Assignments from './dashboard/Assignments.jsx'
import Certificates from './dashboard/Certificates.jsx'
import Payments from './dashboard/Payments.jsx'
import Profile from './dashboard/Profile.jsx'

import AdminDashboard from './AdminDashBoards/AdminDashboard.jsx'
import Students from './AdminDashBoards/Students.jsx'
import AdminCourses from './AdminDashBoards/Courses.jsx'
import Lessons from './AdminDashBoards/Lessons.jsx'
import AdminPayments from './AdminDashBoards/Payments.jsx'
import Analytics from './AdminDashBoards/Analytics.jsx'

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

      {/* Student dashboard */}
      <Route path="/dashboard" element={<StudentLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="course-player/:courseId" element={<CoursePlayer />} />
        <Route path="progress" element={<Progress />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin panel */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}

export default App