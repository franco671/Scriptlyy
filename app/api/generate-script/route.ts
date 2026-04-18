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

    const prompt = `Actúa como un guionista de YouTube Shorts especializado en retención extrema (estilo MrBeast o Ryan Trahan). 
Estamos en el año 2026, así que usa datos ACTUALIZADOS (Ej: Real Madrid tiene 15 Champions).

Tu misión es escribir un guion sobre "${topic}" para un video de ${duration} segundos.

REGLAS DE ORO (CRÍTICO):
1. HOOK SIN CLICHÉS: NO empieces siempre con preguntas tipo "¿Sabías que...?". 
   - Alterna entre: Una afirmación chocante, un dato contundente o un mito desmentido. 
   - Debe ser una bofetada de información en los primeros 2 segundos.
2. DESARROLLO DINÁMICO: Debe tener exactamente ${sentenceCount} oraciones. Evita el tono de Wikipedia; usa un lenguaje narrativo, con tensión y ritmo.
3. PRECISIÓN 2026: Si mencionas estadísticas, asegúrate de que reflejen la actualidad de 2026.
4. Total de palabras aproximado: ${targetWords}.
5. Tono: ${tone}. Título: ${title}.

ESTRUCTURA DEL JSON:
- hook: La frase de impacto (sin "Hola" ni introducciones).
- desarrollo: Un solo párrafo con las ${sentenceCount} oraciones fluidas.
- cta: Un cierre que obligue a la gente a pelearse o debatir en los comentarios.
- visual_suggestions: 3 clips visuales dinámicos.

Responde ÚNICAMENTE el objeto JSON puro:
{
  "hook": "...",
  "desarrollo": "...",
  "cta": "...",
  "visual_suggestions": ["...", "...", "..."]
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