import { Metadata } from 'next'
import { PageLayout } from '@/components/layout'
import { AdminGuard } from '@/components/auth/admin-guard'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Message Board',
  description: 'Manage users and messages on the message board',
}

export default function AdminPage() {
  return (
    <PageLayout>
      <AdminGuard>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, messages, and system settings.
            </p>
          </div>

          <AdminDashboard />
        </div>
      </AdminGuard>
    </PageLayout>
  )
}