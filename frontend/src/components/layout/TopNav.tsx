import { LayoutDashboard, LogOut, PackagePlus, ShoppingBag, User } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-2 text-sm font-medium transition hover:bg-zinc-100',
          isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-700',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export default function TopNav() {
  const me = useAuthStore((s) => s.me)
  const isAuthed = useAuthStore((s) => s.isAuthed())
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="h-5 w-5" />
            校园二手
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/">商品</NavItem>
            {isAuthed ? <NavItem to="/publish">发布</NavItem> : null}
            {isAuthed ? <NavItem to="/orders">订单</NavItem> : null}
            {isAuthed ? <NavItem to="/profile">我的</NavItem> : null}
            {isAuthed && isAdmin ? <NavItem to="/admin">后台</NavItem> : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 md:flex">
                <User className="h-4 w-4" />
                <span className="max-w-[140px] truncate">{me?.nickname ?? '已登录'}</span>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
              >
                <User className="h-4 w-4" />
                登录/注册
              </Link>
              <Link
                to="/admin/login"
                className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 md:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                管理员
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-2 px-4 pb-3 md:hidden">
        <Link
          to="/publish"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          <PackagePlus className="h-4 w-4" />
          发布
        </Link>
        <Link
          to="/orders"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium"
        >
          订单
        </Link>
      </div>
    </header>
  )
}

