// app/(dashboard)/customer/customer-form.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
  gender: string
}

type Props = {
  customer?: Customer
}

export default function CustomerForm({ customer }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState<string>(customer?.name ?? '')
  const [phone, setPhone] = useState<string>(customer?.phone ?? '')
  const [address, setAddress] = useState<string>(customer?.address ?? '')
  const [gender, setGender] = useState<string>(customer?.gender ?? 'Laki-laki')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const customerData = {
        name,
        phone,
        address: address || null,
        gender,
      }

      const url = customer ? `/api/customers/${customer.id}` : '/api/customers'
      const method = customer ? ('PUT' as const) : ('POST' as const)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) throw new Error('Failed to save customer')

      toast.success(
        customer ? 'Customer berhasil diupdate' : 'Customer berhasil ditambahkan'
      )
      router.push('/customer')
      router.refresh()
    } catch {
      // kita nggak pakai objek error, jadi nggak usah pakai parameter
      toast.error('Gagal menyimpan customer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <Link
          href="/customer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Customer
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Contoh: Budi Santoso"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              No. Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Contoh: 081234567890"
              required
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Alamat
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Masukkan alamat lengkap..."
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
              disabled={isLoading}
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {customer ? 'Update Customer' : 'Tambah Customer'}
          </button>
          <Link
            href="/customer"
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
