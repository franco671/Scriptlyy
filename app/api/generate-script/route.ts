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

    const prompt = `Actúa como un experto guionista de YouTube Shorts especializado en retención extrema y viralidad (estilo "Faceless Channels").

CONTEXTO TEMPORAL: Estamos en el año 2026. Es OBLIGATORIO que los datos estadísticos, récords y cifras reflejen la actualidad de 2026. Si no tienes el dato exacto de 2026, utiliza aproximaciones como "superando los..." o "cerca de llegar a...". PROHIBIDO usar datos de 2023 o anteriores.

Tu misión es escribir un guion sobre "${topic}" para un video de ${duration} segundos.

REGLAS DE ORO (MÁXIMA PRIORIDAD):
1. HOOK RADICAL: Prohibido empezar con "¿Sabías que...?", fechas o nombres propios. Empieza con una curiosidad visual, una amenaza o una promesa de valor inmediata. El espectador debe sentir que se pierde algo si hace scroll.
2. NARRATIVA Y ECONOMÍA DE TIEMPO: Debe tener exactamente ${sentenceCount} oraciones. SÉ ESTRICTO: El guion total no debe superar las ${targetWords} palabras. Si la descripción es larga, filtra solo lo más impactante. Usa el estilo "Storytelling de impacto", no describas hechos, cuenta una historia cinematográfica.
3. FILTRO DE COHERENCIA: No mezcles analogías deportivas en temas científicos o históricos. 
4. TONO: Aplica estrictamente el tono "${tone}" basándote en el título "${title}".
   - Si es Misterio: Usa preguntas retóricas y sombras.
   - Si es Enérgico: Usa verbos de acción y frases cortas.
   - Si es Educativo: Revela secretos, no des lecciones.

ESTRUCTURA DEL JSON:
- hook: La frase que rompe el scroll.
- desarrollo: Un solo párrafo con las ${sentenceCount} oraciones que mantienen la tensión.
- cta: Un cierre que obligue al usuario a comentar su teoría o postura.
- visual_suggestions: Lista de 5 sugerencias (1 hook, 3 desarrollo, 1 cta). Ejemplo de formato: "[Toma cinemática de...]"

Responde ÚNICAMENTE el objeto JSON puro:
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