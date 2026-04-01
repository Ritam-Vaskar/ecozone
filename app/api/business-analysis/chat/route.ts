import { NextRequest, NextResponse } from "next/server"
import { getGroqClient, GROQ_MODEL } from "@/lib/groq"
import type {
  BusinessDescription,
  ImpactPoint,
  SuggestionGroup,
  ChatMessage,
} from "@/types/business-analysis"

export async function POST(req: NextRequest) {
  try {
    const { business, selectedImpacts, selectedSuggestions, messages } = (await req.json()) as {
      business: BusinessDescription
      selectedImpacts: ImpactPoint[]
      selectedSuggestions: SuggestionGroup[]
      messages: ChatMessage[]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    const actionsFlat = selectedSuggestions.flatMap((s) => s.actions).map((a) => a.title)

    const systemPrompt = `You are Ecozon's sustainability advisor helping ${business.name} implement their sustainability plan.

Business context:
- Name: ${business.name}
- Industry: ${business.industry}
- Size: ${business.size}
- Description: ${business.description}

Selected impact areas: ${selectedImpacts.map((ip) => ip.title).join(", ")}
Planned actions: ${actionsFlat.join(", ")}

Your role: Answer questions about these specific actions, help prioritize implementation, provide realistic cost estimates, suggest resources and vendors, and explain methodologies. Be concise, practical, and specific to this business. Do not discuss topics unrelated to sustainability or this business's plan.`

    const groq = getGroqClient()
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      temperature: 0.6,
      max_tokens: 600,
    })

    const reply = completion.choices[0]?.message?.content
    if (!reply) throw new Error("Empty response from LLM")

    return NextResponse.json({ data: { role: "assistant", content: reply } })
  } catch (error: any) {
    console.error("[chat] error:", error)
    return NextResponse.json(
      { error: error.message ?? "Chat request failed" },
      { status: 500 }
    )
  }
}
