// app/(dashboard)/customer/tambah/page.tsx

import CustomerForm from '../customer-form'

export default function TambahCustomerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tambah Customer Baru</h1>
      <CustomerForm />
    </div>
  )
}