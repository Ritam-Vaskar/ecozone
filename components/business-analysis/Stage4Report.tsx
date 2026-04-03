"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Download, FileText, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { generatePDF } from "@/lib/generate-pdf"
import type { AnalysisAction, AnalysisState } from "@/types/business-analysis"

interface Props {
  dispatch: React.Dispatch<AnalysisAction>
  state: AnalysisState
  isLoading: boolean
  error: string | null
}

export function Stage4Report({ dispatch, state, error }: Props) {
  const { businessDescription, impactPoints, selectedImpactIds, suggestions, selectedActionIds, chatMessages, reportData } = state

  const selectedImpacts = impactPoints.filter((ip) => selectedImpactIds.has(ip.id))
  const selectedSuggestions = suggestions.map((sg) => ({
    ...sg,
    actions: sg.actions.filter((a) => selectedActionIds.has(a.id)),
  })).filter((sg) => sg.actions.length > 0)

  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = { role: "user" as const, content: chatInput.trim() }
    dispatch({ type: "ADD_CHAT_MESSAGE", payload: userMsg })
    setChatInput("")
    setChatLoading(true)
    try {
      const res = await fetch("/api/business-analysis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: businessDescription,
          selectedImpacts,
          selectedSuggestions,
          messages: [...chatMessages, userMsg],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      dispatch({ type: "ADD_CHAT_MESSAGE", payload: json.data })
    } catch (e: any) {
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: { role: "assistant", content: `Sorry, I encountered an error: ${e.message}` },
      })
    } finally {
      setChatLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    setReportLoading(true)
    dispatch({ type: "CLEAR_ERROR" })
    try {
      const chatContext =
        chatMessages.length > 0
          ? chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n")
          : undefined
      const res = await fetch("/api/business-analysis/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: businessDescription,
          selectedImpacts,
          selectedSuggestions,
          chatContext,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      dispatch({ type: "STAGE4_REPORT_SUCCESS", payload: json.data })
    } catch (e: any) {
      dispatch({ type: "SET_ERROR", payload: e.message ?? "Failed to generate report" })
    } finally {
      setReportLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!reportData) return
    setPdfLoading(true)
    try {
      await generatePDF(reportData)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-semibold">Explore & Report</h3>
        <p className="text-sm text-gray-500">
          Chat with your sustainability advisor or generate a downloadable report.
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

      <Tabs defaultValue="session">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="session">Session</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* ── Chat Session ───────────────────────────────────── */}
        <TabsContent value="session" className="space-y-3">
          <ScrollArea className="h-[340px] rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div ref={scrollRef} className="space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  Ask anything about your sustainability plan — implementation steps, costs, resources, and more.
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about your sustainability plan..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={chatLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || chatLoading}
              size="icon"
              className="bg-primary hover:bg-primary/90 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* ── Report ─────────────────────────────────────────── */}
        <TabsContent value="report" className="space-y-4">
          {!reportData ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Ready to generate your report</p>
                <p className="text-sm text-gray-500 mt-1">
                  Based on {selectedImpacts.length} impact area{selectedImpacts.length !== 1 ? "s" : ""} and{" "}
                  {selectedSuggestions.flatMap((s) => s.actions).length} selected action{selectedSuggestions.flatMap((s) => s.actions).length !== 1 ? "s" : ""}.
                </p>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {reportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Compiling report...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Full Report
                  </>
                )}
              </Button>
            </div>
          ) : (
            <ReportView
              report={reportData}
              onDownload={handleDownloadPDF}
              pdfLoading={pdfLoading}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Report View ─────────────────────────────────────────────────────────────

function ReportView({
  report,
  onDownload,
  pdfLoading,
}: {
  report: NonNullable<AnalysisState["reportData"]>
  onDownload: () => void
  pdfLoading: boolean
}) {
  const severityColor = { high: "text-red-600", medium: "text-amber-600", low: "text-green-600" }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="font-bold text-base">{report.business.name}</h4>
          <p className="text-xs text-gray-500">
            {report.business.industry} · {new Date(report.analysis_date).toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={onDownload}
          disabled={pdfLoading}
          variant="outline"
          size="sm"
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          {pdfLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>

      {/* Estimated reduction callout */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-xs text-green-600 font-medium mb-0.5">Estimated Total Reduction Potential</p>
        <p className="text-lg font-bold text-primary">{report.estimated_total_reduction}</p>
      </div>

      <Separator />

      <div>
        <h5 className="font-semibold text-sm mb-2">Executive Summary</h5>
        <p className="text-sm text-gray-600 leading-relaxed">{report.executive_summary}</p>
      </div>

      <Separator />

      <div>
        <h5 className="font-semibold text-sm mb-3">Impact Areas</h5>
        <div className="space-y-2">
          {report.impact_points.map((ip) => (
            <div key={ip.id} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "text-xs font-bold uppercase mt-0.5 shrink-0",
                  severityColor[ip.severity]
                )}
              >
                {ip.severity}
              </span>
              <div>
                <p className="text-sm font-medium">{ip.title}</p>
                <p className="text-xs text-gray-500">{ip.estimated_impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h5 className="font-semibold text-sm mb-3">Action Plan</h5>
        <div className="space-y-3">
          {report.action_plan.map((group) => (
            <div key={group.impact_point_id}>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs mb-2">
                {group.impact_area}
              </Badge>
              <div className="space-y-1.5 ml-1">
                {group.actions.map((action) => (
                  <Card key={action.id} className="border-gray-100">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{action.timeline} · {action.estimated_reduction}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h5 className="font-semibold text-sm mb-2">Next Steps</h5>
        <ol className="space-y-1.5">
          {report.next_steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-gray-600">
              <span className="font-bold text-primary shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
