import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderID, creditsToAdd } = await req.json();

    // 1. Validar que recibimos lo mínimo necesario
    if (!orderID || !creditsToAdd) {
      return NextResponse.json({ error: "Faltan datos en la petición" }, { status: 400 });
    }

    // 2. Inicializar el cliente de servidor de Supabase
    const supabase = await createClient();

    // 3. Obtener el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error obteniendo usuario:", userError);
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 4. Consultar los créditos actuales del perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('creditos')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error de perfil:", profileError);
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    // 5. Calcular y actualizar
    const nuevosCreditos = (profile.creditos || 0) + creditsToAdd;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ creditos: nuevosCreditos })
      .eq('id', user.id);

    if (updateError) {
      console.error("Error al actualizar créditos:", updateError);
      return NextResponse.json({ error: "Error al guardar créditos" }, { status: 500 });
    }

    // 6. Todo salió bien
    return NextResponse.json({
      success: true,
      nuevoBalance: nuevosCreditos
    });

  } catch (error) {
    console.error("Error crítico en API PayPal:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}