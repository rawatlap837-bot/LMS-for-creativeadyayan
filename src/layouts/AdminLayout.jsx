import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 hidden md:block">
        {/* Admin sidebar */}
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
