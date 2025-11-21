// app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOrderNumber() {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const date = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${year}${month}${date}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: body.customerId,
        serviceCategory: body.serviceCategory,
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
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}