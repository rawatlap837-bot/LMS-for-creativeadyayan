import { Outlet } from 'react-router-dom'

const StudentLayout = () => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 hidden md:block">
        {/* Student sidebar */}
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default StudentLayout
