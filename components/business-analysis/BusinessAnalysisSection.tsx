"use client"

import { useReducer } from "react"
import { analysisReducer, initialState } from "./analysisReducer"
import { AnalysisFlowMap } from "./AnalysisFlowMap"
import { Stage1Describe } from "./Stage1Describe"
import { Stage2ImpactPoints } from "./Stage2ImpactPoints"
import { Stage3Suggestions } from "./Stage3Suggestions"
import { Stage4Report } from "./Stage4Report"

export function BusinessAnalysisSection() {
  const [state, dispatch] = useReducer(analysisReducer, initialState)

  const selectedImpacts = state.impactPoints.filter((ip) =>
    state.selectedImpactIds.has(ip.id)
  )

  const selectedSuggestions = state.suggestions
    .map((sg) => ({
      ...sg,
      actions: sg.actions.filter((a) => state.selectedActionIds.has(a.id)),
    }))
    .filter((sg) => sg.actions.length > 0)

  return (
    <section className="bg-green-50 py-12 md:py-24" id="quick-analysis">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 mb-3">
            AI-Powered · No account required
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-3">
            Quick Business Analysis
          </h2>
          <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
            Get a personalised sustainability roadmap for your business in minutes. Identify your
            carbon impact areas and get actionable suggestions — free.
          </p>
        </div>

        {/* Flow map */}
        <AnalysisFlowMap stages={state.stages} currentStage={state.currentStage} />

        {/* Stage panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:p-8">
          {state.currentStage === 1 && (
            <Stage1Describe
              dispatch={dispatch}
              userInput={state.userInput}
              businessDescription={state.businessDescription}
              isLoading={state.isLoading}
              error={state.error}
            />
          )}

          {state.currentStage === 2 && (
            <Stage2ImpactPoints
              dispatch={dispatch}
              business={state.businessDescription!}
              impactPoints={state.impactPoints}
              selectedImpactIds={state.selectedImpactIds}
              isLoading={state.isLoading}
              error={state.error}
            />
          )}

          {state.currentStage === 3 && (
            <Stage3Suggestions
              dispatch={dispatch}
              business={state.businessDescription!}
              selectedImpacts={selectedImpacts}
              suggestions={state.suggestions}
              selectedActionIds={state.selectedActionIds}
              isLoading={state.isLoading}
              error={state.error}
            />
          )}

          {state.currentStage === 4 && (
            <Stage4Report
              dispatch={dispatch}
              state={state}
              isLoading={state.isLoading}
              error={state.error}
            />
          )}
        </div>
      </div>
    </section>
  )
}
