"use client"

import { Settings, PenTool, Eye } from "lucide-react"

const steps = [
  {
    icon: Settings,
    step: "01",
    title: "Configura",
    description: "Define el tema, tono y duración de tu Short. Selecciona si quieres escritura manual o asistida por IA."
  },
  {
    icon: PenTool,
    step: "02", 
    title: "Redacta",
    description: "Escribe tu guion con estructura optimizada: Hook, Cuerpo y CTA. La IA te sugiere mejoras en tiempo real."
  },
  {
    icon: Eye,
    step: "03",
    title: "Visualiza",
    description: "Obtén el tiempo estimado de lectura, sugerencias de B-roll y exporta tu guion listo para grabar."
  }
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cómo funciona
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Tres simples pasos para crear guiones que enganchen a tu audiencia desde el primer segundo
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.step}
              className={`relative group opacity-0 animate-fade-in-up ${
                index === 0 ? 'animation-delay-100' : 
                index === 1 ? 'animation-delay-300' : 
                'animation-delay-500'
              }`}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-8px] hover:shadow-xl hover:shadow-primary/10">
                {/* Step number */}
                <div className="absolute -top-3 right-6 px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full transition-transform duration-300 group-hover:scale-110">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <step.icon className="w-7 h-7 text-primary transition-transform duration-300 group-hover:rotate-6" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
