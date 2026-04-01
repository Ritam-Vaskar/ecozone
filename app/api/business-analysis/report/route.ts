import { NextRequest, NextResponse } from "next/server"
import { getGroqClient, GROQ_MODEL } from "@/lib/groq"
import type {
  BusinessDescription,
  ImpactPoint,
  SuggestionGroup,
  ReportData,
} from "@/types/business-analysis"

export async function POST(req: NextRequest) {
  try {
    const { business, selectedImpacts, selectedSuggestions, chatContext } = (await req.json()) as {
      business: BusinessDescription
      selectedImpacts: ImpactPoint[]
      selectedSuggestions: SuggestionGroup[]
      chatContext?: string
    }

    if (!business?.name) {
      return NextResponse.json({ error: "Business data is required" }, { status: 400 })
    }

    const systemPrompt = `You are a sustainability report writer producing professional executive summaries.

CRITICAL: Respond with ONLY valid JSON matching this exact schema. No markdown, no extra text:
{
  "report": {
    "business": <echo back the exact business object from the input>,
    "analysis_date": "<today date as ISO string>",
    "executive_summary": "3 to 4 sentences summarizing the findings, the scale of impact, and the potential for improvement",
    "impact_points": <echo back the selectedImpacts array>,
    "action_plan": <echo back the selectedSuggestions array>,
    "estimated_total_reduction": "aggregate qualitative or quantitative estimate e.g. 25 to 40% overall emission reduction potential",
    "next_steps": ["3 to 5 prioritized immediate next step strings"]
  }
}`

    const impactSummary = selectedImpacts.map((ip) => `${ip.title} (${ip.severity})`).join(", ")
    const actionSummary = selectedSuggestions
      .flatMap((s) => s.actions)
      .map((a) => a.title)
      .join(", ")

    const userPrompt = `Generate a sustainability report for:

Business: ${business.name}
Industry: ${business.industry}, Size: ${business.size}
Description: ${business.description}

Key impact areas identified: ${impactSummary}
Actions selected: ${actionSummary}
${chatContext ? `\nAdditional session context:\n${chatContext}` : ""}

Produce the complete report JSON now.`

    const groq = getGroqClient()
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2500,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error("Empty response from LLM")

    const parsed = JSON.parse(raw) as { report: ReportData }

    if (!parsed.report?.executive_summary) {
      throw new Error("Incomplete report returned — please try again")
    }

    // Ensure critical fields are present from the input (don't rely solely on LLM echo)
    parsed.report.business = business
    parsed.report.impact_points = selectedImpacts
    parsed.report.action_plan = selectedSuggestions
    if (!parsed.report.analysis_date) {
      parsed.report.analysis_date = new Date().toISOString()
    }

    return NextResponse.json({ data: parsed.report })
  } catch (error: any) {
    console.error("[report] error:", error)
    return NextResponse.json(
      { error: error.message ?? "Failed to generate report" },
      { status: 500 }
    )
  }
}
