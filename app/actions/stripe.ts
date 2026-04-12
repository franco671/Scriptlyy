"use server"

import { stripe } from "@/lib/stripe"
import { getProductById } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

export async function createCheckoutSession(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Debes iniciar sesión para comprar créditos")
  }

  const product = getProductById(productId)
  if (!product) {
    throw new Error("Producto no encontrado")
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?success=true&credits=${product.credits}`,
    cancel_url: `${baseUrl}/pricing?canceled=true`,
    metadata: {
      userId: user.id,
      productId: product.id,
      credits: product.credits.toString(),
    },
  })

  return { url: session.url }
}
