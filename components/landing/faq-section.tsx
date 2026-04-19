"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Cómo funcionan los créditos?",
    answer: "Cada crédito te permite generar un guion completo con IA, incluyendo hook, desarrollo, CTA y sugerencias visuales. Los créditos no caducan, así que puedes usarlos cuando quieras."
  },
  {
    question: "¿Qué recibo con mi cuenta gratuita?",
    answer: "Al registrarte recibes 5 créditos gratis para probar la plataforma. Puedes crear hasta 5 guiones completos sin ningún costo."
  },
  {
    question: "¿Puedo editar los guiones después de generarlos?",
    answer: "Sí, todos los guiones generados se guardan en tu cuenta y puedes editarlos, ajustarlos y mejorarlos las veces que quieras sin gastar créditos adicionales."
  },
  {
    question: "¿Para qué tipo de contenido funciona mejor?",
    answer: "Scriptlyy está optimizado para contenido de formato corto: YouTube Shorts, TikTok, Instagram Reels y cualquier video de 15 a 90 segundos. Funciona especialmente bien para nichos de entretenimiento, educación y lifestyle."
  },
  {
    question: "¿Qué pasa si no me gusta un guion generado?",
    answer: "Puedes regenerar el guion usando otro crédito con diferentes parámetros, o editar manualmente el resultado. Te recomendamos ser específico con el nicho y tono para obtener mejores resultados."
  },
  {
    question: "¿Hay suscripción o pagos recurrentes?",
    answer: "No, Scriptlyy funciona con créditos que compras una sola vez. No hay suscripciones ni pagos recurrentes. Compra créditos solo cuando los necesites."
  },
  {
    question: "¿Puedo usar los guiones comercialmente?",
    answer: "Sí, todos los guiones generados son 100% tuyos. Puedes usarlos para tus videos personales, de marca, o para clientes sin restricciones."
  },
  {
    question: "¿Cómo funcionan las sugerencias visuales?",
    answer: "La IA analiza tu guion y sugiere tipos de B-roll, transiciones y elementos visuales que complementan tu contenido. Esto te ayuda a planificar la grabación y edición."
  }
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todo lo que necesitas saber sobre Scriptlyy
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                className="border border-border rounded-lg px-6 data-[state=open]:bg-secondary/50 transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
