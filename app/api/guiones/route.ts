import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const FREE_LIMIT = 5

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

    if (error) {
      throw error
    }

    // Get premium status from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("es_premium")
      .eq("id", user.id)
      .single()

    const esPremium = profile?.es_premium ?? false
    const count = guiones?.length ?? 0
    const canCreate = esPremium || count < FREE_LIMIT

    return NextResponse.json({
      guiones,
      meta: {
        count,
        limit: FREE_LIMIT,
        es_premium: esPremium,
        can_create: canCreate
      }
    })
  } catch (error) {
    console.error("Error fetching guiones:", error)
    return NextResponse.json(
      { error: "Error al obtener los guiones" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check premium status and current count
    const { data: profile } = await supabase
      .from("profiles")
      .select("es_premium")
      .eq("id", user.id)
      .single()

    const esPremium = profile?.es_premium ?? false

    if (!esPremium) {
      const { count } = await supabase
        .from("guiones")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if ((count ?? 0) >= FREE_LIMIT) {
        return NextResponse.json(
          { error: "Has alcanzado el límite de guiones gratuitos. Actualiza a Premium para continuar." },
          { status: 403 }
        )
      }
    }

    const { titulo, nicho, hook, desarrollo, cta, segundos, visual_suggestion } = await request.json()

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

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving guion:", error)
    return NextResponse.json(
      { error: "Error al guardar el guion" },
      { status: 500 }
    )
  }
}
