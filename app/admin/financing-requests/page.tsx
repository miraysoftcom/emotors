'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle, XCircle, Clock, Eye, Edit, MessageSquare } from 'lucide-react'

interface FinancingRequest {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  productName: string
  purchasePrice: number
  downPayment: number
  requestedDuration: number
  estimatedMonthlyPayment: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  notes: string
}

const mockRequests: FinancingRequest[] = [
  {
    id: 1,
    firstName: 'Peter',
    lastName: 'Keller',
    email: 'peter@example.com',
    phone: '+41 79 555 1234',
    productName: 'MK eMotion X',
    purchasePrice: 4999,
    downPayment: 1000,
    requestedDuration: 24,
    estimatedMonthlyPayment: 166,
    status: 'pending',
    createdAt: '2024-01-12',
    notes: 'Interessiert an 24 Monaten Finanzierung',
  },
  {
    id: 2,
    firstName: 'Lisa',
    lastName: 'Meier',
    email: 'lisa@example.com',
    phone: '+41 78 666 5678',
    productName: 'MK City Go',
    purchasePrice: 3499,
    downPayment: 500,
    requestedDuration: 12,
    estimatedMonthlyPayment: 249,
    status: 'approved',
    createdAt: '2024-01-10',
    notes: 'Antragsstellung bewilligt',
  },
]

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    label: 'Ausstehend',
  },
  approved: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Genehmigt',
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    label: 'Abgelehnt',
  },
  completed: {
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    label: 'Abgeschlossen',
  },
}

export default function FinancingRequestsPage() {
  const [requests, setRequests] = useState<FinancingRequest[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<FinancingRequest | null>(null)

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${req.firstName} ${req.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.productName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !filterStatus || req.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Finanzierungsanfragen</h1>
              <p className="text-slate-600 mt-1">
                Verwalten Sie Finanzierungsanfragen von Kunden
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Nach Name, Email oder Produkt suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Status</option>
              <option value="pending">Ausstehend</option>
              <option value="approved">Genehmigt</option>
              <option value="rejected">Abgelehnt</option>
              <option value="completed">Abgeschlossen</option>
            </select>
          </div>
        </motion.div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {filteredRequests.map((request, idx) => {
            const statusInfo = statusConfig[request.status]
            const StatusIcon = statusInfo.icon

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedRequest(request)}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {request.firstName} {request.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">{request.email}</p>
                    <p className="text-sm text-slate-600">{request.phone}</p>
                  </div>

                  {/* Product Info */}
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Produkt</p>
                    <p className="font-medium text-slate-900">{request.productName}</p>
                    <p className="text-sm text-slate-600">
                      Kaufpreis: CHF {request.purchasePrice}
                    </p>
                  </div>

                  {/* Financing Info */}
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Finanzierung</p>
                    <p className="font-medium text-slate-900">
                      CHF {request.estimatedMonthlyPayment}/Monat
                    </p>
                    <p className="text-sm text-slate-600">
                      {request.requestedDuration} Monate, Anzahlung: CHF {request.downPayment}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">Status</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                      <StatusIcon size={16} />
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRequest(request)
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Anzeigen"
                    >
                      <Eye size={18} className="text-slate-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit size={18} className="text-slate-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Nachricht"
                    >
                      <MessageSquare size={18} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600">Keine Finanzierungsanfragen gefunden</p>
          </motion.div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedRequest(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Anfrage Details</h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Kunde</p>
                    <p className="font-medium text-slate-900">
                      {selectedRequest.firstName} {selectedRequest.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{selectedRequest.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Produkt</p>
                    <p className="font-medium text-slate-900">{selectedRequest.productName}</p>
                    <p className="text-sm text-slate-600">
                      Kaufpreis: CHF {selectedRequest.purchasePrice}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Monatliche Zahlung</p>
                    <p className="text-2xl font-bold text-blue-600">
                      CHF {selectedRequest.estimatedMonthlyPayment}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-1">Laufzeit</p>
                    <p className="font-medium text-slate-900">
                      {selectedRequest.requestedDuration} Monate
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-slate-100 rounded-lg">
                  <p className="text-sm text-slate-600 font-semibold mb-2">Notizen</p>
                  <p className="text-slate-900">{selectedRequest.notes}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                    Genehmigen
                  </button>
                  <button className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                    Ablehnen
                  </button>
                  <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                    Email senden
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
