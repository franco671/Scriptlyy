"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PRODUCTS } from "@/lib/products"
import { Check, Loader2, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
// Importamos PayPal
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"

function PricingContent() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const canceled = searchParams.get("canceled")

  // Función que se dispara cuando PayPal confirma el pago
  const handlePayPalSuccess = async (details: any, product: any) => {
    try {
      setLoadingId(product.id)

      // Aquí llamamos a tu API para sumar créditos en Supabase
      const response = await fetch("/api/payments/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: details.id,
          productId: product.id,
          creditsToAdd: product.credits,
        }),
      });

      if (response.ok) {
        alert(`¡Pago exitoso! Se han sumado ${product.credits} créditos a tu cuenta.`);
        router.push("/dashboard");
      } else {
        alert("El pago se realizó pero hubo un error al cargar los créditos. Contacta a soporte.");
      }
    } catch (error) {
      console.error("Error capturando pago:", error);
      alert("Hubo un error al procesar tu carga de créditos.");
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "" }}>
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
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {loadingId === product.id ? (
                  <Button className="w-full" disabled>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </Button>
                ) : (
                  <PayPalButtons
                    style={{ layout: "horizontal", color: "blue", shape: "rect", label: "pay" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: (product.priceInCents / 100).toString(),
                            },
                            description: `Carga de ${product.credits} créditos`,
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order?.capture();
                      handlePayPalSuccess(details, product);
                    }}
                  />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PayPalScriptProvider>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>}>
        <PricingContent />
      </Suspense>
    </div>
  )
}