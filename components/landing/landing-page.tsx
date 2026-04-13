""use client"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Hero } from "./hero"
import { HowItWorks } from "./how-it-works"
import { StatsSection } from "./stats-section"
import { PricingSection } from "./pricing-section"
import { FAQSection } from "./faq-section"
import { AuthModal } from "./auth-modal"
import { Footer } from "./footer" // Asegúrate de que este archivo exista

interface LandingPageProps {
  onAuthSuccess: () => void
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogin={() => setAuthModalOpen(true)} />

      <main className="pt-16">
        {/* 1. Hero */}
        <Hero onGetStarted={() => setAuthModalOpen(true)} />

        {/* 2. Stats (El de 10k creadores, etc) */}
        <StatsSection />

        {/* 3. Características (Features) */}
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
                <div
                  key={i}
                  className={`p-6 rounded-2xl bg-card border border-border opacity-0 animate-fade-in-up transition-all duration-300 hover:translate-y-[-6px] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${i === 0 ? 'animation-delay-100' :
                      i === 1 ? 'animation-delay-200' :
                        'animation-delay-300'
                    }`}
                >
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Cómo funciona */}
        <HowItWorks />

        {/* 5. Precios (Aquí aparecerán tus packs de 5 y 10 USD) */}
        <PricingSection />

        {/* 6. FAQ (Aquí funcionará el ancla #faq) */}
        <FAQSection />
      </main>

      {/* 7. Footer profesional */}
      <Footer />

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={onAuthSuccess}
      />
    </div>
  )
}
