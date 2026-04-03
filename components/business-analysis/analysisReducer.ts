import type { AnalysisState, AnalysisAction } from "@/types/business-analysis"

export const initialState: AnalysisState = {
  currentStage: 1,
  stages: { 1: "active", 2: "pending", 3: "pending", 4: "pending" },
  userInput: "",
  businessDescription: null,
  impactPoints: [],
  selectedImpactIds: new Set(),
  suggestions: [],
  selectedActionIds: new Set(),
  chatMessages: [],
  reportData: null,
  isLoading: false,
  error: null,
}

export function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, userInput: action.payload }

    case "STAGE1_START":
      return { ...state, isLoading: true, error: null }

    case "STAGE1_SUCCESS":
      return {
        ...state,
        isLoading: false,
        businessDescription: action.payload,
      }

    case "EDIT_DESCRIPTION":
      if (!state.businessDescription) return state
      return {
        ...state,
        businessDescription: { ...state.businessDescription, ...action.payload },
      }

    case "RESET_TO_INPUT":
      return {
        ...state,
        businessDescription: null,
        error: null,
      }

    case "STAGE2_START":
      return {
        ...state,
        isLoading: true,
        error: null,
        stages: { ...state.stages, 1: "complete", 2: "active" },
        currentStage: 2,
        impactPoints: [],
        selectedImpactIds: new Set(),
      }

    case "STAGE2_SUCCESS":
      return {
        ...state,
        isLoading: false,
        impactPoints: action.payload,
      }

    case "TOGGLE_IMPACT": {
      const next = new Set(state.selectedImpactIds)
      if (next.has(action.payload)) next.delete(action.payload)
      else next.add(action.payload)
      return { ...state, selectedImpactIds: next }
    }

    case "STAGE3_START":
      return {
        ...state,
        isLoading: true,
        error: null,
        stages: { ...state.stages, 2: "complete", 3: "active" },
        currentStage: 3,
        suggestions: [],
        selectedActionIds: new Set(),
      }

    case "STAGE3_SUCCESS":
      return {
        ...state,
        isLoading: false,
        suggestions: action.payload,
      }

    case "TOGGLE_ACTION": {
      const next = new Set(state.selectedActionIds)
      if (next.has(action.payload)) next.delete(action.payload)
      else next.add(action.payload)
      return { ...state, selectedActionIds: next }
    }

    case "STAGE4_START":
      return {
        ...state,
        isLoading: false,
        error: null,
        stages: { ...state.stages, 3: "complete", 4: "active" },
        currentStage: 4,
      }

    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      }

    case "STAGE4_REPORT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        reportData: action.payload,
        stages: { ...state.stages, 4: "complete" },
      }

    case "SET_ERROR":
      return { ...state, isLoading: false, error: action.payload }

    case "CLEAR_ERROR":
      return { ...state, error: null }

    default:
      return state
  }
}
