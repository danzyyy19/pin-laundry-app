// app/(dashboard)/pesanan/tambah/page.tsx

import { prisma } from '@/lib/prisma'
import PesananForm from '../pesanan-form'

export default async function TambahPesananPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tambah Pesanan Baru</h1>
      <PesananForm customers={customers} />
    </div>
  )
}