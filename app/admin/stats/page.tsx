'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Stat {
  id: number
  label: string
  value: number
  suffix: string
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stat[]>([
    { id: 1, label: 'RIDERS WORLDWIDE', value: 15000, suffix: '+' },
    { id: 2, label: 'COUNTRIES', value: 12, suffix: '' },
    { id: 3, label: 'TOP SPEED', value: 350, suffix: 'KM/H' },
    { id: 4, label: 'ACCELERATION', value: 2, suffix: 'SEC' },
  ])

  const [newStat, setNewStat] = useState({ label: '', value: 0, suffix: '' })

  const handleAddStat = () => {
    if (newStat.label && newStat.value >= 0) {
      setStats([...stats, { id: Date.now(), ...newStat }])
      setNewStat({ label: '', value: 0, suffix: '' })
    }
  }

  const handleDeleteStat = (id: number) => {
    setStats(stats.filter((s) => s.id !== id))
  }

  const handleUpdateStat = (id: number, field: string, value: any) => {
    setStats(
      stats.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]: field === 'value' ? parseInt(value) || 0 : value,
            }
          : s
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Link href="/admin" className="hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-widest text-accent">
            Statistics
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add New Stat */}
        <div className="p-8 rounded border border-border bg-card mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-accent mb-6">
            Add New Statistic
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Label"
              value={newStat.label}
              onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
              className="px-4 py-3 bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              placeholder="Value"
              value={newStat.value}
              onChange={(e) => setNewStat({ ...newStat, value: parseInt(e.target.value) || 0 })}
              className="px-4 py-3 bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Suffix (e.g., +, KM/H)"
              value={newStat.suffix}
              onChange={(e) => setNewStat({ ...newStat, suffix: e.target.value })}
              className="px-4 py-3 bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-accent"
            />
            <Button variant="primary" onClick={handleAddStat} className="gap-2">
              <Plus className="w-5 h-5" />
              Add
            </Button>
          </div>
        </div>

        {/* Stats List */}
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.id} className="p-6 rounded border border-border bg-card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleUpdateStat(stat.id, 'label', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => handleUpdateStat(stat.id, 'value', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={stat.suffix}
                    onChange={(e) => handleUpdateStat(stat.id, 'suffix', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <button
                  onClick={() => handleDeleteStat(stat.id)}
                  className="p-3 hover:bg-destructive/10 rounded transition-colors text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-12 p-8 rounded border border-border bg-card">
          <h2 className="text-2xl font-black uppercase tracking-widest text-accent mb-6">
            Preview
          </h2>

          <div className="section-indicator relative -top-6 -right-4">03</div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.id} className="p-6 rounded border border-border/50 hover:border-accent/50">
                <p className="text-4xl font-black text-accent mb-2">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Button variant="primary" size="lg" className="w-full">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
