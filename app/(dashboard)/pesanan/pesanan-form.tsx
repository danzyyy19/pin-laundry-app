'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Search, X } from 'lucide-react'
import Link from 'next/link'
import { serviceCategories } from '@/lib/service-types'
import ReceiptView from './receipt-view'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
}

type Props = {
  customers: Customer[]
  order?: any
}

export default function PesananForm({ customers, order }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [customerId, setCustomerId] = useState(order?.customerId || '')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  
  const [serviceCategory, setServiceCategory] = useState(order?.serviceCategory || '')
  const [serviceType, setServiceType] = useState(order?.serviceType || '')
  const [weight, setWeight] = useState(order?.weight?.toString() || '')
  const [quantity, setQuantity] = useState(order?.quantity?.toString() || '')
  const [otherCosts, setOtherCosts] = useState(order?.otherCosts?.toString() || '0')
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'BELUM_BAYAR')
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || 'MENUNGGU_ANTRIAN')
  const [notes, setNotes] = useState(order?.notes || '')
  
  const [price, setPrice] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [estimatedDays, setEstimatedDays] = useState(0)
  const [createdOrder, setCreatedOrder] = useState<any>(null)

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  )

  // Get selected customer
  const selectedCustomer = customers.find(c => c.id === customerId)

  // Get available services for selected category
  const availableServices = serviceCategories.find(cat => cat.name === serviceCategory)?.services || []

  useEffect(() => {
    if (selectedCustomer && !order) {
      setCustomerSearch(selectedCustomer.name)
    }
  }, [selectedCustomer, order])

  useEffect(() => {
    if (serviceCategory && !order) {
      setServiceType('')
      setWeight('')
      setQuantity('')
    }
  }, [serviceCategory, order])

  useEffect(() => {
    const selectedService = availableServices.find(s => s.name === serviceType)
    if (selectedService) {
      const qty = selectedService.unit === 'kg' ? parseFloat(weight) || 0 : parseFloat(quantity) || 0
      const calculatedPrice = selectedService.pricePerUnit * qty
      const other = parseFloat(otherCosts) || 0
      
      setPrice(calculatedPrice)
      setTotalPrice(calculatedPrice + other)
      setEstimatedDays(selectedService.estimatedDays)
    }
  }, [serviceType, weight, quantity, otherCosts, availableServices])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedService = availableServices.find(s => s.name === serviceType)
      const orderData = {
        customerId,
        serviceCategory,
        serviceType,
        weight: selectedService?.unit === 'kg' ? parseFloat(weight) : null,
        quantity: selectedService?.unit === 'pcs' ? parseFloat(quantity) : null,
        estimatedDays,
        price,
        otherCosts: parseFloat(otherCosts) || 0,
        totalPrice,
        paymentStatus,
        orderStatus,
        notes: notes || null
      }

      const url = order ? `/api/orders/${order.id}` : '/api/orders'
      const method = order ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Failed to save order')

      const result = await response.json()
      
      toast.success(order ? 'Pesanan berhasil diupdate' : 'Pesanan berhasil ditambahkan')
      
      if (!order) {
        setCreatedOrder({ ...result, customer: selectedCustomer })
      } else {
        router.push('/pesanan')
        router.refresh()
      }
    } catch (error) {
      toast.error('Gagal menyimpan pesanan')
    } finally {
      setIsLoading(false)
    }
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const selectedService = availableServices.find(s => s.name === serviceType)

  // Show receipt view if order was just created
  if (createdOrder) {
    return (
      <ReceiptView 
        order={createdOrder} 
        onReset={() => {
          setCreatedOrder(null)
          setCustomerId('')
          setCustomerSearch('')
          setServiceCategory('')
          setServiceType('')
          setWeight('')
          setQuantity('')
          setOtherCosts('0')
          setNotes('')
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <Link
          href="/pesanan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pesanan
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Search */}
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setShowCustomerDropdown(true)
                  if (!e.target.value) setCustomerId('')
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full pl-10 pr-10 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Cari nama atau nomor telepon..."
                required={!customerId}
                disabled={isLoading}
              />
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomerId('')
                    setCustomerSearch('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showCustomerDropdown && customerSearch && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-black text-black dark:text-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setCustomerId(customer.id)
                        setCustomerSearch(customer.name)
                        setShowCustomerDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-b border-border last:border-0"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">{customer.phone}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 text-center bg-white dark:bg-black">
                    Customer tidak ditemukan
                  </div>
                )}
              </div>
            )}

            {selectedCustomer && !showCustomerDropdown && (
              <div className="mt-1 text-xs text-muted-foreground">
                {selectedCustomer.phone} {selectedCustomer.address && `• ${selectedCustomer.address}`}
              </div>
            )}
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Kategori Layanan <span className="text-red-500">*</span>
            </label>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
              disabled={isLoading}
            >
              <option value="">Pilih Kategori</option>
              {serviceCategories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
              disabled={isLoading || !serviceCategory}
            >
              <option value="">Pilih Jenis Layanan</option>
              {availableServices.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.name} - {formatRupiah(service.pricePerUnit)}/{service.unit}
                </option>
              ))}
            </select>
            {!serviceCategory && (
              <p className="text-xs text-muted-foreground mt-1">
                Pilih kategori layanan terlebih dahulu
              </p>
            )}
          </div>

          {/* Weight (for kg unit) */}
          {selectedService?.unit === 'kg' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Berat (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.0"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Quantity (for pcs unit) */}
          {selectedService?.unit === 'pcs' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Jumlah (pcs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Other Costs */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Biaya Lain-lain
            </label>
            <input
              type="number"
              value={otherCosts}
              onChange={(e) => setOtherCosts(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
              disabled={isLoading}
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Status Pembayaran
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="BELUM_BAYAR">Belum Bayar</option>
              <option value="SUDAH_BAYAR">Sudah Bayar</option>
            </select>
          </div>

          {/* Order Status */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Status Pesanan
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="MENUNGGU_ANTRIAN">Menunggu Antrian</option>
              <option value="SEDANG_PROSES">Sedang Proses</option>
              <option value="SELESAI">Selesai</option>
              <option value="MENUNGGU_PENJEMPUTAN">Menunggu Penjemputan</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Catatan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tambahkan catatan pesanan..."
            disabled={isLoading}
          />
        </div>

        {/* Price Summary */}
        {serviceType && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kategori:</span>
              <span className="font-medium">{serviceCategory}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimasi Selesai:</span>
              <span className="font-medium">{estimatedDays} hari</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Harga Layanan:</span>
              <span className="font-medium">{formatRupiah(price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Biaya Lain-lain:</span>
              <span className="font-medium">{formatRupiah(parseFloat(otherCosts) || 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total Bayar:</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !customerId || !serviceCategory || !serviceType}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {order ? 'Update Pesanan' : 'Buat Pesanan'}
          </button>
          <Link
            href="/pesanan"
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
