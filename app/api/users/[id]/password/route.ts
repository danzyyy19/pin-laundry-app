// app/api/users/[id]/password/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(body.oldPassword, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(body.newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: params.id },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}