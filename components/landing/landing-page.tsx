"use client"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Hero } from "./hero"
import { HowItWorks } from "./how-it-works"
import { AuthModal } from "./auth-modal"

interface LandingPageProps {
  onAuthSuccess: () => void
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogin={() => setAuthModalOpen(true)} />

      <main className="pt-16">
        <Hero onGetStarted={() => setAuthModalOpen(true)} />
        <HowItWorks />

        {/* Features section placeholder */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para crear contenido viral
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
              Herramientas profesionales diseñadas específicamente para creadores de Shorts
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { title: "Editor Inteligente", desc: "Estructura optimizada con Hook, Cuerpo y CTA" },
                { title: "Análisis en Tiempo Real", desc: "Tiempo de lectura y métricas instantáneas" },
                { title: "Sugerencias de B-roll", desc: "Ideas visuales basadas en tu contenido" },
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Scriptly. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={onAuthSuccess}
      />
    </div>
  )
}
