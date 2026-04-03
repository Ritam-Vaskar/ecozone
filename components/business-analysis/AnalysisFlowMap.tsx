"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StageStatus } from "@/types/business-analysis"

interface Props {
  stages: Record<1 | 2 | 3 | 4, StageStatus>
  currentStage: 1 | 2 | 3 | 4
}

const STAGE_LABELS = ["Describe", "Impact Points", "Suggestions", "Report"] as const

export function AnalysisFlowMap({ stages }: Props) {
  return (
    <div className="flex items-start w-full max-w-2xl mx-auto mb-8 px-2">
      {([1, 2, 3, 4] as const).map((n, i) => {
        const status = stages[n]
        return (
          <div key={n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0",
                  status === "pending" &&
                    "bg-gray-100 text-gray-400 border border-gray-200",
                  status === "active" &&
                    "bg-white border-2 border-primary text-primary ring-4 ring-green-100 shadow-sm",
                  status === "complete" && "bg-primary text-white shadow-sm"
                )}
              >
                {status === "complete" ? <Check className="w-4 h-4" /> : n}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center leading-tight hidden sm:block",
                  status === "pending" && "text-gray-400",
                  status === "active" && "text-primary",
                  status === "complete" && "text-green-700"
                )}
              >
                {STAGE_LABELS[i]}
              </span>
            </div>

            {i < 3 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 mb-5 transition-colors duration-500",
                  stages[(n + 1) as 2 | 3 | 4] !== "pending"
                    ? "bg-primary"
                    : "bg-gray-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
