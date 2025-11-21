// app/(dashboard)/inventory/tambah/page.tsx

import InventoryForm from '../inventory-form'

export default function TambahInventoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tambah Item Inventory</h1>
      <InventoryForm />
    </div>
  )
}