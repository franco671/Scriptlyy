import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import dynamic from 'next/dynamic'

// Esto carga el componente de los precios SOLO en el navegador del usuario
const PricingCards = dynamic(
  () => import('@/components/PricingCards').then((mod) => mod.PricingCards),
  {
    ssr: false,
    loading: () => <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8" /></div>
  }
)

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="container mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Volver al dashboard
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Comprar Créditos</h1>
          <p className="text-muted-foreground text-lg">Elegí el plan para potenciar tu canal Franquito.</p>
        </div>

        <PricingCards />
      </div>
    </div>
  )
}