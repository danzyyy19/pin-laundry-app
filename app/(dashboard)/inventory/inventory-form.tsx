//src/app/(dashboard)/inventory/inventory-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type InventoryItemForm = {
  id: string
  name: string
  unit: string
  stock: number
  minStock: number
}

type Props = {
  item?: InventoryItemForm
}

export default function InventoryForm({ item }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState<string>(item?.name ?? '')
  const [unit, setUnit] = useState<string>(item?.unit ?? 'botol')
  const [stock, setStock] = useState<string>(item?.stock?.toString() ?? '0')
  const [minStock, setMinStock] = useState<string>(
    item?.minStock?.toString() ?? '10'
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const itemData = {
        name,
        unit,
        stock: parseFloat(stock),
        minStock: parseFloat(minStock),
      }

      const url = item ? `/api/inventory/${item.id}` : '/api/inventory'
      const method = item ? ('PUT' as const) : ('POST' as const)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) throw new Error('Failed to save item')

      toast.success(item ? 'Item berhasil diupdate' : 'Item berhasil ditambahkan')
      router.push('/inventory')
      router.refresh()
    } catch {
      toast.error('Gagal menyimpan item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Inventory
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nama Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Contoh: Pewangi Lavender"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Satuan <span className="text-red-500">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
              disabled={isLoading}
            >
              <option value="botol">Botol</option>
              <option value="liter">Liter</option>
              <option value="kg">Kilogram</option>
              <option value="gram">Gram</option>
              <option value="pcs">Pieces</option>
              <option value="box">Box</option>
              <option value="pack">Pack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stok Awal <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
              required
              disabled={isLoading || !!item}
            />
            {item && (
              <p className="text-xs text-muted-foreground mt-1">
                Stok tidak dapat diubah langsung. Gunakan fitur mutasi stok.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Stok <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="10"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Anda akan diberi notifikasi jika stok mencapai batas ini
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !name}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {item ? 'Update Item' : 'Tambah Item'}
          </button>
          <Link
            href="/inventory"
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
