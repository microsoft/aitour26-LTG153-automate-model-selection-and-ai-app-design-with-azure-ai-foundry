import { ModelResponse } from '@/utils/api/apiWrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Clock, Wifi } from 'lucide-react'

interface LatencyComparisonProps {
  routerResult: ModelResponse | null
  benchmarkResult: ModelResponse | null
}

export function LatencyComparison({ routerResult, benchmarkResult }: LatencyComparisonProps) {
  if (!routerResult || !benchmarkResult) {
    return null
  }

  const routerTime = routerResult.response_time_ms || routerResult.server_processing_ms || 0
  const benchmarkTime = benchmarkResult.response_time_ms || benchmarkResult.server_processing_ms || 0
  
  if (routerTime === 0 && benchmarkTime === 0) {
    return null
  }

  const maxTime = Math.max(routerTime, benchmarkTime, 1)
  const timeDifference = benchmarkTime - routerTime
  const isFaster = timeDifference > 0
  const speedMultiplier = isFaster ? (benchmarkTime / routerTime) : (routerTime / benchmarkTime)
  const speedPercentage = isFaster ? ((timeDifference / benchmarkTime) * 100) : (-(timeDifference / routerTime) * 100)

  return (
  <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-800">
          <Zap className="h-5 w-5 text-yellow-500" />
          Latency Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
            isFaster
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className="text-2xl font-semibold">{speedMultiplier.toFixed(1)}x</span>
            <div className="text-sm leading-tight">
              <div className="font-medium">
                {isFaster
                  ? 'Router is faster'
                  : 'Benchmark is faster'}
              </div>
              <div className="text-xs text-slate-600">
                {isFaster
                  ? `${timeDifference.toFixed(0)} ms saved`
                  : `${Math.abs(timeDifference).toFixed(0)} ms slower`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm text-slate-600">
            <div className="rounded-md bg-white/60 px-3 py-2">
              <div className="text-xs uppercase tracking-wide">Speed</div>
              <div className={`text-sm font-semibold ${
                isFaster ? 'text-green-700' : 'text-red-700'
              }`}>
                {isFaster ? '+' : ''}{speedPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-md bg-white/60 px-3 py-2">
              <div className="text-xs uppercase tracking-wide">Time</div>
              <div className={`text-sm font-semibold ${
                isFaster ? 'text-green-700' : 'text-red-700'
              }`}>
                {isFaster ? '+' : ''}{timeDifference.toFixed(0)}ms
              </div>
            </div>
            <div className="rounded-md bg-white/60 px-3 py-2">
              <div className="text-xs uppercase tracking-wide">Faster</div>
              <div className="text-sm font-semibold text-blue-700">
                {isFaster ? 'Router' : 'Benchmark'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Router Timing */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Model Router
                </Badge>
              </div>
              <span className="text-sm font-medium">{routerTime.toFixed(1)} ms</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(routerTime / maxTime) * 100}%` }}
              />
            </div>
            {routerResult.server_processing_ms && routerResult.network_ms && (
              <div className="flex gap-4 text-xs text-slate-600 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Server: {routerResult.server_processing_ms}ms
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Network: {routerResult.network_ms.toFixed(1)}ms
                </div>
              </div>
            )}
          </div>

          {/* Benchmark Timing */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Benchmark
                </Badge>
              </div>
              <span className="text-sm font-medium">{benchmarkTime.toFixed(1)} ms</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(benchmarkTime / maxTime) * 100}%` }}
              />
            </div>
            {benchmarkResult.server_processing_ms && benchmarkResult.network_ms && (
              <div className="flex gap-4 text-xs text-slate-600 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Server: {benchmarkResult.server_processing_ms}ms
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Network: {benchmarkResult.network_ms.toFixed(1)}ms
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}