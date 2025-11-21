// app/api/inventory/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateInventoryCode(existingCodes: string[]) {
  // Find available code
  for (let i = 1; i <= 9999; i++) {
    const code = `00.00.00.${i.toString().padStart(2, '0')}`
    if (!existingCodes.includes(code)) {
      return code
    }
  }
  // If all used, generate with timestamp
  return `00.00.${Date.now().toString().slice(-6)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get all existing codes
    const existingItems = await prisma.inventory.findMany({
      select: { code: true }
    })
    const existingCodes = existingItems.map(item => item.code)
    
    const code = generateInventoryCode(existingCodes)
    
    const item = await prisma.inventory.create({
      data: {
        code,
        name: body.name,
        unit: body.unit,
        stock: body.stock,
        minStock: body.minStock
      }
    })

    // Create initial movement record
    await prisma.inventoryMovement.create({
      data: {
        inventoryId: item.id,
        type: 'MASUK',
        quantity: body.stock,
        notes: 'Stok awal'
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}