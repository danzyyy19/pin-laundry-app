// app/api/inventory/[id]/movement/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Get current item
    const item = await prisma.inventory.findUnique({
      where: { id: params.id }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Calculate new stock
    const newStock = body.type === 'MASUK' 
      ? item.stock + body.quantity
      : item.stock - body.quantity

    if (newStock < 0) {
      return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 })
    }

    // Create movement and update stock in transaction
    const [movement] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          inventoryId: params.id,
          type: body.type,
          quantity: body.quantity,
          stockAfter: newStock,
          notes: body.notes
        }
      }),
      prisma.inventory.update({
        where: { id: params.id },
        data: { stock: newStock }
      })
    ])

    return NextResponse.json(movement)
  } catch (error) {
    console.error('Error creating movement:', error)
    return NextResponse.json({ error: 'Failed to create movement' }, { status: 500 })
  }
}