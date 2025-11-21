import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PesananForm from '../../pesanan-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DeleteOrderButton from '../delete-order-button'

export default async function EditPesananPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
    },
  })

  if (!order) {
    notFound()
  }

  const customers = await prisma.customer.findMany({
    orderBy: {
      name: 'asc',
    },
  })

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
          <h1 className="text-2xl font-bold">Edit Pesanan</h1>
        </div>

        <DeleteOrderButton orderId={order.id} />
      </div>

      <PesananForm customers={customers} order={order} />
    </div>
  )
}
