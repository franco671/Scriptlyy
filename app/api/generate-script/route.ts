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

    // 1. VERIFICACIÓN DE CRÉDITOS
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

    const { title, topic, tone, duration } = await request.json()

    let sentenceCount = 3;
    let targetWords = Math.floor(duration * 1.9)

    if (duration <= 35) {
      sentenceCount = 3;
    } else if (duration <= 55) {
      sentenceCount = 6;
    } else {
      sentenceCount = 8;
    }

    const prompt = `Actúa como un experto guionista de YouTube Shorts para canales de curiosidades y tecnología, historia, etc.especializado en retención extrema (estilo MrBeast o Ryan Trahan). 

CONTEXTO TEMPORAL: Estamos en el año 2026. Usa datos y estadísticas que reflejen la actualidad de este año de forma natural. 

Tu misión es escribir un guion sobre "${topic}" para un video de ${duration} segundos.

REGLAS DE ORO (CRÍTICO):
1. HOOK DE IMPACTO: PROHIBIDO empezar con "¿Sabías que...?". Empieza con una afirmación chocante, un mito desmentido o una verdad incómoda. Debe atrapar en menos de 2 segundos.
2. NARRATIVA DINÁMICA: Debe tener exactamente ${sentenceCount} oraciones. Evita el tono educativo/aburrido; usa tensión y ritmo narrativo.
3. COHERENCIA 2026: Usa el contexto de 2026 solo si es RELEVANTE para el tema (ej: IA en medicina, nuevas misiones espaciales, datos actuales). NO menciones deportes en temas de ciencia o tecnología a menos que sea el tema central.
4. EXTENSIÓN: Aproximadamente ${targetWords} palabras para un ritmo de lectura fluido.
5. TONO Y TÍTULO: Aplica un tono "${tone}" basado en el título "${title}".

ESTRUCTURA DEL JSON:
- hook: La frase de impacto.
- desarrollo: Un solo párrafo con las ${sentenceCount} oraciones.
- cta: Un cierre que genere debate o invite a comentar una opinión personal.
- visual_suggestions: Una lista de 5 sugerencias visuales específicas (una para el hook, tres para el desarrollo y una para el cierre).

Responde ÚNICAMENTE el objeto JSON puro, sin texto adicional:
{
  "hook": "...",
  "desarrollo": "...",
  "cta": "...",
  "visual_suggestions": ["...", "...", "...", "...", "..."]
}`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.8, // Bajamos un poco para más consistencia
    })

    // Limpieza de JSON robusta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("La IA no devolvió un formato válido")

    const generatedContent = JSON.parse(jsonMatch[0].trim())

    // 2. DESCUENTO DE CRÉDITO
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ creditos: profile.creditos - 1 })
      .eq('id', user.id)

    if (updateError) {
      console.error("Error al descontar crédito:", updateError)
    }

    return NextResponse.json(generatedContent)

  } catch (error) {
    console.error("Error generating script:", error)
    return NextResponse.json({ error: "Error al generar el guion" }, { status: 500 })
  }
}