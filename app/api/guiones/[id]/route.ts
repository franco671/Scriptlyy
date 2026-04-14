import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  // Obtenemos el ID de la URL
  const { id } = params

  const { error } = await supabase
    .from("guiones")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error eliminando guion:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}