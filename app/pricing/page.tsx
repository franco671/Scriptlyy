export const dynamic = "force-dynamic";

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import nextDynamic from 'next/dynamic'

// Cargamos el componente sin SSR para evitar el error de Stripe
const PricingCards = nextDynamic(
  () => import('@/components/PricingCards').then((mod) => mod.PricingCards),
  { ssr: false }
)

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

        <div className="flex justify-center">
          <PricingCards />
        </div>
      </div>
    </div>
  )
}