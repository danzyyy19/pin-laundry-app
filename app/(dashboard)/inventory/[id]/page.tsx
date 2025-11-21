// app/(dashboard)/inventory/[id]/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { id as locale } from 'date-fns/locale'
import { ArrowLeft, Edit, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import DeleteInventoryButton from './delete-inventory-button'
import MovementForm from './movement-form'
import MovementHistoryFilter from './movement-history-filter'

export default async function DetailInventoryPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: { month?: string; year?: string }
}) {
  // Build filter for movements
  let movementWhere: any = {
    inventoryId: params.id
  }

  if (searchParams.year && searchParams.month) {
    const year = parseInt(searchParams.year)
    const month = parseInt(searchParams.month) - 1
    movementWhere.createdAt = {
      gte: new Date(year, month, 1),
      lt: new Date(year, month + 1, 1)
    }
  } else if (searchParams.year) {
    const year = parseInt(searchParams.year)
    movementWhere.createdAt = {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  const item = await prisma.inventory.findUnique({
    where: { id: params.id },
    include: {
      movements: {
        where: movementWhere,
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!item) {
    notFound()
  }

  // Get all movements for statistics (unfiltered)
  const allMovements = await prisma.inventoryMovement.findMany({
    where: {
      inventoryId: params.id
    }
  })

  const isLowStock = item.stock <= item.minStock

  // Calculate statistics from all movements
  const totalIn = allMovements
    .filter(m => m.type === 'MASUK')
    .reduce((sum, m) => sum + m.quantity, 0)
  
  const totalOut = allMovements
    .filter(m => m.type === 'KELUAR')
    .reduce((sum, m) => sum + m.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Inventory
          </Link>
          <h1 className="text-2xl font-bold">Detail Item</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/inventory/${item.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <DeleteInventoryButton itemId={item.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Item</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Kode Item</span>
                <p className="font-mono font-medium">{item.code}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Nama Item</span>
                <p className="font-medium">{item.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Satuan</span>
                <p className="font-medium">{item.unit}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Stok Saat Ini</span>
                <p className="text-2xl font-bold">{item.stock} {item.unit}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Minimum Stok</span>
                <p className="font-medium">{item.minStock} {item.unit}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                {isLowStock ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Stok Rendah
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Aman
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Statistik</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-muted-foreground">Total Masuk</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {totalIn} {item.unit}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-muted-foreground">Total Keluar</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {totalOut} {item.unit}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="text-sm text-muted-foreground">Total Transaksi</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {allMovements.length}x
                </span>
              </div>
            </div>
          </div>

          <MovementForm itemId={item.id} itemUnit={item.unit} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Riwayat Mutasi Stok</h2>
              <MovementHistoryFilter />
            </div>
            
            {item.movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchParams.month || searchParams.year 
                  ? 'Tidak ada mutasi stok pada periode yang dipilih'
                  : 'Belum ada mutasi stok'
                }
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-center text-sm font-medium border-b border-border">No</th>
                      <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">Tanggal</th>
                      <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">Tipe</th>
                      <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">Jumlah</th>
                      <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">Stok Akhir</th>
                      <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.movements.map((movement, index) => (
                      <tr key={movement.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm text-center border-b border-border">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 border-b border-l border-border">
                          <div className="text-sm">
                            {format(new Date(movement.createdAt), 'dd MMM yyyy', { locale })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(movement.createdAt), 'HH:mm', { locale })}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-l border-border text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            movement.type === 'MASUK'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {movement.type === 'MASUK' ? (
                              <Plus className="w-3 h-3" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                            {movement.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-center border-b border-l border-border">
                          {movement.type === 'MASUK' ? '+' : '-'}{movement.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-center border-b border-l border-border">
                          {movement.stockAfter} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-l border-border">
                          {movement.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {(searchParams.month || searchParams.year) && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Menampilkan {item.movements.length} dari {allMovements.length} total mutasi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}