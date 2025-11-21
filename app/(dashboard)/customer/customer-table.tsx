//src/app/(dashboard)/customer/customer-table.tsx
'use client'

import { useState } from 'react'
import { Eye, Edit, Search, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
  gender: string
  monthlyRate: number
}

type SortField = 'name' | 'phone' | 'gender' | 'monthlyRate'
type SortOrder = 'asc' | 'desc'

export default function CustomerTable({ customers }: { customers: Customer[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'phone':
        aValue = a.phone
        bValue = b.phone
        break
      case 'gender':
        aValue = a.gender
        bValue = b.gender
        break
      case 'monthlyRate':
        aValue = a.monthlyRate
        bValue = b.monthlyRate
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, nomor telepon, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium border-b border-border">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Nama
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('phone')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    No. Telepon
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">
                  Alamat
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('gender')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Jenis Kelamin
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">
                  <button
                    onClick={() => handleSort('monthlyRate')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Rate/Bulan
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium border-b border-l border-border">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground border-b border-border"
                  >
                    {searchQuery
                      ? 'Tidak ada customer yang sesuai dengan pencarian'
                      : 'Belum ada customer'}
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium border-b border-border">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-l border-border">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-l border-border">
                      {customer.address || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-l border-border">
                      {customer.gender}
                    </td>
                    <td className="px-4 py-3 border-b border-l border-border">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {customer.monthlyRate}x
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-l border-border">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/customer/${customer.id}`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/customer/${customer.id}/edit`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Menampilkan {sortedCustomers.length} dari {customers.length} customer
      </div>
    </div>
  )
}
