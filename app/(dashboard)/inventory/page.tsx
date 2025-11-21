// app/(dashboard)/inventory/page.tsx

import { prisma } from '@/lib/prisma'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import InventoryTable from './inventory-table'
import StockMovementModal from './stock-movement-modal'
import DownloadInventoryButton from './download-inventory-button'

export default async function InventoryPage() {
  const items = await prisma.inventory.findMany({
    include: {
      movements: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      code: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <StockMovementModal items={items} />
          <DownloadInventoryButton items={items} />
          <Link
            href="/inventory/tambah"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Tambah Item
          </Link>
        </div>
      </div>

      <InventoryTable items={items} />
    </div>
  )
}