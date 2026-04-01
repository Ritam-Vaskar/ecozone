export interface SearchResult {
  title: string
  link: string
  snippet: string
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
}

export async function searchBusiness(query: string): Promise<SearchResponse> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    console.warn("SERPER_API_KEY not set — proceeding without web search context")
    return { results: [], query }
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 5 }),
    })

    if (!response.ok) {
      console.warn(`Serper API error ${response.status} — proceeding without search context`)
      return { results: [], query }
    }

    const data = await response.json()

    const results: SearchResult[] = ((data.organic ?? []) as any[]).slice(0, 5).map((item) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      snippet: item.snippet ?? "",
    }))

    return { results, query }
  } catch (err) {
    console.warn("Serper fetch failed — proceeding without search context", err)
    return { results: [], query }
  }
}

export function formatSearchResultsForPrompt(search: SearchResponse): string {
  if (search.results.length === 0) return ""

  const lines = search.results.map(
    (r, i) => `[${i + 1}] ${r.title}\n    ${r.snippet}\n    Source: ${r.link}`
  )
  return `Web search results for "${search.query}":\n\n${lines.join("\n\n")}`
}
