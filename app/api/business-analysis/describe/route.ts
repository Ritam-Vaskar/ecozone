import { NextRequest, NextResponse } from "next/server"
import { getGroqClient, GROQ_MODEL } from "@/lib/groq"
import { searchBusiness, formatSearchResultsForPrompt } from "@/lib/web-search"
import type { BusinessDescription } from "@/types/business-analysis"

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json()

    if (!input || typeof input !== "string" || input.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter at least 3 characters." },
        { status: 400 }
      )
    }

    const trimmed = input.trim()
    const isUrl = /^https?:\/\//i.test(trimmed) || trimmed.startsWith("www.")
    const searchQuery = isUrl
      ? `company ${trimmed} about business overview`
      : `${trimmed} company business overview what they do`

    const search = await searchBusiness(searchQuery)
    const searchContext = formatSearchResultsForPrompt(search)

    const systemPrompt = `You are a business intelligence analyst specializing in sustainability assessment.
Your task is to produce a structured description of a business based on the user's input${searchContext ? " and the web search results provided" : ""}.

CRITICAL: Respond with ONLY valid JSON matching this exact schema. No markdown, no explanation, no extra text outside the JSON:
{
  "name": "official business name as a string",
  "industry": "primary industry sector as a string",
  "description": "2 to 3 sentences describing what the business does",
  "size": "startup or sme or enterprise",
  "operations": ["3 to 5 key operational areas as strings"],
  "products_services": ["3 to 5 main products or services as strings"],
  "locations": ["known operating locations or regions, use Unknown if uncertain"]
}

Size classification:
- startup: fewer than 50 employees or early stage company
- sme: 50 to 500 employees or established small/medium business
- enterprise: more than 500 employees or large corporation${searchContext ? `\n\n${searchContext}` : ""}`

    const groq = getGroqClient()
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Describe this business: "${trimmed}"` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error("Empty response from LLM")

    const parsed: BusinessDescription = JSON.parse(raw)

    if (!parsed.name || !parsed.industry || !parsed.description) {
      throw new Error("Incomplete business description returned — please try again")
    }

    return NextResponse.json({ data: parsed })
  } catch (error: any) {
    console.error("[describe] error:", error)
    return NextResponse.json(
      { error: error.message ?? "Failed to generate business description" },
      { status: 500 }
    )
  }
}
