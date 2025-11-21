// app/(dashboard)/customer/[id]/delete-customer-button.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete customer')

      toast.success('Customer berhasil dihapus')
      router.push('/customer')
      router.refresh()
    } catch (error) {
      toast.error('Gagal menghapus customer')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Hapus
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
            <p className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus customer ini? Semua pesanan terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Hapus
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}