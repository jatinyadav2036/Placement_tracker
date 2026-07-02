import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TableProperties, FileText, Search,
  MessageSquare, TrendingUp, User, LogOut, Zap,
  ChevronLeft, ChevronRight, Bell
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../hooks/useAuth'
import { signOutUser } from '../../services/auth'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tracker', icon: TableProperties, label: 'Placement Tracker' },
  { path: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { path: '/jd-analyzer', icon: Search, label: 'JD Analyzer' },
  { path: '/insights', icon: TrendingUp, label: 'Insights' },
  // { path: '/chatbot', icon: MessageSquare, label: 'AI Assistant' },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await signOutUser()
    } catch {}
    logout()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden grid-bg">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative flex-shrink-0 bg-gray-900/80 backdrop-blur-xl border-r border-white/8 flex flex-col z-20"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/8 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-neon-blue">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="font-display font-bold text-lg gradient-text whitespace-nowrap">Success Tracker</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  active
                    ? 'bg-brand-500/20 text-white border border-brand-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-brand-400' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div
                    layoutId="nav-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-white/8 space-y-1 flex-shrink-0">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
            title={collapsed ? 'Profile' : undefined}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {user?.full_name?.[0] || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 text-left overflow-hidden"
                >
                  <p className="text-white text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                  <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-white/15 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-brand-500/50 transition-all duration-200 z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
