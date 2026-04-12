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
    name: "Starter Pack",
    description: "10 créditos para generar guiones",
    priceInCents: 499, // $4.99
    credits: 10,
  },
  {
    id: "creator-pack",
    name: "Creator Pack",
    description: "50 créditos para generar guiones",
    priceInCents: 1999, // $19.99
    credits: 50,
    popular: true,
  },
  {
    id: "pro-pack",
    name: "Pro Pack",
    description: "150 créditos para generar guiones",
    priceInCents: 4999, // $49.99
    credits: 150,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}
