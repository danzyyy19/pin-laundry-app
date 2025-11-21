// app/(dashboard)/pesanan/receipt-view.tsx

'use client'

import { useRef } from 'react'
import { format } from 'date-fns'
import { id as locale } from 'date-fns/locale'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type Order = {
  id: string
  orderNumber: string
  serviceCategory: string
  serviceType: string
  weight: number | null
  quantity: number | null
  estimatedDays: number
  price: number
  otherCosts: number
  totalPrice: number
  paymentStatus: string
  orderStatus: string
  notes: string | null
  createdAt: Date
  customer: {
    name: string
    phone: string
    address: string | null
  }
}

export default function ReceiptView({ order, onReset }: { order: Order; onReset: () => void }) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`struk-${order.orderNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handleDownloadPNG = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      })

      const link = document.createElement('a')
      link.download = `struk-${order.orderNumber}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating PNG:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pesanan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pesanan
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
          >
            <Download className="w-4 h-4" />
            PNG
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Pesanan Baru
          </button>
        </div>
      </div>

      {/* Tambah id untuk keperluan print */}
      <div
        id="receipt-print"
        ref={receiptRef}
        className="max-w-md mx-auto bg-white text-black p-8 rounded-lg shadow-lg"
      >
        <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
          {/* Logo */}
          <img
            src="/logo-pin.png"
            alt="PIN Laundry"
            className="mx-auto mb-2 h-16 w-auto"
          />

          <h1 className="text-2xl font-bold">PIN LAUNDRY</h1>
          <p className="text-sm text-gray-600">Jl. Raya Permata Saga Kec. Balaraja (Depan Lion Parcel)</p>
          <p className="text-sm text-gray-600">Telp: 0831 8132 3411</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">No. Pesanan:</span>
            <span className="font-mono font-semibold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tanggal:</span>
            <span>{format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale })}</span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
          <h3 className="font-semibold mb-2">Informasi Customer</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">Nama:</span> {order.customer.name}
            </p>
            <p>
              <span className="text-gray-600">Telp:</span> {order.customer.phone}
            </p>
            {order.customer.address && (
              <p>
                <span className="text-gray-600">Alamat:</span> {order.customer.address}
              </p>
            )}
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
          <h3 className="font-semibold mb-3">Detail Pesanan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Kategori:</span>
              <span>{order.serviceCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Layanan:</span>
              <span>{order.serviceType}</span>
            </div>
            {order.weight && (
              <div className="flex justify-between">
                <span className="text-gray-600">Berat:</span>
                <span>{order.weight} kg</span>
              </div>
            )}
            {order.quantity && (
              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah:</span>
                <span>{order.quantity} pcs</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Estimasi:</span>
              <span>{order.estimatedDays} hari</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Harga Layanan:</span>
              <span>{formatRupiah(order.price)}</span>
            </div>
            {order.otherCosts > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Lain:</span>
                <span>{formatRupiah(order.otherCosts)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2 mt-2">
              <span>TOTAL:</span>
              <span>{formatRupiah(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Status Pesanan:</span>
            <span className="font-semibold">{order.orderStatus.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status Bayar:</span>
            <span className="font-semibold">{order.paymentStatus.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {order.notes && (
          <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
            <p className="text-sm">
              <span className="text-gray-600">Catatan:</span> {order.notes}
            </p>
          </div>
        )}

        <div className="text-center text-xs text-gray-500 border-t-2 border-dashed border-gray-300 pt-4">
          <p>Terima kasih atas kepercayaan Anda</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print,
          #receipt-print * {
            visibility: visible;
          }
          #receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
