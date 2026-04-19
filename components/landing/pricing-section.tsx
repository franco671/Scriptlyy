"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PRODUCTS } from "@/lib/products"
import { Check, Sparkles } from "lucide-react"

interface PricingSectionProps {
  onGetStarted: () => void
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Precios simples, sin sorpresas
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Empieza gratis con 5 créditos. Compra más cuando los necesites, sin suscripciones.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRODUCTS.map((product, i) => (
            <Card
              key={product.id}
              className={`relative flex flex-col opacity-0 animate-fade-in-up transition-all duration-300 hover:translate-y-[-6px] ${product.popular
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "hover:border-primary/50"
                } ${i === 0 ? 'animation-delay-100' :
                  i === 1 ? 'animation-delay-200' :
                    'animation-delay-300'
                }`}
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
                  onClick={onGetStarted}
                >
                  Elegir Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Todos los usuarios nuevos reciben 5 créditos gratis para probar la plataforma.
        </p>
      </div>
    </section>
  )
}

