"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PRODUCTS } from "@/lib/products"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Check, Loader2, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"

export function PricingCards() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled")

  const handlePurchase = async (productId: string) => {
    try {
      setLoadingId(productId)
      const { url } = await createCheckoutSession(productId)
      if (url) window.location.href = url
    } catch (error) {
      console.error(error)
      alert("Error al procesar el pago.")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      {canceled && (
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
          <p className="text-destructive">El pago fue cancelado.</p>
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PRODUCTS.map((product) => (
          <Card key={product.id} className={product.popular ? "border-primary shadow-lg" : ""}>
            <CardHeader className="text-center">
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">${(product.priceInCents / 100).toFixed(0)}</span>
                <span className="text-muted-foreground ml-1">USD</span>
              </div>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {product.credits} créditos</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handlePurchase(product.id)}
                disabled={loadingId !== null}
              >
                {loadingId === product.id ? <Loader2 className="animate-spin" /> : "Comprar"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}