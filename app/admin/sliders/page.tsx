'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Copy, X, Save } from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

interface Slide {
  id: number
  title: string
  headline: string
  subHeadline?: string
  description?: string
  buttonText1?: string
  buttonUrl1?: string
  buttonText2?: string
  buttonUrl2?: string
  backgroundImage?: string
  backgroundVideo?: string
  backgroundYoutube?: string
  backgroundMp4?: string
  productBadge?: string
  priceText?: string
  headlineAnimation: string
  descriptionAnimation: string
  buttonAnimation: string
  animationDuration: number
  textPosition: string
  overlayOpacity: number
  active: boolean
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    title: 'Slide 1',
    headline: 'Elektrische Mobilität der Zukunft',
    subHeadline: 'Premium eMotor & eScooter aus der Schweiz',
    description: 'Entdecke die neuesten Modelle mit innovativer Technologie',
    buttonText1: 'Jetzt entdecken',
    buttonUrl1: '/produkte',
    buttonText2: 'Probefahrt buchen',
    buttonUrl2: '/contact',
    backgroundImage: 'https://images.unsplash.com/photo-1563201487-ce2d45831dce?w=1920&h=1080&fit=crop',
    productBadge: 'Neu 2024',
    priceText: 'Ab CHF 499',
    headlineAnimation: 'slideUp',
    descriptionAnimation: 'slideUp',
    buttonAnimation: 'slideUp',
    animationDuration: 600,
    textPosition: 'center',
    overlayOpacity: 30,
    active: true,
  },
]

export default function SlidersManagement() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Slide>>({})

  const addSlide = () => {
    const newSlide: Slide = {
      id: Math.max(...slides.map(s => s.id), 0) + 1,
      title: `Slide ${slides.length + 1}`,
      headline: 'Neuer Slide',
      headlineAnimation: 'slideUp',
      descriptionAnimation: 'slideUp',
      buttonAnimation: 'slideUp',
      animationDuration: 600,
      textPosition: 'center',
      overlayOpacity: 30,
      active: true,
    }
    setSlides([...slides, newSlide])
    setEditingId(newSlide.id)
    setFormData(newSlide)
    setShowForm(true)
  }

  const editSlide = (slide: Slide) => {
    setEditingId(slide.id)
    setFormData({ ...slide })
    setShowForm(true)
  }

  const saveSlide = () => {
    if (editingId) {
      setSlides(slides.map(s => s.id === editingId ? { ...s, ...formData } as Slide : s))
      setEditingId(null)
      setShowForm(false)
      setFormData({})
    }
  }

  const duplicateSlide = (id: number) => {
    const slide = slides.find(s => s.id === id)
    if (slide) {
      const newSlide = {
        ...slide,
        id: Math.max(...slides.map(s => s.id)) + 1,
        title: `${slide.title} (Kopie)`,
      }
      setSlides([...slides, newSlide])
    }
  }

  const deleteSlide = (id: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter(s => s.id !== id))
    }
  }

  const toggleActive = (id: number) => {
    setSlides(
      slides.map(s =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    )
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({})
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Slider Verwaltung</h1>
          {!showForm && (
            <button
              onClick={addSlide}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              <Plus size={20} />
              Neuer Slide
            </button>
          )}
        </div>

        {/* Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Slide bearbeiten' : 'Neuer Slide'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Titel</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Slide Titel"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Headline</label>
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={e => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Hauptüberschrift"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-blue-400">Unter-Headline</label>
                <input
                  type="text"
                  value={formData.subHeadline || ''}
                  onChange={e => setFormData({ ...formData, subHeadline: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Unterüberschrift"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-blue-400">Beschreibung</label>
                <HtmlEditor
                  value={formData.description || ''}
                  onChange={(description) => setFormData({ ...formData, description })}
                  minHeightClassName="min-h-36"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Button 1 Text</label>
                <input
                  type="text"
                  value={formData.buttonText1 || ''}
                  onChange={e => setFormData({ ...formData, buttonText1: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Text"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Button 1 URL</label>
                <input
                  type="text"
                  value={formData.buttonUrl1 || ''}
                  onChange={e => setFormData({ ...formData, buttonUrl1: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="/link"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Button 2 Text</label>
                <input
                  type="text"
                  value={formData.buttonText2 || ''}
                  onChange={e => setFormData({ ...formData, buttonText2: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Text"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Button 2 URL</label>
                <input
                  type="text"
                  value={formData.buttonUrl2 || ''}
                  onChange={e => setFormData({ ...formData, buttonUrl2: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="/link"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-blue-400">Hintergrund Bild URL</label>
                <input
                  type="text"
                  value={formData.backgroundImage || ''}
                  onChange={e => setFormData({ ...formData, backgroundImage: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Produkt Badge</label>
                <input
                  type="text"
                  value={formData.productBadge || ''}
                  onChange={e => setFormData({ ...formData, productBadge: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="z.B. Neu 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Preis Text</label>
                <input
                  type="text"
                  value={formData.priceText || ''}
                  onChange={e => setFormData({ ...formData, priceText: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ab CHF 499"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Headline Animation</label>
                <select
                  value={formData.headlineAnimation || 'slideUp'}
                  onChange={e => setFormData({ ...formData, headlineAnimation: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="fade">Fade</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="slideLeft">Slide Left</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Text Position</label>
                <select
                  value={formData.textPosition || 'center'}
                  onChange={e => setFormData({ ...formData, textPosition: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="left">Links</option>
                  <option value="center">Mitte</option>
                  <option value="right">Rechts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Animation Dauer (ms)</label>
                <input
                  type="number"
                  value={formData.animationDuration || 600}
                  onChange={e => setFormData({ ...formData, animationDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-blue-400">Overlay Opacity (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.overlayOpacity || 30}
                  onChange={e => setFormData({ ...formData, overlayOpacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active || false}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-bold">Aktiv</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveSlide}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                <Save size={18} />
                Speichern
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                <X size={18} />
                Abbrechen
              </button>
            </div>
          </motion.div>
        )}

        {/* Slides List */}
        <div className="space-y-4">
          {slides.map((slide) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{slide.headline}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${slide.active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                      {slide.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  {slide.subHeadline && (
                    <p className="text-gray-300 mb-2">{slide.subHeadline}</p>
                  )}
                  {slide.description && (
                    <p className="text-gray-400 text-sm mb-3 max-w-2xl">{stripHtml(slide.description)}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Animation:</span>
                      <p className="text-white font-semibold">{slide.headlineAnimation}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Position:</span>
                      <p className="text-white font-semibold">{slide.textPosition}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Dauer:</span>
                      <p className="text-white font-semibold">{slide.animationDuration}ms</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Overlay:</span>
                      <p className="text-white font-semibold">{slide.overlayOpacity}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Buttons:</span>
                      <p className="text-white font-semibold">{slide.buttonText1 && slide.buttonText2 ? '2' : slide.buttonText1 ? '1' : '0'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(slide.id)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                    title={slide.active ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    {slide.active ? '✓' : '○'}
                  </button>
                  <button
                    onClick={() => editSlide(slide)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => duplicateSlide(slide.id)}
                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    disabled={slides.length === 1}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
          <p className="text-blue-200 text-sm">
            💡 Alle Änderungen werden lokal gespeichert. Klicke auf "Bearbeiten" um Details zu ändern, "Duplizieren" um Slides zu kopieren, oder "Löschen" um einen Slide zu entfernen.
          </p>
        </div>
      </div>
    </div>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
