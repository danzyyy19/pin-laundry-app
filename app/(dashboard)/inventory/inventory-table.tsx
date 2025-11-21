'use client'

import { useState, useMemo } from 'react'
import { Eye, Edit, AlertTriangle, Search } from 'lucide-react'
import Link from 'next/link'

type InventoryItem = {
  id: string
  code: string
  name: string
  unit: string
  stock: number
  minStock: number
}

export default function InventoryTable({ items }: { items: InventoryItem[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const q = searchQuery.toLowerCase()
        return (
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.unit.toLowerCase().includes(q)
        )
      }),
    [items, searchQuery]
  )

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-border">
        <div className="max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari kode, nama item, atau satuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Kode</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Nama Item</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Satuan</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Stok</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {searchQuery
                    ? 'Tidak ada item yang cocok dengan pencarian'
                    : 'Belum ada item inventory'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.stock <= item.minStock
                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{item.code}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm">{item.unit}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.stock} {item.unit}
                    </td>
                    <td className="px-4 py-3">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          Stok Rendah
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/inventory/${item.id}/edit`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
