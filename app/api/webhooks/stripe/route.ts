import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

// Use service role for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || "0", 10)

    if (userId && credits > 0) {
      // Add credits to user profile
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("creditos")
        .eq("id", userId)
        .single()

      if (fetchError) {
        console.error("Error fetching profile:", fetchError)
        return NextResponse.json({ error: "Profile not found" }, { status: 500 })
      }

      const newCredits = (profile?.creditos || 0) + credits

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ creditos: newCredits, es_premium: true })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating credits:", updateError)
        return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
      }

      console.log(`Added ${credits} credits to user ${userId}. New total: ${newCredits}`)
    }
  }

  return NextResponse.json({ received: true })
}
