import { Link, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Link as LinkIcon, 
  BarChart3, 
  Key, 
  History, 
  User, 
  LogOut,
  TrendingUp,
  Zap,
  Database
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { dashboardApi } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function DashboardNav() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  const navItems = [
    { to: '/dashboard', icon: BarChart3, label: 'Overview', end: true },
    { to: '/dashboard/keys', icon: Key, label: 'API Keys' },
    { to: '/dashboard/requests', icon: History, label: 'Requests' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ]
  
  return (
    <aside className="w-64 bg-gray-900/50 border-r border-gray-800 min-h-screen p-6 hidden lg:block">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <LinkIcon className="w-4 h-4" />
        </div>
        Ogify
      </Link>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center gap-3 px-4 py-3 text-gray-400">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}

function OverviewPage() {
  const { token } = useAuth()
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(token!),
    enabled: !!token,
  })
  
  const { data: history } = useQuery({
    queryKey: ['dashboard-history'],
    queryFn: () => dashboardApi.getHistory(token!, 14),
    enabled: !!token,
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  const statCards = [
    { label: 'Today', value: stats?.data?.requests?.today || 0, icon: Zap, color: 'text-green-400' },
    { label: 'This Week', value: stats?.data?.requests?.week || 0, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'This Month', value: stats?.data?.requests?.month || 0, icon: BarChart3, color: 'text-purple-400' },
    { label: 'Cache Hit Rate', value: stats?.data?.performance?.cacheHitRate || '0%', icon: Database, color: 'text-yellow-400' },
  ]
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Monitor your API usage and performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-6">Request History (14 days)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history?.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Endpoint Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Extract</span>
              <span className="font-medium">{stats?.data?.breakdown?.extract?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Generate</span>
              <span className="font-medium">{stats?.data?.breakdown?.generate?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Avg Latency</span>
              <span className="font-medium">{stats?.data?.performance?.avgLatencyMs || 0}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Cache Hit Rate</span>
              <span className="font-medium">{stats?.data?.performance?.cacheHitRate || '0%'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApiKeysPage() {
  const { token, apiKey: currentKey } = useAuth()
  
  const { data: keys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/keys`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: !!token,
  })
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">API Keys</h1>
        <p className="text-gray-400">Manage your API keys for authentication</p>
      </div>
      
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Your API Key</h2>
          <p className="text-gray-400 text-sm">Use this key in your requests</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm break-all">
          {currentKey || 'No API key found'}
        </div>
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">All Keys</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Key</th>
                <th className="pb-3 pr-4">Rate Limit</th>
                <th className="pb-3">Last Used</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {keys?.data?.map((key: any) => (
                <tr key={key.id} className="border-b border-gray-800">
                  <td className="py-4 pr-4">{key.name}</td>
                  <td className="py-4 pr-4 font-mono text-gray-400">{key.key}</td>
                  <td className="py-4 pr-4">{key.rateLimit}/min</td>
                  <td className="py-4 text-gray-400">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RequestsPage() {
  const { token } = useAuth()
  
  const { data: requests } = useQuery({
    queryKey: ['dashboard-requests'],
    queryFn: () => dashboardApi.getRequests(token!, 50, 0),
    enabled: !!token,
  })
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Request History</h1>
        <p className="text-gray-400">View your recent API requests</p>
      </div>
      
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm bg-gray-800/50">
                <th className="p-4">Endpoint</th>
                <th className="p-4">URL</th>
                <th className="p-4">Status</th>
                <th className="p-4">Latency</th>
                <th className="p-4">Cached</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {requests?.data?.map((req: any) => (
                <tr key={req.id} className="border-t border-gray-800">
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">{req.endpoint}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-gray-400">{req.url || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      req.status < 400 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{req.latencyMs}ms</td>
                  <td className="p-4">
                    {req.cached ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ProfilePage() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account settings</p>
      </div>
      
      <div className="card p-6 max-w-xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <p className="text-lg">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <p className="text-lg">{user?.name || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex">
      <DashboardNav />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/keys" element={<ApiKeysPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}
