// app/(dashboard)/inventory/[id]/movement-history-filter.tsx

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, X } from 'lucide-react'

export default function MovementHistoryFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [showFilter, setShowFilter] = useState(false)
  const [month, setMonth] = useState(searchParams.get('month') || '')
  const [year, setYear] = useState(searchParams.get('year') || '')

  const handleApplyFilter = () => {
    const params = new URLSearchParams()
    if (month && year) {
      params.set('month', month)
      params.set('year', year)
    } else if (year) {
      params.set('year', year)
    }
    
    router.push(`${pathname}?${params.toString()}`)
    setShowFilter(false)
  }

  const handleReset = () => {
    setMonth('')
    setYear('')
    router.push(pathname)
    setShowFilter(false)
  }

  const hasActiveFilter = searchParams.get('month') || searchParams.get('year')

  return (
    <>
      <button
        onClick={() => setShowFilter(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
          hasActiveFilter 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:opacity-90'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filter
        {hasActiveFilter && (
          <span className="w-2 h-2 bg-white rounded-full"></span>
        )}
      </button>

      {showFilter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFilter(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filter Riwayat Mutasi</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="p-1 hover:bg-secondary rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tahun</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Semua Tahun</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bulan</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={!year}
                >
                  <option value="">Semua Bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
                {!year && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Pilih tahun terlebih dahulu
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleApplyFilter}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                >
                  Terapkan
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}