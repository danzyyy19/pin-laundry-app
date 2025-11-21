// app/api/orders/[id]/status/route.ts

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
        orderStatus: body.orderStatus,
        completedAt: body.orderStatus === 'SELESAI' ? new Date() : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}