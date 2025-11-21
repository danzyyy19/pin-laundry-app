// app/(dashboard)/customer/[id]/edit/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CustomerForm from '../../customer-form'

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id }
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Customer</h1>
      <CustomerForm customer={customer} />
    </div>
  )
}