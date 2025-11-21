// app/(dashboard)/inventory/[id]/edit/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import InventoryForm from '../../inventory-form'

export default async function EditInventoryPage({
  params,
}: {
  params: { id: string }
}) {
  const item = await prisma.inventory.findUnique({
    where: { id: params.id }
  })

  if (!item) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Item Inventory</h1>
      <InventoryForm item={item} />
    </div>
  )
}