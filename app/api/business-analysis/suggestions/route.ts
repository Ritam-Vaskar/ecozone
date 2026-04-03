import { NextRequest, NextResponse } from "next/server"
import { getGroqClient, GROQ_MODEL } from "@/lib/groq"
import type { BusinessDescription, ImpactPoint, SuggestionGroup } from "@/types/business-analysis"

export async function POST(req: NextRequest) {
  try {
    const { business, selectedImpacts } = (await req.json()) as {
      business: BusinessDescription
      selectedImpacts: ImpactPoint[]
    }

    if (!Array.isArray(selectedImpacts) || selectedImpacts.length === 0) {
      return NextResponse.json(
        { error: "At least one impact point must be selected" },
        { status: 400 }
      )
    }

    const impactsText = selectedImpacts
      .map(
        (ip, i) =>
          `${i + 1}. ID: ${ip.id}\n   Title: ${ip.title}\n   Area: ${ip.area} (${ip.severity} severity)\n   Context: ${ip.description}`
      )
      .join("\n\n")

    const systemPrompt = `You are a sustainability consultant generating concrete, actionable recommendations.
For each provided impact area, generate 2 to 3 specific actions this business can take.

CRITICAL: Respond with ONLY valid JSON matching this schema. No markdown, no extra text:
{
  "suggestions": [
    {
      "impact_point_id": "exact id string from the input",
      "impact_area": "area name",
      "actions": [
        {
          "id": "unique action id e.g. action_001",
          "title": "specific action title",
          "description": "2 to 3 sentences on what to do and the expected outcome",
          "difficulty": "easy or medium or hard",
          "impact": "high or medium or low",
          "estimated_reduction": "e.g. 10 to 20% reduction in packaging waste",
          "timeline": "e.g. 3 to 6 months, immediate, 1 to 2 years"
        }
      ]
    }
  ]
}

Rules:
- Include one entry per impact point in the input, using its exact id
- Actions must be specific to this business, not generic sustainability advice
- difficulty easy means quick wins with minimal investment, medium means moderate effort and cost, hard means major transformation
- Quantify estimated_reduction wherever possible
- Ensure suggestions array length equals number of impact points provided`

    const userPrompt = `Business: ${business.name} (${business.industry}, ${business.size})
Description: ${business.description}

Generate sustainability actions for these selected impact areas:

${impactsText}`

    const groq = getGroqClient()
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 3000,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error("Empty response from LLM")

    const parsed = JSON.parse(raw) as { suggestions: SuggestionGroup[] }

    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
      throw new Error("No suggestions returned — please try again")
    }

    return NextResponse.json({ data: parsed.suggestions })
  } catch (error: any) {
    console.error("[suggestions] error:", error)
    return NextResponse.json(
      { error: error.message ?? "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}
