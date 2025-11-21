//src/app/(dashboard)/inventory/stock-movement-modal.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Minus, Loader2, Search, X } from 'lucide-react'

type InventoryItem = {
  id: string
  code: string
  name: string
  unit: string
  stock: number
}

export default function StockMovementModal({ items }: { items: InventoryItem[] }) {
  const router = useRouter()

  const [showModal, setShowModal] = useState(false)
  const [movementType, setMovementType] = useState<'MASUK' | 'KELUAR'>('MASUK')
  const [isLoading, setIsLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedItem = items.find((item) => item.id === selectedItemId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/inventory/${selectedItemId}/movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: movementType,
          quantity: parseFloat(quantity),
          date: new Date(movementDate),
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json()
        throw new Error(errorBody.error || 'Failed to add movement')
      }

      toast.success(`Stok ${movementType.toLowerCase()} berhasil ditambahkan`)
      setShowModal(false)

      resetForm()
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal menambah mutasi stok'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSearchQuery('')
    setSelectedItemId('')
    setQuantity('')
    setNotes('')
    setMovementType('MASUK')
    setMovementDate(new Date().toISOString().split('T')[0])
    setShowItemDropdown(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
      >
        <Plus className="w-4 h-4" />
        Mutasi Stok
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-40 bg-background flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false)
            resetForm()
          }}
        >
          <div
            className="z-50 bg-card border border-border shadow-xl rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Mutasi Stok Inventory</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-1 hover:bg-secondary rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipe Mutasi */}
              <div>
                <label className="text-sm font-medium">Tipe Mutasi *</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('MASUK')}
                    className={`flex gap-2 justify-center px-4 py-3 rounded-md border-2 ${
                      movementType === 'MASUK'
                        ? 'border-green-600 bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-200'
                        : 'border-border bg-card hover:border-green-500'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Stok Masuk
                  </button>

                  <button
                    type="button"
                    onClick={() => setMovementType('KELUAR')}
                    className={`flex gap-2 justify-center px-4 py-3 rounded-md border-2 ${
                      movementType === 'KELUAR'
                        ? 'border-red-600 bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-200'
                        : 'border-border bg-card hover:border-red-500'
                    }`}
                  >
                    <Minus className="w-4 h-4" /> Stok Keluar
                  </button>
                </div>
              </div>

              {/* Search Item */}
              <div className="relative">
                <label className="text-sm font-medium">Cari Item *</label>

                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowItemDropdown(true)
                    }}
                    onFocus={() => setShowItemDropdown(true)}
                    placeholder="Cari kode atau nama item..."
                    className="w-full pl-10 pr-10 py-2 rounded-md bg-background text-foreground border border-input shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />

                  {selectedItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItemId('')
                        setSearchQuery('')
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showItemDropdown && searchQuery && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-background text-foreground border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full px-4 py-3 text-left bg-background hover:bg-muted transition-colors border-b border-border last:border-0"
                          onClick={() => {
                            setSelectedItemId(item.id)
                            setSearchQuery(`${item.code} - ${item.name}`)
                            setShowItemDropdown(false)
                          }}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.code} — Stok: {item.stock} {item.unit}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-muted-foreground bg-background">
                        Item tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Preview item terpilih */}
              {selectedItem && !showItemDropdown && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium">{selectedItem.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Stok: {selectedItem.stock} {selectedItem.unit}
                  </div>
                </div>
              )}

              {/* Jumlah & Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Jumlah *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border bg-card text-foreground border-input rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tanggal *</label>
                  <input
                    type="date"
                    value={movementDate}
                    onChange={(e) => setMovementDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border bg-card text-foreground border-input rounded-md [color-scheme:light] dark:[color-scheme:dark]"
                    style={{ colorScheme: 'inherit' }}
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="text-sm font-medium">Catatan</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-card text-foreground"
                  placeholder="Tambahkan catatan..."
                />
              </div>

              {/* Tombol aksi */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!selectedItemId || !quantity || isLoading}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {movementType === 'MASUK' ? 'Tambah Stok' : 'Kurangi Stok'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
