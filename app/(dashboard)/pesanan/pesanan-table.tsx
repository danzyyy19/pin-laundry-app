'use client'

import { useState, useEffect } from 'react'
import { 
  Eye, 
  Edit, 
  Search, 
  ArrowUpDown, 
  CheckCircle2, 
  DollarSign,
  Trash2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

type Order = {
  id: string
  orderNumber: string
  serviceType: string
  totalPrice: number
  paymentStatus: string
  orderStatus: string
  createdAt: Date
  customer: {
    name: string
    phone: string
  }
}

const statusColors = {
  MENUNGGU_ANTRIAN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  SEDANG_PROSES: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SELESAI: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  MENUNGGU_PENJEMPUTAN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
}

const paymentColors = {
  SUDAH_BAYAR: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  BELUM_BAYAR: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
}

type SortField = 'orderNumber' | 'customer' | 'serviceType' | 'totalPrice' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export default function PesananTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'SEDANG_PROSES')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null)

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ')
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      order.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortField) {
      case 'orderNumber':
        aValue = a.orderNumber
        bValue = b.orderNumber
        break
      case 'customer':
        aValue = a.customer.name
        bValue = b.customer.name
        break
      case 'serviceType':
        aValue = a.serviceType
        bValue = b.serviceType
        break
      case 'totalPrice':
        aValue = a.totalPrice
        bValue = b.totalPrice
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')

      toast.success('Status pesanan berhasil diupdate')
      router.refresh()
      setShowStatusModal(null)
    } catch (error) {
      toast.error('Gagal mengupdate status pesanan')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleUpdatePayment = async (orderId: string, newStatus: string) => {
    setUpdatingPayment(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update payment')

      toast.success('Status pembayaran berhasil diupdate')
      router.refresh()
      setShowPaymentModal(null)
    } catch (error) {
      toast.error('Gagal mengupdate status pembayaran')
    } finally {
      setUpdatingPayment(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete order')

      toast.success('Pesanan berhasil dihapus')
      setShowDeleteModal(null)
      router.refresh()
    } catch (error) {
      toast.error('Gagal menghapus pesanan')
    } finally {
      setDeletingId(null)
    }
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, paymentFilter, searchQuery, rowsPerPage])

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari no. pesanan, customer, layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="all">Semua Status Pesanan</option>
              <option value="MENUNGGU_ANTRIAN">Menunggu Antrian</option>
              <option value="SEDANG_PROSES">Sedang Proses</option>
              <option value="SELESAI">Selesai</option>
              <option value="MENUNGGU_PENJEMPUTAN">Menunggu Penjemputan</option>
            </select>
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="all">Semua Status Pembayaran</option>
              <option value="SUDAH_BAYAR">Sudah Bayar</option>
              <option value="BELUM_BAYAR">Belum Bayar</option>
            </select>
          </div>

          <div>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-border">No</th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center justify-center gap-1 w-full hover:text-foreground"
                  >
                    Tanggal
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('orderNumber')}
                    className="flex items-center justify-center gap-1 w-full hover:text-foreground"
                  >
                    No. Pesanan
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('customer')}
                    className="flex items-center justify-center gap-1 w-full hover:text-foreground"
                  >
                    Customer
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('serviceType')}
                    className="flex items-center justify-center gap-1 w-full hover:text-foreground"
                  >
                    Layanan
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('totalPrice')}
                    className="flex items-center justify-center gap-1 w-full hover:text-foreground"
                  >
                    Total
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  Status Pesanan
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  Status Bayar
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground border-b border-border">
                    {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                      ? 'Tidak ada pesanan yang sesuai dengan filter'
                      : 'Belum ada pesanan'}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm text-center border-b border-border">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3 border-b border-l border-border">
                      <div className="text-sm">
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: id })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), 'HH:mm', { locale: id })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium border-b border-l border-border">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 border-b border-l border-border">
                      <div className="text-sm font-medium">{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-l border-border">
                      {order.serviceType}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium border-b border-l border-border">
                      {formatRupiah(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3 border-b border-l border-border text-center">
                      <button
                        onClick={() => setShowStatusModal(order.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[order.orderStatus as keyof typeof statusColors]
                        } hover:opacity-80 transition-opacity`}
                      >
                        {formatStatus(order.orderStatus)}
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3 border-b border-l border-border text-center">
                      <button
                        onClick={() => setShowPaymentModal(order.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          paymentColors[order.paymentStatus as keyof typeof paymentColors]
                        } hover:opacity-80 transition-opacity`}
                      >
                        {formatStatus(order.paymentStatus)}
                        <DollarSign className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3 border-b border-l border-border">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/pesanan/${order.id}`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/pesanan/${order.id}/edit`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(order.id)}
                          className="p-2 hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {startIndex + 1} - {Math.min(endIndex, sortedOrders.length)} dari{' '}
          {sortedOrders.length} pesanan
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div
          className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4"
          onClick={() => setShowStatusModal(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Update Status Pesanan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pesanan: {orders.find(o => o.id === showStatusModal)?.orderNumber}
            </p>
            <div className="space-y-2">
              {['MENUNGGU_ANTRIAN', 'SEDANG_PROSES', 'MENUNGGU_PENJEMPUTAN', 'SELESAI'].map(status => {
                const currentOrder = orders.find(o => o.id === showStatusModal)
                const isActive = currentOrder?.orderStatus === status
                return (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(showStatusModal, status)}
                    disabled={updatingStatus === showStatusModal}
                    className={`w-full px-4 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    } disabled:opacity-50`}
                  >
                    {formatStatus(status)}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowStatusModal(null)}
              className="w-full mt-4 px-4 py-2 text-sm bg-muted text-foreground hover:bg-muted/80 rounded-md transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Payment Update Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentModal(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Update Status Pembayaran</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pesanan: {orders.find(o => o.id === showPaymentModal)?.orderNumber}
            </p>
            <div className="space-y-2">
              {['BELUM_BAYAR', 'SUDAH_BAYAR'].map(status => {
                const currentOrder = orders.find(o => o.id === showPaymentModal)
                const isActive = currentOrder?.paymentStatus === status
                return (
                  <button
                    key={status}
                    onClick={() => handleUpdatePayment(showPaymentModal, status)}
                    disabled={updatingPayment === showPaymentModal}
                    className={`w-full px-4 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    } disabled:opacity-50`}
                  >
                    {formatStatus(status)}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowPaymentModal(null)}
              className="w-full mt-4 px-4 py-2 text-sm bg-muted text-foreground hover:bg-muted/80 rounded-md transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
            <p className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteOrder(showDeleteModal)}
                disabled={deletingId === showDeleteModal}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === showDeleteModal && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Ya, Hapus
              </button>
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={deletingId === showDeleteModal}
                className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
