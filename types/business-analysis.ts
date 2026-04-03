// Stage 1
export interface BusinessDescription {
  name: string
  industry: string
  description: string
  size: "startup" | "sme" | "enterprise"
  operations: string[]
  products_services: string[]
  locations: string[]
}

// Stage 2
export interface ImpactPoint {
  id: string
  area: string
  title: string
  description: string
  severity: "high" | "medium" | "low"
  estimated_impact: string
}

export interface ImpactPointsResponse {
  impact_points: ImpactPoint[]
}

// Stage 3
export interface SuggestionAction {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  impact: "high" | "medium" | "low"
  estimated_reduction: string
  timeline: string
}

export interface SuggestionGroup {
  impact_point_id: string
  impact_area: string
  actions: SuggestionAction[]
}

export interface SuggestionsResponse {
  suggestions: SuggestionGroup[]
}

// Stage 4
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ReportData {
  business: BusinessDescription
  analysis_date: string
  executive_summary: string
  impact_points: ImpactPoint[]
  action_plan: SuggestionGroup[]
  estimated_total_reduction: string
  next_steps: string[]
}

export interface ReportOutput {
  report: ReportData
}

// Analysis flow state
export type StageStatus = "pending" | "active" | "complete"

export interface AnalysisState {
  currentStage: 1 | 2 | 3 | 4
  stages: {
    1: StageStatus
    2: StageStatus
    3: StageStatus
    4: StageStatus
  }
  userInput: string
  businessDescription: BusinessDescription | null
  impactPoints: ImpactPoint[]
  selectedImpactIds: Set<string>
  suggestions: SuggestionGroup[]
  selectedActionIds: Set<string>
  chatMessages: ChatMessage[]
  reportData: ReportData | null
  isLoading: boolean
  error: string | null
}

export type AnalysisAction =
  | { type: "SET_INPUT"; payload: string }
  | { type: "STAGE1_START" }
  | { type: "STAGE1_SUCCESS"; payload: BusinessDescription }
  | { type: "EDIT_DESCRIPTION"; payload: Partial<BusinessDescription> }
  | { type: "RESET_TO_INPUT" }
  | { type: "STAGE2_START" }
  | { type: "STAGE2_SUCCESS"; payload: ImpactPoint[] }
  | { type: "TOGGLE_IMPACT"; payload: string }
  | { type: "STAGE3_START" }
  | { type: "STAGE3_SUCCESS"; payload: SuggestionGroup[] }
  | { type: "TOGGLE_ACTION"; payload: string }
  | { type: "STAGE4_START" }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "STAGE4_REPORT_SUCCESS"; payload: ReportData }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
