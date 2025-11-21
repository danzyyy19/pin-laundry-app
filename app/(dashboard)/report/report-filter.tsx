// app/(dashboard)/report/report-filter.tsx

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Filter, Search, X } from 'lucide-react'

const serviceTypes = [
  'Laundry Kiloan',
  'Cuci Setrika',
  'Setrika Saja',
  'Express Service',
  'Laundry Selimut',
  'Laundry Bedcover',
  'Laundry Karpet Mini',
  'Cuci Baju Bayi'
]

type Customer = {
  id: string
  name: string
  phone: string
}

export default function ReportFilter({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '')
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '')
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [serviceType, setServiceType] = useState(searchParams.get('serviceType') || '')

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  )

  // Get selected customer
  const selectedCustomer = customers.find(c => c.id === customerId)

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (customerId) params.set('customerId', customerId)
    if (serviceType) params.set('serviceType', serviceType)

    router.push(`/report?${params.toString()}`)
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    setCustomerId('')
    setCustomerSearch('')
    setServiceType('')
    router.push('/report')
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Filter Report</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-2">Customer</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value)
                setShowCustomerDropdown(true)
                if (!e.target.value) setCustomerId('')
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="w-full pl-10 pr-8 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Cari customer..."
            />
            {selectedCustomer && !showCustomerDropdown && (
              <button
                onClick={() => {
                  setCustomerId('')
                  setCustomerSearch('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showCustomerDropdown && customerSearch && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCustomers.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerId('')
                      setCustomerSearch('')
                      setShowCustomerDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors border-b border-border"
                  >
                    <div className="font-medium">Semua Customer</div>
                  </button>
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setCustomerId(customer.id)
                        setCustomerSearch(customer.name)
                        setShowCustomerDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors border-b border-border last:border-0"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.phone}</div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  Customer tidak ditemukan
                </div>
              )}
            </div>
          )}
          {selectedCustomer && !showCustomerDropdown && (
            <div className="mt-1 text-xs text-muted-foreground">
              {selectedCustomer.phone}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Jenis Layanan</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Semua Layanan</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Terapkan Filter
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Reset
        </button>
      </div>
    </div>
  )
}