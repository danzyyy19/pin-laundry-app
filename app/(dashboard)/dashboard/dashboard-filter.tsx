'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

export default function DashboardFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (type: 'date' | 'month' | 'year', value: string) => {
    const params = new URLSearchParams()

    if (type === 'date') {
      if (!value) return
      params.set('date', value)
    } else if (type === 'month') {
      if (!value) return
      const [year, month] = value.split('-')
      params.set('year', year)
      params.set('month', month)
    } else if (type === 'year') {
      if (!value) return
      params.set('year', value)
    }

    router.push(`/dashboard?${params.toString()}`)
  }

  const handleReset = () => {
    router.push('/dashboard')
  }

  const hasFilter =
    searchParams.get('date') ||
    searchParams.get('month') ||
    searchParams.get('year')

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter per tanggal */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <input
          type="date"
          onChange={(e) => handleFilterChange('date', e.target.value)}
          className="bg-card text-foreground text-sm focus:outline-none border-none [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>

      {/* Filter per bulan */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <input
          type="month"
          onChange={(e) => handleFilterChange('month', e.target.value)}
          className="bg-card text-foreground text-sm focus:outline-none border-none [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>

      {/* Filter per tahun */}
      <select
        onChange={(e) => handleFilterChange('year', e.target.value)}
        className="px-3 py-2 bg-card text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        defaultValue=""
      >
        <option value="">Pilih Tahun</option>
        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
          (year) => (
            <option key={year} value={year}>
              {year}
            </option>
          )
        )}
      </select>

      {/* Tombol reset kalau ada filter aktif */}
      {hasFilter && (
        <button
          onClick={handleReset}
          className="px-3 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  )
}
