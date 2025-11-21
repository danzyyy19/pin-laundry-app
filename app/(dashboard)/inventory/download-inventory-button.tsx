// app/(dashboard)/inventory/download-inventory-button.tsx

'use client'

import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { id as locale } from 'date-fns/locale'

type InventoryItem = {
  code: string
  name: string
  unit: string
  stock: number
  minStock: number
}

export default function DownloadInventoryButton({ items }: { items: InventoryItem[] }) {
  const handleDownload = () => {
    const csvContent = [
      ['Kode', 'Nama Item', 'Satuan', 'Stok', 'Min Stok', 'Status'],
      ...items.map(item => [
        item.code,
        item.name,
        item.unit,
        item.stock.toString(),
        item.minStock.toString(),
        item.stock <= item.minStock ? 'Stok Rendah' : 'Aman'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
    >
      <Download className="w-4 h-4" />
      Download CSV
    </button>
  )
}