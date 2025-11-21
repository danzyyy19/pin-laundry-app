// app/(dashboard)/pesanan/[id]/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { id as locale } from 'date-fns/locale'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import DeleteOrderButton from './delete-order-button'
import PrintReceiptButton from './print-receipt-button'

export default async function DetailPesananPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true
    }
  })

  if (!order) {
    notFound()
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/pesanan"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pesanan
          </Link>
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
        </div>
        <div className="flex gap-2">
          <PrintReceiptButton order={order} />
          <Link
            href={`/pesanan/${order.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <DeleteOrderButton orderId={order.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Pesanan</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Pesanan</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Masuk</span>
                <span className="font-medium">
                  {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kategori Layanan</span>
                <span className="font-medium">{order.serviceCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jenis Layanan</span>
                <span className="font-medium">{order.serviceType}</span>
              </div>
              {order.weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Berat</span>
                  <span className="font-medium">{order.weight} kg</span>
                </div>
              )}
              {order.quantity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="font-medium">{order.quantity} pcs</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimasi Selesai</span>
                <span className="font-medium">{order.estimatedDays} hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Pesanan</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.orderStatus as keyof typeof statusColors]}`}>
                  {formatStatus(order.orderStatus)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Pembayaran</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${paymentColors[order.paymentStatus as keyof typeof paymentColors]}`}>
                  {formatStatus(order.paymentStatus)}
                </span>
              </div>
              {order.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Selesai</span>
                  <span className="font-medium">
                    {format(new Date(order.completedAt), 'dd MMMM yyyy, HH:mm', { locale })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Customer</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium">{order.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Telepon</span>
                <span className="font-medium">{order.customer.phone}</span>
              </div>
              {order.customer.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alamat</span>
                  <span className="font-medium text-right">{order.customer.address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jenis Kelamin</span>
                <span className="font-medium">{order.customer.gender}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Catatan</h2>
              <p className="text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Rincian Pembayaran</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga Layanan</span>
                <span className="font-medium">{formatRupiah(order.price)}</span>
              </div>
              {order.otherCosts > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Lain-lain</span>
                  <span className="font-medium">{formatRupiah(order.otherCosts)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Bayar</span>
                  <span>{formatRupiah(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}