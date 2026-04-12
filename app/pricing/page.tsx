"use client"

import { Suspense } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { PricingCards } from "@/components/PricingCards"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="container mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al dashboard</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Comprar Créditos</h1>
          <p className="text-muted-foreground text-lg">Elegí el plan para potenciar tu contenido.</p>
        </div>

        {/* El secreto es que PricingCards (que usa useSearchParams) esté SIEMPRE bajo un Suspense */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-primary mb-4" />
            <p className="text-muted-foreground">Cargando planes...</p>
          </div>
        }>
          <PricingCards />
        </Suspense>
      </div>
    </div>
  )
}