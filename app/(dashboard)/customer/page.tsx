// app/(dashboard)/customer/page.tsx

import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import CustomerTable from './customer-table'

async function getCustomersWithRate() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return customers.map(customer => ({
    ...customer,
    monthlyRate: customer.orders.length
  }))
}

export default async function CustomerPage() {
  const customers = await getCustomersWithRate()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Customer</h1>
        <Link
          href="/customer/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Tambah Customer
        </Link>
      </div>

      <CustomerTable customers={customers} />
    </div>
  )
}