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
    id: "test_live_01", // ID de prueba
    name: "Prueba Sistema",
    description: "Paquete para testear la pasarela real",
    priceInCents: 100, // $1.00 USD
    credits: 5,
    popular: false,
  },
  {
    id: "price_1TLV5CLe7V0O0f9zMQBraF9m",
    name: "Pack Creador",
    description: "50 créditos para guiones virales",
    priceInCents: 500, // $5.00
    credits: 50,
  },
  {
    id: "price_1TLmRfLe7V0O0f9zZb5hefMi",
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