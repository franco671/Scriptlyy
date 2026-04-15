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
    let targetWords = Math.floor(duration * 2.1); // Un pelín más para cubrir silencios

    if (duration <= 35) {
      sentenceCount = 3;
    } else if (duration <= 55) {
      sentenceCount = 6;
    } else {
      sentenceCount = 8;
    }

    const prompt = `Actúa como un guionista experto en YouTube Shorts virales. 
Tu misión es escribir un guion sobre "${topic}" para un video de ${duration} segundos.

REGLAS (CRÍTICO):
1. El "desarrollo" DEBE tener exactamente ${sentenceCount} oraciones largas y fluidas.
2. Total de palabras aproximado: ${targetWords}.
3. El tono debe ser: ${tone}.
4. Título de referencia: ${title}.

ESTRUCTURA DEL JSON:
- hook: Frase de impacto inicial, como alguna pregunta o algo muy curioso (curiosidad/asombro).
- desarrollo: Un solo párrafo con las ${sentenceCount} oraciones.
- cta: Pregunta final para comentarios.
- visual_suggestions: Lista de 3 clips visuales.

Responde ÚNICAMENTE con el objeto JSON puro, sin texto adicional:
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