import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/utils/auth"

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000'

// Model Router API Types
export interface Scenario {
  id: string
  title: string
  prompt: string
  complexity: 'Low' | 'Medium' | 'High'
  qualityExpectation: string
  source_data_file?: string
}

export interface ModelResponse {
  model_type: string
  output: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  server_processing_ms?: number
  response_time_ms?: number
  network_ms?: number
}

export interface AccuracyEvaluation {
  score: number | null
  reasoning: string
  strengths?: string[]
  weaknesses?: string[]
  key_gaps?: string[]
  model_evaluated: string
  error?: string
}

export interface ModelResponseWithAccuracy extends ModelResponse {
  accuracy_evaluation?: AccuracyEvaluation
}

export interface ComparisonResponse {
  router: ModelResponse
  benchmark: ModelResponse
}

export interface AccuracyComparisonResponse {
  scenario_id: string
  router: ModelResponseWithAccuracy
  benchmark: ModelResponseWithAccuracy
  timing: {
    response_generation_ms: number
    accuracy_evaluation_ms: number
    total_ms: number
  }
}

export interface PricingData {
  pricing_info: {
    description: string
    last_updated: string
    currency: string
  }
  models: Record<string, {
    input_per_1m: number
    output_per_1m: number
    description: string
  }>
}

// Dataset Evaluation Types
export interface DatasetEvaluationJobStatus {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  total_rows: number
  processed_rows: number
  created_at: string
  completed_at?: string
  error_message?: string
}

export interface DatasetEvaluationRowResult {
  row_index: number
  prompt: string
  router: {
    model_type: string
    output: string
    latency_ms: number
    prompt_tokens: number
    completion_tokens: number
    cost: number | null
    accuracy?: number
    pricing_warning?: string
    cost_breakdown?: {
      input_cost: number
      output_cost: number
      router_surcharge: number
    }
  }
  benchmark: {
    model_type: string
    output: string
    latency_ms: number
    prompt_tokens: number
    completion_tokens: number
    cost: number | null
    accuracy?: number
    pricing_warning?: string
    cost_breakdown?: {
      input_cost: number
      output_cost: number
      router_surcharge: number
    }
  }
  accuracy_evaluation_time_ms?: number
}

export interface DatasetEvaluationResults {
  job_id: string
  status: string
  completed_at: string
  summary: {
    total_rows: number
    avg_router_latency_ms: number
    avg_benchmark_latency_ms: number
    total_router_cost: number
    total_benchmark_cost: number
    cost_savings_percent: number
    latency_improvement_percent: number
    avg_router_accuracy?: number
    avg_benchmark_accuracy?: number
  }
  results: DatasetEvaluationRowResult[]
}

interface ApiWrapperOptions<TData, TError = any> {
  successMessage?: string | ((data: TData) => string)
  errorMessage?: string | ((error: TError) => string)
  loadingState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
  onError?: (error: TError) => void
  onSuccess?: (data: TData) => void
  onFinally?: () => void
  toastDuration?: number
}

const DEFAULT_TOAST_DURATION = 3000

export const createApiWrapper = (toast: ReturnType<typeof useToast>["toast"]) => {
  return async function apiWrapper<TData, TError = any>(
    operation: () => Promise<TData>,
    options: ApiWrapperOptions<TData, TError> = {}
  ): Promise<TData | null> {
    const {
      successMessage = "Operation completed successfully.",
      errorMessage = "Operation failed. Please try again.",
      loadingState,
      onError,
      onSuccess,
      onFinally,
      toastDuration = DEFAULT_TOAST_DURATION
    } = options

    const [, setIsLoading] = loadingState || [null, () => {}]

    try {
      setIsLoading(true)
      const result = await operation()
      
      toast({
        title: "Success",
        description: typeof successMessage === 'function' ? successMessage(result) : successMessage,
        duration: toastDuration,
        variant: "success"
      })
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      console.error('Operation Error:', error)
      toast({
        title: "Error",
        description: typeof errorMessage === 'function' ? errorMessage(error as TError) : errorMessage,
        variant: "destructive",
        duration: toastDuration,
      })
      
      if (onError) {
        onError(error as TError)
      }
      
      return null
    } finally {
      setIsLoading(false)
      if (onFinally) {
        onFinally()
      }
    }
  }
}

