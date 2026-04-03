"use client"

import { useState } from "react"
import { ArrowRight, RefreshCw, AlertCircle, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { AnalysisAction, BusinessDescription } from "@/types/business-analysis"

interface Props {
  dispatch: React.Dispatch<AnalysisAction>
  userInput: string
  businessDescription: BusinessDescription | null
  isLoading: boolean
  error: string | null
}

export function Stage1Describe({
  dispatch,
  userInput,
  businessDescription,
  isLoading,
  error,
}: Props) {
  const [localInput, setLocalInput] = useState(userInput)

  const handleAnalyze = async () => {
    dispatch({ type: "STAGE1_START" })
    try {
      const res = await fetch("/api/business-analysis/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: localInput }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      dispatch({ type: "STAGE1_SUCCESS", payload: json.data })
    } catch (e: any) {
      dispatch({ type: "SET_ERROR", payload: e.message ?? "Something went wrong" })
    }
  }

  const handleContinue = async () => {
    dispatch({ type: "STAGE2_START" })
    try {
      const res = await fetch("/api/business-analysis/impacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business: businessDescription }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      dispatch({ type: "STAGE2_SUCCESS", payload: json.data })
    } catch (e: any) {
      // Stage went to 2 already; set error and revert display
      dispatch({ type: "SET_ERROR", payload: e.message ?? "Something went wrong" })
    }
  }

  if (isLoading && !businessDescription) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <p className="text-sm text-gray-500 mb-2">Analyzing your business with web search...</p>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (businessDescription) {
    return (
      <DescriptionEditor
        description={businessDescription}
        dispatch={dispatch}
        onContinue={handleContinue}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-semibold mb-1">Describe Your Business</h3>
        <p className="text-sm text-gray-500">
          Enter a business name, website URL, or a short description.
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

      <Textarea
        placeholder={`e.g. "Nike", "https://patagonia.com", or "outdoor clothing brand selling recycled gear"`}
        value={localInput}
        onChange={(e) => {
          setLocalInput(e.target.value)
          dispatch({ type: "SET_INPUT", payload: e.target.value })
        }}
        className="min-h-[100px] resize-none"
        disabled={isLoading}
      />

      <Button
        onClick={handleAnalyze}
        disabled={localInput.trim().length < 3 || isLoading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        Analyze Business
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

// ── Editable description sub-component ──────────────────────────────────────

interface EditorProps {
  description: BusinessDescription
  dispatch: React.Dispatch<AnalysisAction>
  onContinue: () => void
  isLoading: boolean
  error: string | null
}

function DescriptionEditor({ description, dispatch, onContinue, isLoading, error }: EditorProps) {
  const update = (patch: Partial<BusinessDescription>) =>
    dispatch({ type: "EDIT_DESCRIPTION", payload: patch })

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Business Description</h3>
          <p className="text-sm text-gray-500">Review and edit before continuing.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "RESET_TO_INPUT" })}
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Re-generate
        </Button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            Business Name <Pencil className="h-3 w-3" />
          </Label>
          <Input
            value={description.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            Industry <Pencil className="h-3 w-3" />
          </Label>
          <Input
            value={description.industry}
            onChange={(e) => update({ industry: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
          Description <Pencil className="h-3 w-3" />
        </Label>
        <Textarea
          value={description.description}
          onChange={(e) => update({ description: e.target.value })}
          className="resize-none min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            Size <Pencil className="h-3 w-3" />
          </Label>
          <div className="flex gap-2 flex-wrap">
            {(["startup", "sme", "enterprise"] as const).map((s) => (
              <button
                key={s}
                onClick={() => update({ size: s })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  description.size === s
                    ? "bg-primary text-white border-primary"
                    : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Locations</Label>
          <div className="flex flex-wrap gap-1.5">
            {description.locations.map((loc, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {loc}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">Key Operations</Label>
        <div className="flex flex-wrap gap-1.5">
          {description.operations.map((op, i) => (
            <Badge key={i} className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
              {op}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">Products & Services</Label>
        <div className="flex flex-wrap gap-1.5">
          {description.products_services.map((ps, i) => (
            <Badge key={i} className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
              {ps}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={isLoading || !description.name}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isLoading ? "Identifying Impact Points..." : "Looks right, Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
