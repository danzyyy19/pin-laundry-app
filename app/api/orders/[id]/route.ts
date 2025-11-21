// app/api/orders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        customerId: body.customerId,
        serviceType: body.serviceType,
        weight: body.weight,
        quantity: body.quantity,
        estimatedDays: body.estimatedDays,
        price: body.price,
        otherCosts: body.otherCosts,
        totalPrice: body.totalPrice,
        paymentStatus: body.paymentStatus,
        orderStatus: body.orderStatus,
        notes: body.notes,
        completedAt: body.orderStatus === 'SELESAI' ? new Date() : null
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.order.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}