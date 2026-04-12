"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PricingCards } from "@/components/PricingCards"
import { Loader2, ArrowRight, Sparkles, Video, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* --- SECCIÓN HERO --- */}
      <header className="px-4 py-24 text-center bg-gradient-to-b from-primary/10 to-background">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Inteligencia Artificial para Creadores</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Guiones virales para <span className="text-primary">Scriptlyy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          La herramienta definitiva para potenciar tus canales y dominar el algoritmo de YouTube.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">Empezar ahora <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">Ver planes</Link>
          </Button>
        </div>
      </header>

      {/* --- SECCIÓN DE PRECIOS --- */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes de Créditos</h2>
            <p className="text-muted-foreground text-lg">Sin suscripciones raras. Comprás lo que necesitás.</p>
          </div>

          {/* ESTO ES LO QUE ARREGLA EL ERROR EN VERCEL */}
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20 bg-background rounded-xl border border-dashed border-primary/20">
              <Loader2 className="animate-spin w-10 h-10 text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Cargando ofertas para vos...</p>
            </div>
          }>
            <PricingCards />
          </Suspense>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t text-center text-muted-foreground">
        <div className="container mx-auto px-4">
          <p className="mb-2 font-semibold text-foreground">Scriptlyy</p>
          <p>© 2026 - Scriptlyy v2 - franco</p>
        </div>
      </footer>
    </div>
  )
}