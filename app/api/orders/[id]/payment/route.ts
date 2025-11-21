// app/api/orders/[id]/payment/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        paymentStatus: body.paymentStatus,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
  }
}