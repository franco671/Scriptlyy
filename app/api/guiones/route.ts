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

    if (error) {
      throw error
    }

    // Get credits and premium status from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("es_premium, creditos")
      .eq("id", user.id)
      .single()

    const esPremium = profile?.es_premium ?? false
    const creditos = profile?.creditos ?? 0
    const count = guiones?.length ?? 0
    const canCreate = creditos > 0

    return NextResponse.json({
      guiones,
      meta: {
        count,
        creditos,
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

    // Check credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("creditos")
      .eq("id", user.id)
      .single()

    const creditos = profile?.creditos ?? 0

    if (creditos <= 0) {
      return NextResponse.json(
        { error: "No tienes créditos disponibles. Compra más créditos para continuar." },
        { status: 403 }
      )
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

    // Deduct one credit
    const { error: creditError } = await supabase
      .from("profiles")
      .update({ creditos: creditos - 1 })
      .eq("id", user.id)

    if (creditError) {
      console.error("Error deducting credit:", creditError)
    }

    return NextResponse.json({
      ...data,
      creditos_restantes: creditos - 1
    })
  } catch (error) {
    console.error("Error saving guion:", error)
    return NextResponse.json(
      { error: "Error al guardar el guion" },
      { status: 500 }
    )
  }
}
