// app/(dashboard)/settings/page.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'
import PasswordForm from './password-form'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileForm user={user} />
        <PasswordForm userId={user.id} />
      </div>
    </div>
  )
}