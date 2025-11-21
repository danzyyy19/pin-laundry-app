// app/(dashboard)/report/report-table.tsx

'use client'

import { format } from 'date-fns'
import { id as locale } from 'date-fns/locale'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Order = {
  id: string
  orderNumber: string
  serviceType: string
  totalPrice: number
  paymentStatus: string
  createdAt: Date
  customer: {
    name: string
  }
}

type Props = {
  orders: Order[]
  filters: any
  totalRevenue: number
  paidRevenue: number
  unpaidRevenue: number
}

export default function ReportTable({ orders, filters, totalRevenue, paidRevenue, unpaidRevenue }: Props) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const generatePDF = () => {
    const doc = new jsPDF()

    // Header with logo and title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PIN LAUNDRY', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Report Penghasilan Laundry', 105, 28, { align: 'center' })
    
    // Date range or filter info
    let filterText = ''
    if (filters.startDate && filters.endDate) {
      filterText = `Periode: ${format(new Date(filters.startDate), 'dd MMM yyyy', { locale })} - ${format(new Date(filters.endDate), 'dd MMM yyyy', { locale })}`
    } else {
      filterText = `Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy', { locale })}`
    }
    
    doc.setFontSize(10)
    doc.text(filterText, 105, 35, { align: 'center' })

    // Summary boxes
    doc.setFillColor(240, 240, 240)
    doc.rect(14, 45, 180, 25, 'F')
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Total Pendapatan:', 20, 53)
    doc.text('Sudah Dibayar:', 20, 60)
    doc.text('Belum Dibayar:', 20, 65)
    
    doc.setFont('helvetica', 'normal')
    doc.text(formatRupiah(totalRevenue), 190, 53, { align: 'right' })
    doc.text(formatRupiah(paidRevenue), 190, 60, { align: 'right' })
    doc.text(formatRupiah(unpaidRevenue), 190, 65, { align: 'right' })

    // Table
    const tableData = orders.map((order) => [
      format(new Date(order.createdAt), 'dd/MM/yyyy', { locale }),
      order.orderNumber,
      order.customer.name,
      order.serviceType,
      formatRupiah(order.totalPrice),
      order.paymentStatus === 'SUDAH_BAYAR' ? 'Sudah Bayar' : 'Belum Bayar'
    ])

    autoTable(doc, {
      startY: 75,
      head: [['Tanggal', 'No. Order', 'Customer', 'Layanan', 'Total', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'center' }
      }
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128)
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    // Save PDF
    const fileName = `report-laundry-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold">Daftar Transaksi</h3>
        <button
          onClick={generatePDF}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Unduh PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium border-b border-border">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">No. Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">Layanan</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium border-b border-l border-border">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground border-b border-border">
                  Tidak ada data untuk ditampilkan
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm border-b border-border">
                    {format(new Date(order.createdAt), 'dd MMM yyyy', { locale })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium border-b border-l border-border">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm border-b border-l border-border">
                    {order.customer.name}
                  </td>
                  <td className="px-4 py-3 text-sm border-b border-l border-border">
                    {order.serviceType}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium border-b border-l border-border">
                    {formatRupiah(order.totalPrice)}
                  </td>
                  <td className="px-4 py-3 border-b border-l border-border">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.paymentStatus === 'SUDAH_BAYAR'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {order.paymentStatus === 'SUDAH_BAYAR' ? 'Sudah Bayar' : 'Belum Bayar'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}