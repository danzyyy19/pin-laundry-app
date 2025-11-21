//src/app/(dashboard)/dashboard/page.tsx
import { prisma } from '@/lib/prisma'
import {
  Clock,
  Loader,
  CheckCircle2,
  Truck,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Users,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import DashboardFilter from './dashboard-filter'

type DashboardFilterParams = {
  date?: string
  month?: string
  year?: string
}

type DashboardOrder = {
  id: string
  customerId: string
  totalPrice: number
  orderStatus: string
  paymentStatus: string
  createdAt: Date
  customer: {
    id: string
    name: string
    phone: string
  }
}

type DashboardCustomerAgg = {
  customer: DashboardOrder['customer']
  count: number
  total: number
}

async function getDashboardData(filter: DashboardFilterParams) {
  const now = new Date()
  let startDate: Date
  let endDate: Date

  if (filter.date) {
    startDate = new Date(filter.date)
    endDate = new Date(filter.date)
    endDate.setHours(23, 59, 59, 999)
  } else if (filter.month && filter.year) {
    startDate = new Date(parseInt(filter.year, 10), parseInt(filter.month, 10) - 1, 1)
    endDate = new Date(parseInt(filter.year, 10), parseInt(filter.month, 10), 0, 23, 59, 59, 999)
  } else if (filter.year) {
    startDate = new Date(parseInt(filter.year, 10), 0, 1)
    endDate = new Date(parseInt(filter.year, 10), 11, 31, 23, 59, 59, 999)
  } else {
    // DEFAULT: Bulan saat ini
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  const ordersRaw = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      customer: true,
    },
  })

  const orders = ordersRaw as DashboardOrder[]

  // Total customers
  const totalCustomers = await prisma.customer.count()

  // New customers this period
  const newCustomers = await prisma.customer.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  // Low stock items
  const lowStockItems = await prisma.inventory.count({
    where: {
      stock: {
        lte: prisma.inventory.fields.minStock,
      },
    },
  })

  const selesai = orders.filter((o) => o.orderStatus === 'SELESAI').length
  const proses = orders.filter((o) => o.orderStatus === 'SEDANG_PROSES').length
  const antrian = orders.filter((o) => o.orderStatus === 'MENUNGGU_ANTRIAN').length
  const jemputan = orders.filter((o) => o.orderStatus === 'MENUNGGU_PENJEMPUTAN').length

  // ONLY count completed and paid orders for revenue
  const completedAndPaid = orders.filter(
    (o) => o.orderStatus === 'SELESAI' && o.paymentStatus === 'SUDAH_BAYAR'
  )
  const totalSudahBayar = completedAndPaid.reduce((sum, o) => sum + o.totalPrice, 0)

  // Unpaid or incomplete orders
  const belumBayarOrders = orders.filter(
    (o) => o.paymentStatus === 'BELUM_BAYAR' || o.orderStatus !== 'SELESAI'
  )
  const totalBelumBayar = belumBayarOrders.reduce((sum, o) => sum + o.totalPrice, 0)

  const totalPendapatan = totalSudahBayar

  // Average order value
  const avgOrderValue =
    completedAndPaid.length > 0 ? totalSudahBayar / completedAndPaid.length : 0

  // Top customers
  const customerOrders: Record<string, DashboardCustomerAgg> = {}

  for (const order of completedAndPaid) {
    const customerId = order.customerId
    if (!customerOrders[customerId]) {
      customerOrders[customerId] = {
        customer: order.customer,
        count: 0,
        total: 0,
      }
    }
    customerOrders[customerId].count += 1
    customerOrders[customerId].total += order.totalPrice
  }

  const topCustomers = Object.values(customerOrders)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return {
    selesai,
    proses,
    antrian,
    jemputan,
    sudahBayar: completedAndPaid.length,
    belumBayar: belumBayarOrders.length,
    totalSudahBayar,
    totalBelumBayar,
    totalPendapatan,
    totalCustomers,
    newCustomers,
    lowStockItems,
    avgOrderValue,
    topCustomers,
    totalOrders: orders.length,
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { date?: string; month?: string; year?: string }
}) {
  const data = await getDashboardData(searchParams)

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardFilter />
      </div>

      {/* Status Pesanan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/pesanan?status=SELESAI"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold">{data.selesai}</span>
          </div>
          <p className="text-sm text-muted-foreground">Selesai</p>
        </Link>

        <Link
          href="/pesanan?status=SEDANG_PROSES"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <Loader className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold">{data.proses}</span>
          </div>
          <p className="text-sm text-muted-foreground">Sedang Proses</p>
        </Link>

        <Link
          href="/pesanan?status=MENUNGGU_ANTRIAN"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold">{data.antrian}</span>
          </div>
          <p className="text-sm text-muted-foreground">Menunggu Antrian</p>
        </Link>

        <Link
          href="/pesanan?status=MENUNGGU_PENJEMPUTAN"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <Truck className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold">{data.jemputan}</span>
          </div>
          <p className="text-sm text-muted-foreground">Menunggu Penjemputan</p>
        </Link>
      </div>

      {/* Informasi Tambahan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold">{data.totalCustomers}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Customer</p>
          {data.newCustomers > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              +{data.newCustomers} customer baru
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-2xl font-bold">{data.totalOrders}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Pesanan</p>
          <p className="text-xs text-muted-foreground mt-2">
            Rata-rata: {formatRupiah(data.avgOrderValue)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold">{data.lowStockItems}</span>
          </div>
          <p className="text-sm text-muted-foreground">Stok Rendah</p>
          {data.lowStockItems > 0 && (
            <Link
              href="/inventory"
              className="text-xs text-orange-600 dark:text-orange-400 mt-2 hover:underline block"
            >
              Lihat detail →
            </Link>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-lg font-bold">{formatRupiah(data.avgOrderValue)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Rata-rata Order</p>
        </div>
      </div>

      {/* Status Pembayaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Sudah Bayar & Selesai</h3>
            </div>
            <span className="text-2xl font-bold">{data.sudahBayar}</span>
          </div>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {formatRupiah(data.totalSudahBayar)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Belum Bayar / Belum Selesai</h3>
            </div>
            <span className="text-2xl font-bold">{data.belumBayar}</span>
          </div>
          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            {formatRupiah(data.totalBelumBayar)}
          </p>
        </div>
      </div>

      {/* Total Pendapatan */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5" />
          <h3 className="font-semibold">Total Pendapatan (Selesai & Lunas)</h3>
        </div>
        <p className="text-3xl font-bold">{formatRupiah(data.totalPendapatan)}</p>
      </div>

      {/* Top Customers */}
      {data.topCustomers.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Top 5 Customer</h3>
          <div className="space-y-3">
            {data.topCustomers.map((item, index) => (
              <div
                key={item.customer.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{item.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.count} pesanan
                    </p>
                  </div>
                </div>
                <p className="font-semibold">{formatRupiah(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
