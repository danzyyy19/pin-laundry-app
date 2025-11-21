// lib/service-types.ts

export type ServiceCategory = {
  name: string
  services: ServiceType[]
}

export type ServiceType = {
  name: string
  pricePerUnit: number
  unit: string
  estimatedDays: number
}

export const serviceCategories: ServiceCategory[] = [
  {
    name: 'Kiloan',
    services: [
      { name: 'Cuci Setrika', pricePerUnit: 6000, unit: 'kg', estimatedDays: 3 },
      { name: 'REGULER (cuci setrika)', pricePerUnit: 7000, unit: 'kg', estimatedDays: 3 },
      { name: 'EXPRESS (cuci setrika)', pricePerUnit: 9000, unit: 'kg', estimatedDays: 1 },
      { name: 'Cuci Lipat', pricePerUnit: 5000, unit: 'kg', estimatedDays: 3 },
      { name: 'Setrika', pricePerUnit: 4000, unit: 'kg', estimatedDays: 2 },
      { name: 'REGULER (setrika)', pricePerUnit: 6000, unit: 'kg', estimatedDays: 2 },
      { name: 'EXPRESS (setrika)', pricePerUnit: 8000, unit: 'kg', estimatedDays: 1 },
    ]
  },
  {
    name: 'Bed Cover',
    services: [
      { name: 'Bed cover besar', pricePerUnit: 35000, unit: 'pcs', estimatedDays: 4 },
      { name: 'Bed cover only', pricePerUnit: 25000, unit: 'pcs', estimatedDays: 4 },
      { name: 'Bed cover Set', pricePerUnit: 35000, unit: 'pcs', estimatedDays: 4 },
    ]
  },
  {
    name: 'Sprei & Sprei Rumbai',
    services: [
      { name: 'Sprei Set Besar', pricePerUnit: 15000, unit: 'pcs', estimatedDays: 4 },
      { name: 'Sprei Set Sedang', pricePerUnit: 13000, unit: 'pcs', estimatedDays: 4 },
      { name: 'Sprei Set Kecil', pricePerUnit: 11000, unit: 'pcs', estimatedDays: 3 },
      { name: 'Sprei only Besar', pricePerUnit: 10000, unit: 'pcs', estimatedDays: 3 },
      { name: 'Sprei only Sedang', pricePerUnit: 6000, unit: 'pcs', estimatedDays: 3 },
      { name: 'Sprei only Kecil', pricePerUnit: 3000, unit: 'pcs', estimatedDays: 3 },
      { name: 'Besar (rumbai)', pricePerUnit: 15000, unit: 'pcs', estimatedDays: 5 },
      { name: 'Sedang (rumbai)', pricePerUnit: 10000, unit: 'pcs', estimatedDays: 4 },
      { name: 'Kecil (rumbai)', pricePerUnit: 5000, unit: 'pcs', estimatedDays: 3 },
    ]
  },
  {
    name: 'Satuan',
    services: [
      { name: 'Selimut (Kecil)', pricePerUnit: 5000, unit: 'pcs', estimatedDays: 3 },
      { name: 'Selimut (Sedang)', pricePerUnit: 10000, unit: 'pcs', estimatedDays: 3 },
      { name: 'Selimut (Besar)', pricePerUnit: 15000, unit: 'pcs', estimatedDays: 4 },
      { name: 'Handuk (Kecil)', pricePerUnit: 5000, unit: 'pcs', estimatedDays: 2 },
      { name: 'Handuk (Besar)', pricePerUnit: 10000, unit: 'pcs', estimatedDays: 2 },
      { name: 'Jas', pricePerUnit: 25000, unit: 'pcs', estimatedDays: 5 },
      { name: 'Jas (Payet)', pricePerUnit: 35000, unit: 'pcs', estimatedDays: 7 },
      { name: 'Sweater', pricePerUnit: 15000, unit: 'pcs', estimatedDays: 3 },
      { name: 'Jas Wanita', pricePerUnit: 25000, unit: 'pcs', estimatedDays: 5 },
      { name: 'Jas Wanita (payet)', pricePerUnit: 35000, unit: 'pcs', estimatedDays: 7 },
      { name: 'Jeans', pricePerUnit: 15000, unit: 'pcs', estimatedDays: 3 },
    ]
  }
]