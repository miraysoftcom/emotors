'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Trash2, Reply, Archive, Star } from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

interface ContactMessage {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  subject: string
  message: string
  read: boolean
  starred: boolean
  createdAt: string
}

const mockMessages: ContactMessage[] = [
  {
    id: 1,
    firstName: 'Peter',
    lastName: 'Müller',
    email: 'peter@example.com',
    phone: '+41 79 123 4567',
    company: 'TechCorp AG',
    subject: 'Anfrage zu Grossbestellung',
    message:
      'Wir sind interessiert an einer Grossbestellung von 50 Stück. Können Sie uns einen Rabatt anbieten?',
    read: false,
    starred: true,
    createdAt: '2024-01-15 14:30',
  },
  {
    id: 2,
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna@example.com',
    phone: '+41 78 987 6543',
    company: 'Logistics Plus',
    subject: 'Produktspezifikationen',
    message: 'Können Sie mir die genauen Spezifikationen des MK eMotion X zukommen lassen?',
    read: true,
    starred: false,
    createdAt: '2024-01-14 10:15',
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(mockMessages)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRead, setFilterRead] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${msg.firstName} ${msg.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRead =
      filterRead === 'all' ||
      (filterRead === 'unread' && !msg.read) ||
      (filterRead === 'read' && msg.read)

    return matchesSearch && matchesRead
  })

  const unreadCount = messages.filter((m) => !m.read).length

  const toggleStar = (id: number) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, starred: !msg.starred } : msg
      )
    )
  }

  const markAsRead = (id: number) => {
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    )
  }

  const deleteMessage = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Kontaktanfragen</h1>
              <p className="text-slate-600 mt-1">
                Verwalten Sie Kontaktanfragen und Nachrichten
                {unreadCount > 0 && (
                  <span className="ml-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    {unreadCount} ungelesen
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Nach Name, Email oder Betreff suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Nachrichten</option>
              <option value="unread">Ungelesen</option>
              <option value="read">Gelesen</option>
            </select>
          </div>
        </motion.div>

        {/* Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {filteredMessages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => {
                setSelectedMessage(msg)
                markAsRead(msg.id)
              }}
              className={`border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all ${
                msg.read
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50 border-blue-300 font-semibold'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                {/* Sender Info */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStar(msg.id)
                    }}
                    className="mt-1"
                  >
                    <Star
                      size={20}
                      className={
                        msg.starred
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-slate-400'
                      }
                    />
                  </button>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {msg.firstName} {msg.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{msg.company}</p>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <p className="font-semibold text-slate-900 line-clamp-2">
                    {msg.subject}
                  </p>
                </div>

                {/* Contact Info */}
                <div>
                  <p className="text-sm text-slate-600 break-all">{msg.email}</p>
                  <p className="text-sm text-slate-600">{msg.phone}</p>
                </div>

                {/* Message Preview */}
                <div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {msg.message}
                  </p>
                </div>

                {/* Date & Actions */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">{msg.createdAt}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMessage(msg)
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Anzeigen"
                    >
                      <Eye size={18} className="text-slate-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMessage(msg.id)
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 size={18} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600">Keine Nachrichten gefunden</p>
          </motion.div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedMessage(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
                    <p className="text-slate-600 mt-1">
                      Von: {selectedMessage.firstName} {selectedMessage.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    ✕
                  </button>
                </div>

                {/* Contact Info */}
                <div className="bg-slate-100 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Email</p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Telefon</p>
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedMessage.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Unternehmen</p>
                    <p className="text-slate-900">{selectedMessage.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Datum</p>
                    <p className="text-slate-900">{selectedMessage.createdAt}</p>
                  </div>
                </div>

                {/* Message Body */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-900 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Reply Box */}
                <div className="mb-6">
                  <HtmlEditor
                    label="Antwort"
                    value={replyText}
                    onChange={setReplyText}
                    minHeightClassName="min-h-40"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                    <Reply size={18} />
                    Antworten
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-colors">
                    <Archive size={18} />
                    Archivieren
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
