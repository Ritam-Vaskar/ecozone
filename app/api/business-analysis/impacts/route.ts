import { NextRequest, NextResponse } from "next/server"
import { getGroqClient, GROQ_MODEL } from "@/lib/groq"
import type { BusinessDescription, ImpactPoint } from "@/types/business-analysis"

export async function POST(req: NextRequest) {
  try {
    const { business } = (await req.json()) as { business: BusinessDescription }

    if (!business?.name) {
      return NextResponse.json(
        { error: "Business description is required" },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a carbon footprint and sustainability expert.
Analyze the provided business and identify 4 to 6 specific high-carbon-impact areas relevant to this exact business.

CRITICAL: Respond with ONLY valid JSON matching this schema. No markdown, no extra text:
{
  "impact_points": [
    {
      "id": "unique snake_case identifier e.g. supply_chain_001",
      "area": "category such as Supply Chain, Energy, Packaging, Transportation, Manufacturing, Waste, or Water",
      "title": "concise title for this specific impact point",
      "description": "2 sentences explaining why this is a significant carbon impact for this specific business",
      "severity": "high or medium or low",
      "estimated_impact": "e.g. approximately 30% of total emissions, or a qualitative estimate"
    }
  ]
}

Rules:
- Be specific to this exact business, not generic advice
- Order the array by severity: high first, then medium, then low
- severity high means a major emission source, medium means significant but addressable, low means minor but worth tackling
- Use the business operations and products to make the impacts relevant and believable`

    const userPrompt = `Business: ${business.name}
Industry: ${business.industry}
Size: ${business.size}
Description: ${business.description}
Key Operations: ${business.operations.join(", ")}
Products/Services: ${business.products_services.join(", ")}
Locations: ${business.locations.join(", ")}

Identify the high-carbon-impact areas for this business.`

    const groq = getGroqClient()
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1500,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error("Empty response from LLM")

    const parsed = JSON.parse(raw) as { impact_points: ImpactPoint[] }

    if (!Array.isArray(parsed.impact_points) || parsed.impact_points.length === 0) {
      throw new Error("No impact points returned — please try again")
    }

    return NextResponse.json({ data: parsed.impact_points })
  } catch (error: any) {
    console.error("[impacts] error:", error)
    return NextResponse.json(
      { error: error.message ?? "Failed to generate impact points" },
      { status: 500 }
    )
  }
}
