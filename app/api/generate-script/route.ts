import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextResponse } from "next/server"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { title, topic, tone, duration } = await request.json()

    // 1. CALIBRACIÓN DINÁMICA SEGÚN LA OPCIÓN ELEGIDA
    let sentenceCount = 3;
    let targetWords = Math.floor(duration * 2.0); // Ritmo de lectura ideal

    if (duration <= 35) {
      sentenceCount = 3; // Para la opción de 30s
    } else if (duration <= 55) {
      sentenceCount = 6; // Para la opción de 50s
    } else {
      sentenceCount = 8; // Para la opción de 60s
    }

    const prompt = `Actúa como un guionista experto en YouTube Shorts virales. 
Tu misión es escribir un guion sobre "${topic}" para un video que dure exactamente ${duration} segundos.

REGLAS DE EXTENSIÓN (CRÍTICO):
1. El "desarrollo" DEBE tener exactamente ${sentenceCount} oraciones largas, descriptivas y fluidas. No resumas en una sola línea.
2. El total de palabras debe ser de aproximadamente ${targetWords} palabras para llenar el tiempo de ${duration}s.
3. Si el guion es muy corto, el video fallará por falta de contenido. Si es muy largo, se cortará.

ESTRUCTURA DEL JSON:
- hook: Una frase de impacto que frene el scroll (15-20 palabras).
- desarrollo: Un solo bloque de texto narrativo con las ${sentenceCount} oraciones detalladas.
- cta: Una pregunta final para generar debate en los comentarios (12-15 palabras).

Tono: ${tone}
Título del video: ${title}

Responde ÚNICAMENTE con este JSON:
{
  "hook": "...",
  "desarrollo": "...",
  "cta": "...",
  "visual_suggestions": ["...", "...", "..."]
}`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.8, // Bajamos un pelín para que sea más preciso con las reglas
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Error en el formato de respuesta")

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error("Error generating script:", error)
    return NextResponse.json({ error: "Error al generar el guion" }, { status: 500 })
  }
}