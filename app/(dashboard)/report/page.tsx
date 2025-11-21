// app/(dashboard)/report/page.tsx

import { prisma } from '@/lib/prisma'
import ReportFilter from './report-filter'
import ReportTable from './report-table'

async function getReportData(filters: {
  startDate?: string
  endDate?: string
  customerId?: string
  serviceType?: string
}) {
  const where: any = {}

  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate + 'T23:59:59')
    }
  }

  if (filters.customerId) {
    where.customerId = filters.customerId
  }

  if (filters.serviceType) {
    where.serviceType = filters.serviceType
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return orders
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: {
    startDate?: string
    endDate?: string
    customerId?: string
    serviceType?: string
  }
}) {
  const orders = await getReportData(searchParams)
  
  const customers = await prisma.customer.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
  const paidRevenue = orders
    .filter(o => o.paymentStatus === 'SUDAH_BAYAR')
    .reduce((sum, order) => sum + order.totalPrice, 0)
  const unpaidRevenue = orders
    .filter(o => o.paymentStatus === 'BELUM_BAYAR')
    .reduce((sum, order) => sum + order.totalPrice, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Report Penghasilan</h1>

      <ReportFilter customers={customers} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm text-muted-foreground mb-2">Total Pendapatan</h3>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(totalRevenue)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm text-muted-foreground mb-2">Sudah Dibayar</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(paidRevenue)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm text-muted-foreground mb-2">Belum Dibayar</h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(unpaidRevenue)}
          </p>
        </div>
      </div>

      <ReportTable 
        orders={orders} 
        filters={searchParams}
        totalRevenue={totalRevenue}
        paidRevenue={paidRevenue}
        unpaidRevenue={unpaidRevenue}
      />
    </div>
  )
}