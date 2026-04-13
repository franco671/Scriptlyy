export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  credits: number
  popular?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: "starter-pack",
    name: "Pack Creador",
    description: "50 créditos para guiones virales",
    priceInCents: 500, // $5.00
    credits: 50,
  },
  {
    id: "pro-pack",
    name: "Pack Viral",
    description: "100 Guiones para 100 shorts.",
    priceInCents: 1000, // $10.00
    credits: 100,
    popular: true, // Este es el que va a resaltar en la web
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}