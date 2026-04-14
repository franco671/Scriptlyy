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

    // --- BLOQUE DE SEGURIDAD: VERIFICACIÓN DE CRÉDITOS ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('creditos')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.creditos <= 0) {
      return NextResponse.json(
        { error: "No tienes créditos suficientes" },
        { status: 403 }
      )
    }
    // ---------------------------------------------------

    const { title, topic, tone, duration } = await request.json()

    let sentenceCount = 3;
    let targetWords = Math.floor(duration * 2.0);

    if (duration <= 35) {
      sentenceCount = 3;
    } else if (duration <= 55) {
      sentenceCount = 6;
    } else {
      sentenceCount = 8;
    }

    const prompt = `Actúa como un guionista experto en YouTube Shorts virales. 
Tu misión es escribir un guion sobre "${topic}" para un video que dure exactamente ${duration} segundos.

REGLAS DE EXTENSIÓN (CRÍTICO):
1. El "desarrollo" DEBE tener exactamente ${sentenceCount} oraciones largas, descriptivas y fluidas. No resumas en una sola línea.
2. El total de palabras debe ser de aproximadamente ${targetWords} palabras para llenar el tiempo de ${duration}s.

ESTRUCTURA DEL JSON:
- hook: Una frase de impacto que frene el scroll, usar frases como "¿Sabia que...?, frases que impacten al espectador y que genere curiosidad (20-30 palabras).
- desarrollo: Un solo bloque de texto narrativo con las ${sentenceCount} oraciones detalladas.
- cta: Una pregunta final para generar debate en los comentarios (12-15 palabras).
- visual_suggestions: Lista de 3 sugerencias de clips o imágenes.

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
      temperature: 0.8,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Error en el formato de respuesta")

    const generatedContent = JSON.parse(jsonMatch[0])

    // --- BLOQUE DE SEGURIDAD: DESCUENTO DE CRÉDITO ---
    // Solo descontamos si la IA respondió con éxito
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ creditos: profile.creditos - 1 })
      .eq('id', user.id)

    if (updateError) {
      console.error("Error al descontar crédito:", updateError)
      // Opcional: podrías decidir si fallar o dejarlo pasar, 
      // pero mejor fallar para evitar que se bugee el sistema.
    }
    // ---------------------------------------------------

    return NextResponse.json(generatedContent)

  } catch (error) {
    console.error("Error generating script:", error)
    return NextResponse.json({ error: "Error al generar el guion" }, { status: 500 })
  }
}