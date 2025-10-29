import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckCircle2, XCircle, AlertCircle, Target, TrendingUp, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { getAuthHeaders } from '@/utils/auth'
import { AccuracyEvaluation } from '@/utils/api/apiWrapper'

interface AccuracyComparisonProps {
  routerEvaluation: AccuracyEvaluation | null | undefined
  benchmarkEvaluation: AccuracyEvaluation | null | undefined
  scenarioId?: string
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-slate-500'
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-blue-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreBadgeVariant(score: number | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score === null) return 'outline'
  if (score >= 90) return 'default'
  if (score >= 75) return 'secondary'
  if (score >= 60) return 'outline'
  return 'destructive'
}

function getScoreLabel(score: number | null): string {
  if (score === null) return 'N/A'
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Adequate'
  if (score >= 40) return 'Poor'
  return 'Failing'
}

export function AccuracyComparison({ 
  routerEvaluation, 
  benchmarkEvaluation,
  scenarioId 
}: AccuracyComparisonProps) {
  const [isGroundTruthOpen, setIsGroundTruthOpen] = useState(false)
  const [groundTruth, setGroundTruth] = useState<{
    expected_answer: string
    evaluation_criteria: string
  } | null>(null)
  
  const hasData = routerEvaluation || benchmarkEvaluation
  const routerScore = routerEvaluation?.score ?? null
  const benchmarkScore = benchmarkEvaluation?.score ?? null
  
  // Fetch ground truth data when scenario ID is available
  useEffect(() => {
    if (scenarioId) {
      const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000'
      fetch(`${BACKEND_URL}/api/ground-truth/${scenarioId}`, {
        headers: getAuthHeaders()
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setGroundTruth(data))
        .catch(err => console.error('Failed to fetch ground truth:', err))
    }
  }, [scenarioId])
  
  // Calculate accuracy advantage
  const accuracyAdvantage = routerScore !== null && benchmarkScore !== null 
    ? routerScore - benchmarkScore 
    : null

  if (!hasData) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Accuracy Comparison</CardTitle>
          </div>
          {scenarioId && (
            <Badge variant="outline" className="font-mono text-xs">
              {scenarioId}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accuracy Advantage Alert */}
        {accuracyAdvantage !== null && Math.abs(accuracyAdvantage) > 5 && (
          <Alert className={accuracyAdvantage > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}>
            <TrendingUp className={`h-4 w-4 ${accuracyAdvantage > 0 ? 'text-green-600' : 'text-blue-600'}`} />
            <AlertDescription className={accuracyAdvantage > 0 ? 'text-green-800' : 'text-blue-800'}>
              <strong>
                {accuracyAdvantage > 0 
                  ? `Router Model: +${accuracyAdvantage.toFixed(1)} points higher accuracy` 
                  : `Benchmark Model: +${Math.abs(accuracyAdvantage).toFixed(1)} points higher accuracy`
                }
              </strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Score Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Router Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-700">Model Router</h4>
              {routerScore !== null ? (
                <Badge variant={getScoreBadgeVariant(routerScore)} className="font-mono">
                  {routerScore}/100
                </Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )}
            </div>
            
            {routerScore !== null && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Quality Rating</span>
                    <span className={`font-medium ${getScoreColor(routerScore)}`}>
                      {getScoreLabel(routerScore)}
                    </span>
                  </div>
                  <Progress value={routerScore} className="h-2" />
                </div>

                {routerEvaluation?.strengths && routerEvaluation.strengths.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Strengths
                    </div>
                    <ul className="text-xs space-y-1 pl-4">
                      {routerEvaluation.strengths.slice(0, 3).map((strength, idx) => (
                        <li key={idx} className="text-slate-600 list-disc">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {routerEvaluation?.weaknesses && routerEvaluation.weaknesses.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-700">
                      <AlertCircle className="h-3 w-3" />
                      Areas for Improvement
                    </div>
                    <ul className="text-xs space-y-1 pl-4">
                      {routerEvaluation.weaknesses.slice(0, 2).map((weakness, idx) => (
                        <li key={idx} className="text-slate-600 list-disc">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {routerEvaluation?.error && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3 w-3" />
                {routerEvaluation.error}
              </div>
            )}
          </div>

          {/* Benchmark Score */}
          <div className="space-y-3 md:border-l md:pl-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-700">Benchmark Model</h4>
              {benchmarkScore !== null ? (
                <Badge variant={getScoreBadgeVariant(benchmarkScore)} className="font-mono">
                  {benchmarkScore}/100
                </Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )}
            </div>
            
            {benchmarkScore !== null && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Quality Rating</span>
                    <span className={`font-medium ${getScoreColor(benchmarkScore)}`}>
                      {getScoreLabel(benchmarkScore)}
                    </span>
                  </div>
                  <Progress value={benchmarkScore} className="h-2" />
                </div>

                {benchmarkEvaluation?.strengths && benchmarkEvaluation.strengths.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Strengths
                    </div>
                    <ul className="text-xs space-y-1 pl-4">
                      {benchmarkEvaluation.strengths.slice(0, 3).map((strength, idx) => (
                        <li key={idx} className="text-slate-600 list-disc">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {benchmarkEvaluation?.weaknesses && benchmarkEvaluation.weaknesses.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-700">
                      <AlertCircle className="h-3 w-3" />
                      Areas for Improvement
                    </div>
                    <ul className="text-xs space-y-1 pl-4">
                      {benchmarkEvaluation.weaknesses.slice(0, 2).map((weakness, idx) => (
                        <li key={idx} className="text-slate-600 list-disc">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {benchmarkEvaluation?.error && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3 w-3" />
                {benchmarkEvaluation.error}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Reasoning Section */}
        {(routerEvaluation?.reasoning || benchmarkEvaluation?.reasoning) && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="font-semibold text-sm text-slate-700">Evaluation Details</h4>
            
            {routerEvaluation?.reasoning && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-600">Router Model Assessment:</div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                  {routerEvaluation.reasoning}
                </p>
              </div>
            )}

            {benchmarkEvaluation?.reasoning && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-600">Benchmark Model Assessment:</div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                  {benchmarkEvaluation.reasoning}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ground Truth Section */}
        {groundTruth && (
          <div className="pt-4 border-t">
            <Collapsible open={isGroundTruthOpen} onOpenChange={setIsGroundTruthOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-slate-50 p-2 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-sm text-slate-700">View Ground Truth Answer</h4>
                </div>
                {isGroundTruthOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">Expected Answer</Badge>
                  </div>
                  <div className="text-xs text-slate-700 bg-blue-50 p-3 rounded border border-blue-100 whitespace-pre-wrap">
                    {groundTruth.expected_answer}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">Evaluation Criteria</Badge>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                    {groundTruth.evaluation_criteria}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
