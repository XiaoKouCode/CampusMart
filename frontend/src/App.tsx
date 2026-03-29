import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import RequireAdmin from '@/routes/RequireAdmin'
import RequireAuth from '@/routes/RequireAuth'
import Auth from '@/pages/Auth'
import Chat from '@/pages/Chat'
import Home from '@/pages/Home'
import ItemDetail from '@/pages/ItemDetail'
import Orders from '@/pages/Orders'
import Profile from '@/pages/Profile'
import Publish from '@/pages/Publish'
import ResetPassword from '@/pages/ResetPassword'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminLogin from '@/pages/admin/AdminLogin'
import AuthBootstrapper from '@/routes/AuthBootstrapper'

export default function App() {
  return (
    <Router>
      <AuthBootstrapper />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/items/:id" element={<ItemDetail />} />

          <Route element={<RequireAuth />}>
            <Route path="/publish" element={<Publish />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/chat/:peerUserId" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
