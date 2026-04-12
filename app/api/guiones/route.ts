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

    return NextResponse.json(guiones)
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

    const { titulo, nicho, hook, desarrollo, cta, segundos, visual_suggestions } = await request.json()

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
        visual_suggestions
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
