'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productId?: string
}

export function QuestionModal({ isOpen, onClose, productName = '', productId = '' }: QuestionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'allgemein',
    question: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/requests/question', {
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
          setFormData({ name: '', email: '', phone: '', category: 'allgemein', question: '' })
        }, 2000)
      }
    } catch (error) {
      console.error('[Question Request Error]', error)
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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold">Frage Stellen</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
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
                  <h3 className="text-xl font-bold mb-2">Frage erhalten!</h3>
                  <p className="text-muted-foreground">Wir werden Ihre Frage schnellstmöglich beantworten.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="+41 61 ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Kategorie</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="allgemein">Allgemeine Frage</option>
                      <option value="technisch">Technische Frage</option>
                      <option value="finanzierung">Finanzierung</option>
                      <option value="lieferung">Lieferung & Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ihre Frage</label>
                    <textarea
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      rows={4}
                      placeholder="Ihre Frage oder Anfrage..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Wird gesendet...' : 'Frage Senden'}
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
