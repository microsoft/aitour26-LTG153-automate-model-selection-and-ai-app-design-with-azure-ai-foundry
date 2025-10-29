import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, AlertCircle, Clock, DollarSign, Target, Zap, Loader2, CheckCircle2, XCircle, Download, FileText, HelpCircle } from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { modelRouterApi, createApiWrapper, DatasetEvaluationJobStatus, DatasetEvaluationResults } from '@/utils/api/apiWrapper'

const ROUTER_CLASSIFICATION_INPUT_RATE = 0.14

// Mock data structure
interface DatasetResult {
  id: string
  prompt: string
  mrResponse: string
  bmResponse: string
  mrLatency: number
  bmLatency: number
  mrCost: number | null
  bmCost: number | null
  mrAccuracy: number
  bmAccuracy: number
  mrWarning?: string
  bmWarning?: string
  mrRoutingCost?: number
  bmRoutingCost?: number
}

// Real evaluation data from actual test run
const REAL_EVALUATION_DATA = [
  {
    prompt: "Extract invoice totals and vendor names from the accounting system. Context Data: [ { \"vendor\": \"Acme Corp\", \"date\": \"2025-08-15\", \"invoice_id\": \"INV-2025-001\", \"items\": [ {\"description\": \"Graphene Mesh Rolls\", \"quantity\": 10, \"price\": 1200.00}, {\"description\": \"Conductive Silver Yarn\", \"quantity\": 5, \"price\": 100.00} ], \"total\": 12500.00 }, { \"vendor\": \"BlueSky Ltd\", \"date\": \"2025-08-18\", \"invoice_id\": \"BS-2025-483\", \"items\": [ {\"description\": \"Logistics & Shipping\", \"quantity\": 1, \"price\": 8200.00} ], \"total\": 8200.00 }, { \"vendor\": \"Zava Supplies\", \"date\": \"2025-08-20\", \"invoice_id\": \"ZS-2025-912\", \"items\": [ {\"description\": \"Lab Coats\", \"quantity\": 50, \"price\": 50.00}, {\"description\": \"Safety Goggles\", \"quantity\": 50, \"price\": 19.00} ], \"total\": 3450.00 } ]",
    mrLatency: 2896,
    bmLatency: 8160,
    mrCost: 0.000342,
    bmCost: 0.005296,
    mrAccuracy: 72,
    bmAccuracy: 68,
    mrRoutingCost: 0.000044,
    bmRoutingCost: 0
  },
  {
    prompt: "Flag any expense reports with out-of-policy items for review from the Expense reporting system. Context Data: [ {\"report_id\": 1041, \"employee_id\": \"E123\", \"item\": \"Airfare\", \"amount\": 450.00, \"has_receipt\": true, \"policy_max\": 600.00}, {\"report_id\": 1042, \"employee_id\": \"E456\", \"item\": \"Hotel\", \"amount\": 1200.00, \"has_receipt\": true, \"policy_max\": 900.00}, {\"report_id\": 1043, \"employee_id\": \"E123\", \"item\": \"Meal\", \"amount\": 75.00, \"has_receipt\": true, \"policy_max\": 100.00}, {\"report_id\": 1055, \"employee_id\": \"E789\", \"item\": \"Meal\", \"amount\": 350.00, \"has_receipt\": false, \"policy_max\": 100.00} ]",
    mrLatency: 3192,
    bmLatency: 7959,
    mrCost: 0.000381,
    bmCost: 0.008035,
    mrAccuracy: 82,
    bmAccuracy: 82,
    mrRoutingCost: 0.000032,
    bmRoutingCost: 0
  },
  {
    prompt: "Perform a multi-step financial analysis: (1) Clean and aggregate the historical sales data by region and product line, (2) detect any outliers or anomalous spikes with justification, (3) generate a quarterly revenue forecast for the next two quarters using at least two comparative methods (e.g., moving average vs. year-over-year trend), (4) quantify forecast confidence with an explanation of assumptions (seasonality, growth drivers), and (5) list three strategic actions Finance leadership should consider based on the projection. Context Data: Region,Product_Line,Q1_2024,Q2_2024,Q3_2024,Q4_2023,Q3_2023,Q2_2023 North America,Software,1200000,1350000,1480000,1100000,1250000,1180000 North America,Hardware,800000,750000,820000,850000,780000,720000 Europe,Software,950000,1020000,1150000,900000,980000,920000 Europe,Hardware,650000,680000,720000,620000,640000,610000 Asia Pacific,Software,780000,850000,920000,750000,800000,760000 Asia Pacific,Hardware,520000,560000,580000,500000,530000,510000 Latin America,Software,320000,380000,420000,300000,340000,310000 Latin America,Hardware,210000,230000,250000,200000,220000,205000",
    mrLatency: 60633,
    bmLatency: 112847,
    mrCost: 0.011325,
    bmCost: 0.112214,
    mrAccuracy: 64,
    bmAccuracy: 72,
    mrRoutingCost: 0.000049,
    bmRoutingCost: 0
  },
  {
    prompt: "Conduct a structured regulatory review of the SEC filing excerpt: (1) Extract and categorize all risk statements (privacy, cybersecurity, litigation, financial reporting), (2) identify any implicit (unstated but inferred) compliance vulnerabilities, (3) map each finding to likely regulatory frameworks (e.g., SOX, GDPR, SEC disclosure obligations) with rationale, (4) prioritize risks by potential impact and likelihood, and (5) recommend remediation steps with owners and 30/60/90 day milestones. Flag any ambiguous disclosure gaps; cite the originating clause. Provide a final compliance risk register with severity scoring and rationale...",
    mrLatency: 17524,
    bmLatency: 120702,
    mrCost: 0.001607,
    bmCost: 0.079121,
    mrAccuracy: 78,
    bmAccuracy: 85,
    mrRoutingCost: 0.000065,
    bmRoutingCost: 0
  },
  {
    prompt: "Analyze sentiment of the recent social media mentions about our company. Context Data: [ {\"id\": 1, \"platform\": \"Twitter\", \"text\": \"Love Zava's new update! The ThermoCore Baselayer is a game-changer for winter sports.\"}, {\"id\": 2, \"platform\": \"Twitter\", \"text\": \"Just got my Auracore-enabled running shorts. The real-time data is incredible. #zava #smartfabric\"}, {\"id\": 3, \"platform\": \"Twitter\", \"text\": \"Customer service at Zava was super helpful when I had a question about my order. 10/10.\"}, {\"id\": 4, \"platform\": \"Twitter\", \"text\": \"My Zava smart shirt is having trouble syncing with the app. A bit frustrating.\"}, {\"id\": 5, \"platform\": \"Twitter\", \"text\": \"The new Zava home sensor is okay, but the setup was more complicated than I expected.\"} ]",
    mrLatency: 9120,
    bmLatency: 23713,
    mrCost: 0.001430,
    bmCost: 0.012053,
    mrAccuracy: 93,
    bmAccuracy: 97,
    mrRoutingCost: 0.000032,
    bmRoutingCost: 0
  },
  {
    prompt: "Summarize the performance of last month's email campaign from the marketing database. Context Data: campaign_id,subject_line,segment,sent,opens,clicks,conversions C001,Last Chance for 20% Off,Retail customers,10000,4200,850,120 C002,Introducing the New Auracore Line,All subscribers,50000,15000,3000,300 C003,A Special Offer for Our Loyal Customers,Frequent buyers,5000,2500,750,150 C004,Your Weekly Health Insights,Smart home users,20000,6000,1000,50",
    mrLatency: 5361,
    bmLatency: 33856,
    mrCost: 0.000401,
    bmCost: 0.026504,
    mrAccuracy: 82,
    bmAccuracy: 97,
    mrRoutingCost: 0.000021,
    bmRoutingCost: 0
  },
  {
    prompt: "Execute an advanced segmentation workflow: (1) Normalize and group customers by purchase frequency, recency, and monetary value, (2) calculate RFM-style tiers, (3) enrich segments with demographic overlays (age band, geography), (4) identify at least two emerging micro-segments with growth potential and explain detection criteria, and (5) output a tabular summary plus a strategic narrative recommending tailored engagement tactics for each top segment...",
    mrLatency: 19868,
    bmLatency: 160818,
    mrCost: 0.001440,
    bmCost: 0.099151,
    mrAccuracy: 64,
    bmAccuracy: 84,
    mrRoutingCost: 0.000030,
    bmRoutingCost: 0
  },
  {
    prompt: "Perform a multi-layer brand reputation assessment with traceable justification for each inference: (1) Extract sentiment and classify posts into themes (logistics, quality, pricing, support), (2) detect any accelerating negative trend with supporting evidence, (3) correlate negative clusters with potential root causes, (4) propose a prioritized mitigation playbook (immediate / short-term / medium-term), and (5) draft two executive summary bullets suitable for a quarterly board slide...",
    mrLatency: 24117,
    bmLatency: 65183,
    mrCost: 0.001726,
    bmCost: 0.036021,
    mrAccuracy: 72,
    bmAccuracy: 84,
    mrRoutingCost: 0.000038,
    bmRoutingCost: 0
  },
  {
    prompt: "Summarize and categorize incoming bug reports from the issue tracking system. Context Data: [ {\"id\": \"BUG-001\", \"title\": \"Login button unresponsive on mobile\", \"description\": \"When using the app on a mobile device, the login button does not respond to taps.\", \"type\": \"UI\"}, {\"id\": \"BUG-002\", \"title\": \"App crashes on startup\", \"description\": \"The app crashes immediately after opening on Android 13.\", \"type\": \"Performance\"}, {\"id\": \"BUG-003\", \"title\": \"Password reset link is broken\", \"description\": \"The link sent to reset a password leads to a 404 page.\", \"type\": \"Security\"}, {\"id\": \"BUG-004\", \"title\": \"Incorrect data displayed on dashboard\", \"description\": \"The dashboard is showing data from the previous day.\", \"type\": \"Performance\"}, {\"id\": \"BUG-005\", \"title\": \"Text overlaps on the settings page\", \"description\": \"On the settings page, some of the text labels overlap with the input fields.\", \"type\": \"UI\"} ]",
    mrLatency: 7760,
    bmLatency: 13508,
    mrCost: 0.001270,
    bmCost: 0.011933,
    mrAccuracy: 82,
    bmAccuracy: 62,
    mrRoutingCost: 0.000035,
    bmRoutingCost: 0
  },
  {
    prompt: "Cluster feature requests by theme and urgency from the product backlog data. Context Data: [ {\"id\": \"FR-001\", \"request\": \"Please add a dark mode to the app. It would be much easier on the eyes at night.\"}, {\"id\": \"FR-002\", \"request\": \"I'd love to be able to pay with Apple Pay.\"}, {\"id\": \"FR-003\", \"request\": \"The mobile app needs an offline mode. I often use it in places with no internet connection.\"}, {\"id\": \"FR-004\", \"request\": \"Can you add support for more payment options, like PayPal?\"}, {\"id\": \"FR-005\", \"request\": \"A widget for the home screen would be amazing.\"} ]",
    mrLatency: 8134,
    bmLatency: 20727,
    mrCost: 0.001355,
    bmCost: 0.016141,
    mrAccuracy: 80,
    bmAccuracy: 68,
    mrRoutingCost: 0.000025,
    bmRoutingCost: 0
  },
  {
    prompt: "Construct a comprehensive launch program: (1) Parse the notes to identify key milestones and dependencies, (2) develop a phased timeline (alpha, beta, GA) with critical path justification, (3) enumerate operational, technical, regulatory, and market risks with probability/impact scoring, (4) propose mitigation and contingency triggers, (5) define 5 KPIs for post-launch success monitoring with measurement approaches, and (6) provide an executive summary for leadership approval...",
    mrLatency: 14126,
    bmLatency: 140178,
    mrCost: 0.001199,
    bmCost: 0.077425,
    mrAccuracy: 72,
    bmAccuracy: 86,
    mrRoutingCost: 0.000054,
    bmRoutingCost: 0
  },
  {
    prompt: "Deliver a comparative intelligence brief: (1) Build a feature matrix contrasting Zava vs each competitor (coverage, differentiation, gaps), (2) assess strategic positioning (price/value, ecosystem openness, data privacy posture), (3) infer likely competitor countermoves over the next two quarters, (4) recommend 3 offensive and 3 defensive strategic actions for Zava with rationale, and (5) produce a concise exec summary highlighting sustainable differentiators...",
    mrLatency: 24951,
    bmLatency: 97897,
    mrCost: 0.002742,
    bmCost: 0.038975,
    mrAccuracy: 79,
    bmAccuracy: 83,
    mrRoutingCost: 0.000049,
    bmRoutingCost: 0
  }
]

