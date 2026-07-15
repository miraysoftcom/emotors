'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

export default function NavigationManagementPage() {
  const [menuItems, setMenuItems] = useState([
    { id: 1, title: 'Home', url: '/', location: 'header', position: 1, active: true },
    { id: 2, title: 'Shop', url: '/produkte', location: 'header', position: 2, active: true },
    { id: 3, title: 'Ohne Führerschein', url: '/produkte?license=ohne', location: 'dropdown', position: 1, parentId: 2, active: true },
    { id: 4, title: 'Mit Führerschein', url: '/produkte?license=mit', location: 'dropdown', position: 2, parentId: 2, active: true },
    { id: 5, title: 'Über uns', url: '/ueber-uns', location: 'header', position: 3, active: true },
    { id: 6, title: 'Kontakt', url: '/contact', location: 'header', position: 4, active: true },
    { id: 7, title: 'AGB', url: '/agb', location: 'footer', position: 1, active: true },
    { id: 8, title: 'Datenschutz', url: '/datenschutz', location: 'footer', position: 2, active: true },
    { id: 9, title: 'Impressum', url: '/impressum', location: 'footer', position: 3, active: true },
    { id: 10, title: 'Ratenzahlung', url: '/ratenzahlung', location: 'footer', position: 4, active: true },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ title: '', url: '', location: 'header', active: true })

  const handleAddItem = () => {
    setEditingId(null)
    setFormData({ title: '', url: '', location: 'header', active: true })
    setShowForm(true)
  }

  const handleEditItem = (item: any) => {
    setFormData({ title: item.title, url: item.url, location: item.location, active: item.active })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (editingId) {
      setMenuItems(menuItems.map(item => item.id === editingId ? { ...item, ...formData } : item))
    } else {
      setMenuItems([...menuItems, { id: Math.max(...menuItems.map(m => m.id), 0) + 1, ...formData, position: 0, parentId: null }])
    }
    setShowForm(false)
  }

  const handleDelete = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  const handleToggleActive = (id: number) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, active: !item.active } : item))
  }

  const headerItems = menuItems.filter(m => m.location === 'header').sort((a, b) => a.position - b.position)
  const dropdownItems = menuItems.filter(m => m.location === 'dropdown').sort((a, b) => a.position - b.position)
  const footerItems = menuItems.filter(m => m.location === 'footer').sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Navigation Management</h1>
        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Neu hinzufügen
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Menüpunkt bearbeiten' : 'Neuer Menüpunkt'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Position</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="header">Header</option>
                <option value="dropdown">Dropdown (Shop)</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="font-medium">Aktiv</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Speichern
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header Menu */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-primary">Header Navigation</h2>
        <div className="space-y-2">
          {headerItems.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
            >
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">{item.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggleActive(item.id)} className="text-yellow-600">
                  {item.active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button onClick={() => handleEditItem(item)} className="text-blue-600">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600">
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dropdown Menu */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-primary">Shop Dropdown</h2>
        <div className="space-y-2">
          {dropdownItems.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
            >
              <div className="flex-1">
                <p className="font-medium">→ {item.title}</p>
                <p className="text-sm text-gray-600">{item.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggleActive(item.id)} className="text-yellow-600">
                  {item.active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button onClick={() => handleEditItem(item)} className="text-blue-600">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600">
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Menu */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-primary">Footer Links</h2>
        <div className="space-y-2">
          {footerItems.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
            >
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">{item.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggleActive(item.id)} className="text-yellow-600">
                  {item.active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button onClick={() => handleEditItem(item)} className="text-blue-600">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600">
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
