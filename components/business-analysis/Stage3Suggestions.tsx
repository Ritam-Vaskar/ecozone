"use client"

import { ArrowRight, AlertCircle, Clock, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type {
  AnalysisAction,
  BusinessDescription,
  ImpactPoint,
  SuggestionGroup,
  SuggestionAction,
} from "@/types/business-analysis"

interface Props {
  dispatch: React.Dispatch<AnalysisAction>
  business: BusinessDescription
  selectedImpacts: ImpactPoint[]
  suggestions: SuggestionGroup[]
  selectedActionIds: Set<string>
  isLoading: boolean
  error: string | null
}

const difficultyConfig = {
  easy: { label: "Easy", className: "bg-green-100 text-green-700 border-green-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200" },
  hard: { label: "Hard", className: "bg-red-100 text-red-700 border-red-200" },
}

const impactConfig = {
  high: { label: "High Impact", className: "bg-primary/10 text-primary border-primary/20" },
  medium: { label: "Med. Impact", className: "bg-blue-50 text-blue-700 border-blue-200" },
  low: { label: "Low Impact", className: "bg-gray-100 text-gray-600 border-gray-200" },
}

export function Stage3Suggestions({
  dispatch,
  business,
  selectedImpacts,
  suggestions,
  selectedActionIds,
  isLoading,
  error,
}: Props) {
  const handleStart = () => {
    dispatch({ type: "STAGE4_START" })
  }

  if (isLoading && suggestions.length === 0) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <p className="text-sm text-gray-500">Generating sustainability suggestions for {business.name}...</p>
        {Array.from({ length: 2 }).map((_, gi) => (
          <div key={gi} className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, ci) => (
                <div key={ci} className="p-4 rounded-xl border border-gray-100 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-semibold">Sustainability Suggestions</h3>
        <p className="text-sm text-gray-500">
          Select the actions you want to explore and apply for{" "}
          <span className="font-medium text-gray-700">{business.name}</span>.
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

      <div className="space-y-6">
        {suggestions.map((group, gi) => {
          const impact = selectedImpacts.find((ip) => ip.id === group.impact_point_id)
          return (
            <div key={group.impact_point_id}>
              {gi > 0 && <Separator className="mb-6" />}
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">
                  {group.impact_area}
                </Badge>
                {impact && (
                  <span className="text-xs text-gray-500">{impact.title}</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.actions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    selected={selectedActionIds.has(action.id)}
                    onToggle={() =>
                      dispatch({ type: "TOGGLE_ACTION", payload: action.id })
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Button
        onClick={handleStart}
        disabled={selectedActionIds.size === 0 || isLoading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {`Start Session with ${selectedActionIds.size} action${selectedActionIds.size !== 1 ? "s" : ""}`}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

function ActionCard({
  action,
  selected,
  onToggle,
}: {
  action: SuggestionAction
  selected: boolean
  onToggle: () => void
}) {
  const diff = difficultyConfig[action.difficulty]
  const imp = impactConfig[action.impact]

  return (
    <Card
      onClick={onToggle}
      className={cn(
        "cursor-pointer transition-all duration-200 border-2",
        selected
          ? "border-primary bg-green-50 shadow-md"
          : "border-transparent hover:border-gray-200 hover:shadow-sm"
      )}
    >
      <CardContent className="p-4 space-y-2.5">
        <h4 className="font-semibold text-sm leading-snug">{action.title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={cn("text-xs border", diff.className)}>
            <Zap className="h-2.5 w-2.5 mr-1" />
            {diff.label}
          </Badge>
          <Badge variant="outline" className={cn("text-xs border", imp.className)}>
            <TrendingUp className="h-2.5 w-2.5 mr-1" />
            {imp.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {action.timeline}
          </span>
          <span className="text-primary font-medium">{action.estimated_reduction}</span>
        </div>
      </CardContent>
    </Card>
  )
}