// Generate mock data for default display using real evaluation data
function generateMockResults(): DatasetResult[] {
  return REAL_EVALUATION_DATA.map((data, index) => ({
    id: `mock-${index}`,
    prompt: data.prompt,
    mrResponse: "Model Router Response - " + data.prompt.substring(0, 30) + "...",
    bmResponse: "Benchmark Model Response - " + data.prompt.substring(0, 30) + "...",
    mrLatency: data.mrLatency,
    bmLatency: data.bmLatency,
    mrCost: data.mrCost,
    bmCost: data.bmCost,
    mrAccuracy: data.mrAccuracy,
    bmAccuracy: data.bmAccuracy,
    mrRoutingCost: data.mrRoutingCost || 0,
    bmRoutingCost: data.bmRoutingCost || 0
  }))
}

export default function DatasetEvaluationPage() {
  const { toast } = useToast()
  const apiWrapper = createApiWrapper(toast)
  const pollingIntervalRef = useRef<number | null>(null)

  const [offlineMode, setOfflineMode] = useState(false)
  const [results, setResults] = useState<DatasetResult[]>(generateMockResults())
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Real evaluation state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<DatasetEvaluationJobStatus | null>(null)
  const [evaluationResults, setEvaluationResults] = useState<DatasetEvaluationResults | null>(null)
  const [showMockData, setShowMockData] = useState(true)

  // Check for offline mode
  useEffect(() => {
    const checkOfflineMode = () => {
      const isOffline = sessionStorage.getItem('offlineMode') === 'true'
      setOfflineMode(isOffline)
    }
    checkOfflineMode()
    const interval = setInterval(checkOfflineMode, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Poll for job status
  useEffect(() => {
    if (currentJobId && jobStatus && (jobStatus.status === 'queued' || jobStatus.status === 'processing')) {
      // Start polling
      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const status = await modelRouterApi.getDatasetEvaluationStatus(currentJobId)
          setJobStatus(status)
          
          // If completed or failed, stop polling and fetch results
          if (status.status === 'completed') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            
            // Fetch results
            const results = await modelRouterApi.getDatasetEvaluationResults(currentJobId)
            setEvaluationResults(results)
            setShowMockData(false)
            setIsProcessing(false)
            
            toast({
              title: "Evaluation Complete!",
              description: `Processed ${results.summary.total_rows} prompts successfully.`,
              variant: "default"
            })
          } else if (status.status === 'failed') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            setIsProcessing(false)
            
            toast({
              title: "Evaluation Failed",
              description: status.error_message || "An error occurred during evaluation.",
              variant: "destructive"
            })
          }
        } catch (error) {
          console.error('Error polling job status:', error)
        }
      }, 3000) // Poll every 3 seconds
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }
  }, [currentJobId, jobStatus?.status])

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await modelRouterApi.submitDatasetEvaluation(file)
      
      setCurrentJobId(response.job_id)
      setJobStatus({
        job_id: response.job_id,
        status: 'queued',
        progress: 0,
        total_rows: response.total_rows,
        processed_rows: 0,
        created_at: new Date().toISOString()
      })
      
      toast({
        title: "Evaluation Started",
        description: `Processing ${response.total_rows} prompts. This may take 10-20 minutes.`,
        variant: "default"
      })
    } catch (error: any) {
      setIsProcessing(false)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CSV file",
        variant: "destructive"
      })
    }
  }

  const handleClearData = () => {
    // Clear job and reset to mock data
    setCurrentJobId(null)
    setJobStatus(null)
    setEvaluationResults(null)
    setShowMockData(true)
    setResults(generateMockResults())
    setIsProcessing(false)
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const downloadSampleCSV = () => {
    const sampleCSV = `prompt,ground_truth
"Extract invoice totals and vendor names from the accounting system.

Context Data:
[
  {
    ""vendor"": ""Acme Corp"",
    ""date"": ""2025-08-15"",
    ""invoice_id"": ""INV-2025-001"",
    ""items"": [
      {""description"": ""Graphene Mesh Rolls"", ""quantity"": 10, ""price"": 1200.00},
      {""description"": ""Conductive Silver Yarn"", ""quantity"": 5, ""price"": 100.00}
    ],
    ""total"": 12500.00
  },
  {
    ""vendor"": ""BlueSky Ltd"",
    ""date"": ""2025-08-18"",
    ""invoice_id"": ""BS-2025-483"",
    ""items"": [
      {""description"": ""Logistics & Shipping"", ""quantity"": 1, ""price"": 8200.00}
    ],
    ""total"": 8200.00
  },
  {
    ""vendor"": ""Zava Supplies"",
    ""date"": ""2025-08-20"",
    ""invoice_id"": ""ZS-2025-912"",
    ""items"": [
      {""description"": ""Lab Coats"", ""quantity"": 50, ""price"": 50.00},
      {""description"": ""Safety Goggles"", ""quantity"": 50, ""price"": 19.00}
    ],
    ""total"": 3450.00
  }
]","The invoice data contains the following:

**Vendor Names and Invoice Totals:**
1. Acme Corp - $12,500.00 (Invoice INV-2025-001)
2. BlueSky Ltd - $8,200.00 (Invoice BS-2025-483)
3. Zava Supplies - $3,450.00 (Invoice ZS-2025-912)

**Total across all invoices:** $24,150.00"`
    
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-dataset-evaluation.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate statistics - use real data if available, otherwise mock
  const calculateStats = () => {
    if (evaluationResults && !showMockData) {
      // Use real evaluation results
      return {
        avgMRLatency: evaluationResults.summary.avg_router_latency_ms,
        avgBMLatency: evaluationResults.summary.avg_benchmark_latency_ms,
        totalMRCost: evaluationResults.summary.total_router_cost,
        totalBMCost: evaluationResults.summary.total_benchmark_cost,
        avgMRAccuracy: evaluationResults.summary.avg_router_accuracy || 0,
        avgBMAccuracy: evaluationResults.summary.avg_benchmark_accuracy || 0
      }
    } else if (results.length === 0) {
      return { avgMRLatency: 0, avgBMLatency: 0, totalMRCost: 0, totalBMCost: 0, avgMRAccuracy: 0, avgBMAccuracy: 0 }
    } else {
      // Use mock data
      const avgMRLatency = Math.round(results.reduce((sum, r) => sum + r.mrLatency, 0) / results.length)
      const avgBMLatency = Math.round(results.reduce((sum, r) => sum + r.bmLatency, 0) / results.length)
      const totalMRCost = parseFloat(results.reduce((sum, r) => sum + (r.mrCost ?? 0), 0).toFixed(6))
      const totalBMCost = parseFloat(results.reduce((sum, r) => sum + (r.bmCost ?? 0), 0).toFixed(6))
      const avgMRAccuracy = Math.round(results.reduce((sum, r) => sum + r.mrAccuracy, 0) / results.length)
      const avgBMAccuracy = Math.round(results.reduce((sum, r) => sum + r.bmAccuracy, 0) / results.length)

      return { avgMRLatency, avgBMLatency, totalMRCost, totalBMCost, avgMRAccuracy, avgBMAccuracy }
    }
  }

  const stats = calculateStats()
  const latencySavings = stats.avgBMLatency > 0 ? ((stats.avgBMLatency - stats.avgMRLatency) / stats.avgBMLatency * 100).toFixed(1) : '0'
  const costSavings = stats.totalBMCost > 0 ? ((stats.totalBMCost - stats.totalMRCost) / stats.totalBMCost * 100).toFixed(1) : '0'
  const fallbackModels = evaluationResults && !showMockData
    ? Array.from(new Set(
        evaluationResults.results.reduce<string[]>((models, r) => {
          if (r.router.pricing_warning) {
            models.push(r.router.model_type)
          }
          if (r.benchmark.pricing_warning) {
            models.push(r.benchmark.model_type)
          }
          return models
        }, [])
      ))
    : []
  const hasPricingWarnings = fallbackModels.length > 0

  // Determine what data to display in the table
  const displayData = evaluationResults && !showMockData 
    ? evaluationResults.results.map((r, idx) => ({
        id: `real-${idx}`,
        prompt: r.prompt,
        mrResponse: r.router.output.substring(0, 50) + '...',
        bmResponse: r.benchmark.output.substring(0, 50) + '...',
        mrLatency: r.router.latency_ms,
        bmLatency: r.benchmark.latency_ms,
        mrCost: r.router.cost,
        bmCost: r.benchmark.cost,
        mrAccuracy: r.router.accuracy || 0,
        bmAccuracy: r.benchmark.accuracy || 0,
        mrWarning: r.router.pricing_warning,
        bmWarning: r.benchmark.pricing_warning,
        mrRoutingCost: r.router.cost_breakdown?.router_surcharge || 0,
        bmRoutingCost: r.benchmark.cost_breakdown?.router_surcharge || 0
      }))
    : results

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dataset Evaluation
          </h1>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Upload your own dataset to evaluate Model Router performance against the benchmark model at scale.
        </p>
      </div>

      {/* CSV Format Info & Warnings */}
      <Alert className="bg-blue-50 border-blue-200">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <strong>CSV Format:</strong> Your CSV must have a <code className="bg-blue-100 px-1 rounded">prompt</code> column. 
              Optionally include <code className="bg-blue-100 px-1 rounded">ground_truth</code> for accuracy evaluation.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadSampleCSV}
              className="ml-4"
            >
              <Download className="h-3 w-3 mr-1" />
              Download Sample
            </Button>
          </div>
          
          <Collapsible className="mt-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 p-0 h-auto">
                <HelpCircle className="h-3 w-3 mr-1" />
                View CSV Format Example
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-white rounded-md p-3 border border-blue-200">
                <p className="text-xs font-semibold mb-2 text-slate-700">Example CSV Structure:</p>
                <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto">
{`prompt,ground_truth
"Extract invoice totals from accounting.","Invoice: $45,234.56, Vendor: Acme Corp"
"Analyze sentiment of social media.","Positive sentiment: 68%"
"Summarize Q3 financial performance.","Q3 Revenue: $2.4M (+15% YoY)"`}
                </pre>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p><strong>• prompt:</strong> Required - The text to evaluate with both models</p>
                  <p><strong>• ground_truth:</strong> Optional - Expected answer for accuracy scoring</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </AlertDescription>
      </Alert>

      {/* Limitations & Time Warning */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="space-y-2">
            <p className="font-semibold">⚠️ Important Limitations:</p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li><strong>Maximum 12 rows</strong> per dataset upload</li>
              <li><strong>Processing time:</strong> 20 seconds to 3 minutes per row (depending on complexity and ground truth evaluation)</li>
              <li><strong>Expected duration:</strong> A 12-row dataset may take 4-36 minutes to complete</li>
              <li>Keep this browser tab open during processing</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Job Status Progress */}
      {jobStatus && (
        <Card className={`${
          jobStatus.status === 'completed' ? 'bg-green-50 border-green-200' :
          jobStatus.status === 'failed' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {jobStatus.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : jobStatus.status === 'failed' ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  <h3 className="font-semibold text-lg">
                    {jobStatus.status === 'completed' ? 'Evaluation Complete' :
                     jobStatus.status === 'failed' ? 'Evaluation Failed' :
                     jobStatus.status === 'processing' ? 'Processing Dataset...' :
                     'Queued for Processing'}
                  </h3>
                </div>
                <Badge variant="outline" className={
                  jobStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                  jobStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {jobStatus.status.toUpperCase()}
                </Badge>
              </div>
              
              {jobStatus.status !== 'completed' && jobStatus.status !== 'failed' && (
                <>
                  <Progress value={jobStatus.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Progress: {jobStatus.processed_rows} / {jobStatus.total_rows} prompts</span>
                    <span>{jobStatus.progress}%</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    <strong>Estimated time:</strong> {Math.ceil((jobStatus.total_rows - jobStatus.processed_rows) * 60 / 60)} minutes remaining
                  </p>
                </>
              )}
              
              {jobStatus.status === 'completed' && (
                <p className="text-sm text-green-700">
                  Successfully processed {jobStatus.total_rows} prompts. Results are displayed below.
                </p>
              )}
              
              {jobStatus.status === 'failed' && jobStatus.error_message && (
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {jobStatus.error_message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Upload Dataset
          </CardTitle>
          <CardDescription>
            {offlineMode 
              ? 'File upload is disabled in offline mode. Viewing sample data only.'
              : 'Drag and drop your CSV file or click to browse'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={offlineMode ? undefined : handleDragOver}
            onDragLeave={offlineMode ? undefined : handleDragLeave}
            onDrop={offlineMode ? undefined : handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              offlineMode
                ? 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                : isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            }`}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${
              offlineMode 
                ? 'text-slate-300' 
                : isDragging ? 'text-blue-500' : 'text-slate-400'
            }`} />
            <p className="text-sm font-medium text-slate-700 mb-2">
              {offlineMode 
                ? 'Upload disabled in offline mode'
                : isDragging ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'
              }
            </p>
            {!offlineMode && (
              <>
                <p className="text-xs text-slate-500 mb-4">or</p>
                <label className="cursor-pointer">
                  <Button variant="outline" disabled={isProcessing} asChild>
                    <span>Browse Files</span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
                <p className="text-xs text-slate-500 mt-4">
                  Supported format: CSV with columns for prompts and expected outputs
                </p>
              </>
            )}
          </div>
          <div className="mt-6 text-center">
            {showMockData ? (
              <p className="text-sm text-slate-600">
                Currently showing <strong>sample data</strong>. {offlineMode ? 'Enable live mode to upload your own CSV.' : 'Upload your own CSV to run a real evaluation.'}
              </p>
            ) : evaluationResults ? (
              <div className="space-y-2">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Real evaluation results loaded
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearData}
                  disabled={offlineMode}
                >
                  Start New Evaluation
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Warning Alert */}
      {!showMockData && hasPricingWarnings && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            Fallback pricing was used for: {fallbackModels.join(', ')}. This usually means Azure routed to models that are newer than the ones configured in <code className="px-1 bg-amber-100 rounded">pricing.json</code>. Update that file with the correct rates to keep evaluations accurate.
            <div className="mt-1 text-xs text-amber-700">
              Router classification surcharge ($${ROUTER_CLASSIFICATION_INPUT_RATE.toFixed(2)} per 1M input tokens) is always applied on top of model-specific costs when the router runs.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Table */}
      {displayData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Evaluation Results
              {!showMockData && <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Real Data</Badge>}
              {showMockData && <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">Sample Data</Badge>}
            </CardTitle>
            <CardDescription>
              Comparing Model Router vs Benchmark Model across {displayData.length} prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[200px]">Prompt</TableHead>
                    <TableHead className="text-center">MR Latency</TableHead>
                    <TableHead className="text-center">BM Latency</TableHead>
                    <TableHead className="text-center">MR Cost</TableHead>
                    <TableHead className="text-center">BM Cost</TableHead>
                    <TableHead className="text-center">MR Accuracy</TableHead>
                    <TableHead className="text-center">BM Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.map((result, index) => (
                    <TableRow key={result.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">
                        {result.prompt}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <Badge variant="outline" className="bg-blue-50">
                          {result.mrLatency}ms
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <Badge variant="outline" className="bg-slate-100">
                          {result.bmLatency}ms
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {result.mrCost !== null ? `$${result.mrCost.toFixed(6)}` : '—'}
                          </Badge>
                          {result.mrRoutingCost && result.mrRoutingCost > 0 && (
                            <span className="text-[11px] text-slate-600 leading-tight">
                              + Router classification ${result.mrRoutingCost.toFixed(6)}
                            </span>
                          )}
                          {result.mrWarning && (
                            <span className="text-[11px] text-amber-600 leading-tight max-w-[200px]">
                              {result.mrWarning}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline" className="bg-slate-100">
                            {result.bmCost !== null ? `$${result.bmCost.toFixed(6)}` : '—'}
                          </Badge>
                          {result.bmRoutingCost && result.bmRoutingCost > 0 && (
                            <span className="text-[11px] text-slate-600 leading-tight">
                              + Router classification ${result.bmRoutingCost.toFixed(6)}
                            </span>
                          )}
                          {result.bmWarning && (
                            <span className="text-[11px] text-amber-600 leading-tight max-w-[200px]">
                              {result.bmWarning}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12">
                            <Progress value={result.mrAccuracy} className="h-2" />
                          </div>
                          <span className="text-xs font-medium w-8">{result.mrAccuracy}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12">
                            <Progress value={result.bmAccuracy} className="h-2" />
                          </div>
                          <span className="text-xs font-medium w-8">{result.bmAccuracy}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {displayData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latency Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Latency Summary
                </CardTitle>
                <Badge className="bg-green-100 text-green-800">{latencySavings}% faster</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 mb-1">Model Router (Avg)</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgMRLatency}ms</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-600 mb-1">Benchmark Model (Avg)</p>
                <p className="text-2xl font-bold text-slate-600">{stats.avgBMLatency}ms</p>
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Cost Summary
                </CardTitle>
                <Badge className="bg-green-100 text-green-800">{costSavings}% cheaper</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 mb-1">Model Router (Total)</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalMRCost.toFixed(6)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-600 mb-1">Benchmark Model (Total)</p>
                <p className="text-2xl font-bold text-slate-600">${stats.totalBMCost.toFixed(6)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Accuracy Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 mb-1">Model Router (Avg)</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgMRAccuracy}%</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-600 mb-1">Benchmark Model (Avg)</p>
                <p className="text-2xl font-bold text-slate-600">{stats.avgBMAccuracy}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
