"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PRODUCTS } from "@/lib/products"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Check, Loader2, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// 1. Creamos un componente interno para la lista de precios
function PricingContent() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled")

  const handlePurchase = async (productId: string) => {
    try {
      setLoadingId(productId)
      const { url } = await createCheckoutSession(productId)
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert("Error al procesar el pago. Por favor intenta de nuevo.")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" />
        Volver al dashboard
      </Link>

      {canceled && (
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
          <p className="text-destructive">El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.</p>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Comprar Créditos</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Cada crédito te permite generar un guion viral con IA. Elige el paquete que mejor se adapte a tus necesidades.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PRODUCTS.map((product) => (
          <Card
            key={product.id}
            className={`relative flex flex-col ${product.popular ? "border-primary shadow-lg shadow-primary/20" : ""}`}
          >
            {product.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Más Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">${(product.priceInCents / 100).toFixed(2)}</span>
                <span className="text-muted-foreground ml-1">USD</span>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{product.credits} créditos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Guiones con IA avanzada</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Sugerencias visuales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Sin caducidad</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                variant={product.popular ? "default" : "outline"}
                onClick={() => handlePurchase(product.id)}
                disabled={loadingId !== null}
              >
                {loadingId === product.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Comprar ahora"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

// 2. La página principal simplemente envuelve el contenido en Suspense
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>}>
        <PricingContent />
      </Suspense>
    </div>
  )
}