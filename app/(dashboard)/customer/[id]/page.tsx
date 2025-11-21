// app/(dashboard)/customer/[id]/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { id as locale } from 'date-fns/locale'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import DeleteCustomerButton from './delete-customer-button'

export default async function DetailCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }
    }
  })

  if (!customer) {
    notFound()
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalOrders = customer.orders.length
  const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalPrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Customer
          </Link>
          <h1 className="text-2xl font-bold">Detail Customer</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/customer/${customer.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <DeleteCustomerButton customerId={customer.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Customer</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Nama</span>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">No. Telepon</span>
                <p className="font-medium">{customer.phone}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Alamat</span>
                <p className="font-medium">{customer.address || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Jenis Kelamin</span>
                <p className="font-medium">{customer.gender}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Bergabung Sejak</span>
                <p className="font-medium">
                  {format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Statistik</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Total Pesanan</span>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Pengeluaran</span>
                <p className="text-2xl font-bold">{formatRupiah(totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Riwayat Pesanan</h2>
            {customer.orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada pesanan</p>
            ) : (
              <div className="space-y-3">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/pesanan/${order.id}`}
                    className="block p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.serviceType}</p>
                      </div>
                      <p className="font-medium">{formatRupiah(order.totalPrice)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.orderStatus === 'SELESAI'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}