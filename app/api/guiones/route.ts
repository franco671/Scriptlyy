import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: guiones, error } = await supabase
      .from("guiones")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if (error) throw error

    const { data: profile } = await supabase
      .from("profiles")
      .select("es_premium, creditos")
      .eq("id", user.id)
      .single()

    return NextResponse.json({
      guiones,
      meta: {
        count: guiones?.length ?? 0,
        creditos: profile?.creditos ?? 0,
        es_premium: profile?.es_premium ?? false,
        can_create: (profile?.creditos ?? 0) > 0
      }
    })
  } catch (error) {
    console.error("Error fetching guiones:", error)
    return NextResponse.json({ error: "Error al obtener los guiones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { titulo, nicho, hook, desarrollo, cta, segundos, visual_suggestion } = await request.json()

    // SIMPLEMENTE INSERTAMOS EL GUION
    // No verificamos créditos aquí porque el guardado debe ser libre
    const { data, error } = await supabase
      .from("guiones")
      .insert({
        user_id: user.id,
        titulo,
        nicho,
        hook,
        desarrollo,
        cta,
        segundos,
        visual_suggestion
      })
      .select()
      .single()

    if (error) throw error

    // ELIMINAMOS LA SECCIÓN DE "DEDUCT ONE CREDIT"
    // Ahora guardar es una operación de base de datos estándar y gratuita.

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving guion:", error)
    return NextResponse.json({ error: "Error al guardar el guion" }, { status: 500 })
  }
}
