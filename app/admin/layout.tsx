import { ReactNode } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="admin-shell">
      <AdminHeader />
      <main className="relative w-full overflow-x-hidden">
        <div className="pointer-events-none fixed inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        {children}
      </main>
    </div>
  )
}
