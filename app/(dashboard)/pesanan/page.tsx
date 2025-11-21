// app/(dashboard)/pesanan/page.tsx

import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import PesananTable from './pesanan-table'

export default async function PesananPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const whereCondition = searchParams.status 
    ? { orderStatus: searchParams.status }
    : {}

  const orders = await prisma.order.findMany({
    where: whereCondition,
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <Link
          href="/pesanan/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Tambah Pesanan
        </Link>
      </div>

      <PesananTable orders={orders} />
    </div>
  )
}