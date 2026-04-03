"use client"

import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { AnalysisAction, BusinessDescription, ImpactPoint } from "@/types/business-analysis"

interface Props {
  dispatch: React.Dispatch<AnalysisAction>
  business: BusinessDescription
  impactPoints: ImpactPoint[]
  selectedImpactIds: Set<string>
  isLoading: boolean
  error: string | null
}

const severityConfig = {
  high: { label: "High Impact", className: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "Medium Impact", className: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "Low Impact", className: "bg-green-100 text-green-700 border-green-200" },
}

export function Stage2ImpactPoints({
  dispatch,
  business,
  impactPoints,
  selectedImpactIds,
  isLoading,
  error,
}: Props) {
  const handleContinue = async () => {
    const selected = impactPoints.filter((ip) => selectedImpactIds.has(ip.id))
    dispatch({ type: "STAGE3_START" })
    try {
      const res = await fetch("/api/business-analysis/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, selectedImpacts: selected }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      dispatch({ type: "STAGE3_SUCCESS", payload: json.data })
    } catch (e: any) {
      dispatch({ type: "SET_ERROR", payload: e.message ?? "Something went wrong" })
    }
  }

  if (isLoading && impactPoints.length === 0) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <p className="text-sm text-gray-500">Identifying carbon impact areas for {business.name}...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-semibold">Carbon Impact Areas</h3>
        <p className="text-sm text-gray-500">
          Select the areas you want to address for <span className="font-medium text-gray-700">{business.name}</span>.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => dispatch({ type: "CLEAR_ERROR" })}
            className="underline shrink-0 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {impactPoints.map((ip) => {
          const selected = selectedImpactIds.has(ip.id)
          const sev = severityConfig[ip.severity]
          return (
            <Card
              key={ip.id}
              onClick={() => dispatch({ type: "TOGGLE_IMPACT", payload: ip.id })}
              className={cn(
                "cursor-pointer transition-all duration-200 border-2",
                selected
                  ? "border-primary bg-green-50 shadow-md"
                  : "border-transparent hover:border-gray-200 hover:shadow-sm"
              )}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                  >
                    {ip.area}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-xs border", sev.className)}
                  >
                    {sev.label}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm leading-snug">{ip.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{ip.description}</p>
                <p className="text-xs font-medium text-primary">{ip.estimated_impact}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button
        onClick={handleContinue}
        disabled={selectedImpactIds.size === 0 || isLoading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isLoading
          ? "Generating Suggestions..."
          : `Continue with ${selectedImpactIds.size} area${selectedImpactIds.size !== 1 ? "s" : ""} selected`}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