// Model Router API Functions
export const modelRouterApi = {
  async getScenarios(department: string): Promise<Scenario[]> {
    const response = await fetch(`${BACKEND_URL}/api/scenarios/${department}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch scenarios: ${response.statusText}`)
    }
    return response.json()
  },

  async getPricing(): Promise<PricingData> {
    const response = await fetch(`${BACKEND_URL}/api/pricing`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch pricing: ${response.statusText}`)
    }
    return response.json()
  },

  async routePrompt(prompt: string): Promise<ModelResponse> {
    const startTime = performance.now()
    const response = await fetch(`${BACKEND_URL}/api/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ prompt })
    })
    if (!response.ok) {
      throw new Error(`Failed to route prompt: ${response.statusText}`)
    }
    const data = await response.json()
    const endTime = performance.now()
    const responseTimeMs = endTime - startTime
    const networkMs = responseTimeMs - (data.server_processing_ms || 0)
    
    return {
      ...data,
      response_time_ms: responseTimeMs,
      network_ms: Math.max(0, networkMs)
    }
  },

  async routeComparison(prompt: string): Promise<ComparisonResponse> {
    const startTime = performance.now()
    const response = await fetch(`${BACKEND_URL}/api/route-comparison`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ prompt })
    })
    if (!response.ok) {
      throw new Error(`Failed to route comparison: ${response.statusText}`)
    }
    const data = await response.json()
    const endTime = performance.now()
    const responseTimeMs = endTime - startTime
    
    // Add timing data to both router and benchmark results
    const routerNetworkMs = responseTimeMs - (data.router.server_processing_ms || 0)
    const benchmarkNetworkMs = responseTimeMs - (data.benchmark.server_processing_ms || 0)
    
    return {
      router: {
        ...data.router,
        response_time_ms: responseTimeMs,
        network_ms: Math.max(0, routerNetworkMs)
      },
      benchmark: {
        ...data.benchmark,
        response_time_ms: responseTimeMs,
        network_ms: Math.max(0, benchmarkNetworkMs)
      }
    }
  },

  async benchmarkPrompt(prompt: string): Promise<ModelResponse> {
    const startTime = performance.now()
    const response = await fetch(`${BACKEND_URL}/api/benchmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ prompt })
    })
    if (!response.ok) {
      throw new Error(`Failed to get benchmark response: ${response.statusText}`)
    }
    const data = await response.json()
    const endTime = performance.now()
    const responseTimeMs = endTime - startTime
    const networkMs = responseTimeMs - (data.server_processing_ms || 0)
    
    return {
      ...data,
      response_time_ms: responseTimeMs,
      network_ms: Math.max(0, networkMs)
    }
  },

  // New method for truly independent parallel calls
  async routeParallelComparison(
    prompt: string, 
    onRouterComplete?: (result: ModelResponse) => void, 
    onBenchmarkComplete?: (result: ModelResponse) => void
  ): Promise<{ routerPromise: Promise<ModelResponse>, benchmarkPromise: Promise<ModelResponse> }> {
    // Start both requests in parallel with independent timing
    const routerPromise = this.routePrompt(prompt).then(result => {
      if (onRouterComplete) {
        onRouterComplete(result)
      }
      return result
    })

    const benchmarkPromise = this.benchmarkPrompt(prompt).then(result => {
      if (onBenchmarkComplete) {
        onBenchmarkComplete(result)
      }
      return result
    })

    return { routerPromise, benchmarkPromise }
  },

  async accuracyComparison(prompt: string, groundTruth?: string): Promise<AccuracyComparisonResponse> {
    const startTime = performance.now()
    const response = await fetch(`${BACKEND_URL}/api/accuracy-comparison`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ 
        prompt,
        ...(groundTruth && { ground_truth: groundTruth })
      })
    })
    if (!response.ok) {
      throw new Error(`Failed to get accuracy comparison: ${response.statusText}`)
    }
    const data = await response.json()
    const endTime = performance.now()
    const clientResponseTimeMs = endTime - startTime
    
    return {
      ...data,
      timing: {
        ...data.timing,
        client_total_ms: clientResponseTimeMs
      }
    }
  },

  // Dataset Evaluation API
  async submitDatasetEvaluation(file: File): Promise<{ job_id: string; status: string; total_rows: number; message: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${BACKEND_URL}/api/dataset-evaluation/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(error.detail || 'Failed to submit dataset evaluation')
    }
    
    return response.json()
  },

  async getDatasetEvaluationStatus(jobId: string): Promise<DatasetEvaluationJobStatus> {
    const response = await fetch(`${BACKEND_URL}/api/dataset-evaluation/status/${jobId}`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`)
    }
    
    return response.json()
  },

  async getDatasetEvaluationResults(jobId: string): Promise<DatasetEvaluationResults> {
    const response = await fetch(`${BACKEND_URL}/api/dataset-evaluation/results/${jobId}`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(error.detail || 'Failed to get evaluation results')
    }
    
    return response.json()
  },

  async deleteDatasetEvaluationJob(jobId: string): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/api/dataset-evaluation/job/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete job: ${response.statusText}`)
    }
  }
}