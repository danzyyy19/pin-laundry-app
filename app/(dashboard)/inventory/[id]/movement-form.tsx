// app/(dashboard)/inventory/[id]/movement-form.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function MovementForm({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [type, setType] = useState('MASUK')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/inventory/${itemId}/movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          quantity: parseFloat(quantity),
          notes: notes || null
        })
      })

      if (!response.ok) throw new Error('Failed to add movement')

      toast.success('Mutasi stok berhasil ditambahkan')
      setQuantity('')
      setNotes('')
      router.refresh()
    } catch (error) {
      toast.error('Gagal menambah mutasi stok')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Mutasi Stok</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipe Mutasi
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          >
            <option value="MASUK">Stok Masuk</option>
            <option value="KELUAR">Stok Keluar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Jumlah <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Catatan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tambahkan catatan..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !quantity}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Tambah Mutasi
        </button>
      </form>
    </div>
  )
}