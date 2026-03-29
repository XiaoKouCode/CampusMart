import { Outlet } from 'react-router-dom'
import TopNav from '@/components/layout/TopNav'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <TopNav />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

