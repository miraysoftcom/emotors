'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface TestDriveModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productId?: string
}

export function TestDriveModal({ isOpen, onClose, productName = '', productId = '' }: TestDriveModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/requests/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productName,
          productId,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setFormData({ name: '', email: '', phone: '', date: '', message: '' })
        }, 2000)
      }
    } catch (error) {
      console.error('[Test Drive Request Error]', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-drive-title"
            onClick={onClose}
          >
            <div
              className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 p-4 backdrop-blur sm:p-6">
                <h2 id="test-drive-title" className="text-xl font-bold sm:text-2xl">Probefahrt Anfragen</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Probefahrt Formular schliessen"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-xl font-bold mb-2">Anfrage erfolgreich!</h3>
                  <p className="text-muted-foreground">Wir melden uns bald bei Ihnen zur Bestätigung.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Ihr Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">E-Mail</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="ihre@email.ch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Telefon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="+41 61 ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Gewünschtes Datum</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nachricht (optional)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      rows={3}
                      placeholder="Ihre Fragen oder Wünsche..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Wird gesendet...' : 'Anfrage Senden'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
