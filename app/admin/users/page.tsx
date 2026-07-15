'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'moderator_admin' | 'editor'
  permissions: string[]
  lastLogin: string
  createdAt: string
  status: 'active' | 'inactive'
}

const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'info@mk-emotorsdornach.ch',
    role: 'super_admin',
    permissions: ['all'],
    lastLogin: '2024-01-15 10:30',
    createdAt: '2023-06-01',
    status: 'active',
  },
  {
    id: '2',
    name: 'Moderator',
    email: 'moderator@mk-emotorsdornach.ch',
    role: 'moderator_admin',
    permissions: ['products', 'orders', 'customers', 'messages'],
    lastLogin: '2024-01-14 15:45',
    createdAt: '2023-08-15',
    status: 'active',
  },
  {
    id: '3',
    name: 'Editor',
    email: 'editor@mk-emotorsdornach.ch',
    role: 'editor',
    permissions: ['website_content', 'images', 'blog', 'faq'],
    lastLogin: '2024-01-10 09:12',
    createdAt: '2023-10-20',
    status: 'active',
  },
]

const roleDescriptions = {
  super_admin:
    'Vollständiger Zugriff auf alle Funktionen, Einstellungen und Benutzer',
  moderator_admin:
    'Zugriff auf Produkte, Bestellungen, Kunden und Nachrichten, aber keine Benutzer-/Sicherheitsverwaltung',
  editor:
    'Kann Website-Inhalte, Bilder, Blog und FAQ verwalten',
}

const permissionLabels: Record<string, string> = {
  all: 'Alle Berechtigungen',
  products: 'Produkte',
  orders: 'Bestellungen',
  customers: 'Kunden',
  messages: 'Nachrichten',
  payments: 'Zahlungen',
  website_content: 'Website-Inhalte',
  images: 'Bilder',
  blog: 'Blog',
  faq: 'FAQ',
  users: 'Benutzerverwaltung',
  settings: 'Einstellungen',
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !filterRole || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      case 'moderator_admin':
        return 'bg-orange-100 text-orange-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'moderator_admin':
        return 'Moderator Admin'
      case 'editor':
        return 'Editor'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Benutzerverwaltung</h1>
              <p className="text-slate-600 mt-1">Verwalten Sie Admin-Benutzer und ihre Rollen</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Plus size={20} />
              Neuer Benutzer
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Nach Name oder Email suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Rollen</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator_admin">Moderator Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {filteredUsers.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                {/* User Info */}
                <div>
                  <h3 className="font-bold text-slate-900">{user.name}</h3>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <div className="mt-2">
                    {user.status === 'active' ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                        Aktiv
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                        Inaktiv
                      </span>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-2">Rolle</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-2">Berechtigungen</p>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 3).map((perm) => (
                      <span
                        key={perm}
                        className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                      >
                        {permissionLabels[perm] || perm}
                      </span>
                    ))}
                    {user.permissions.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        +{user.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Login Info */}
                <div>
                  <p className="text-sm text-slate-600 font-semibold mb-1">Letzte Anmeldung</p>
                  <p className="text-sm text-slate-900">{user.lastLogin}</p>
                  <p className="text-xs text-slate-600">
                    Beigetreten: {new Date(user.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit size={18} className="text-slate-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Löschen"
                  >
                    <Trash2 size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600">Keine Benutzer gefunden</p>
          </motion.div>
        )}

        {/* Role Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {Object.entries(roleDescriptions).map(([role, description]) => (
            <div key={role} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={24} className="text-blue-600" />
                <h3 className="font-bold text-slate-900">
                  {getRoleLabel(role)}
                </h3>
              </div>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Add/Edit User Modal */}
      {(showForm || editingUser) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setShowForm(false)
            setEditingUser(null)
          }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-md w-full p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingUser(null)
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="super_admin">Super Admin</option>
                <option value="moderator_admin">Moderator Admin</option>
                <option value="editor">Editor</option>
              </select>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {editingUser ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
