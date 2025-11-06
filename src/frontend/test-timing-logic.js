// Simple test of the timing logic
const mockRouterResponse = {
  model_type: "lightweight-model",
  output: "Router response",
  prompt_tokens: 50,
  completion_tokens: 25,
  total_tokens: 75,
  server_processing_ms: 150
}

const mockBenchmarkResponse = {
  model_type: "premium-model", 
  output: "Benchmark response",
  prompt_tokens: 50,
  completion_tokens: 40,
  total_tokens: 90,
  server_processing_ms: 300
}

// Simulate the timing calculation
function simulateResponseTiming(serverProcessingMs, totalRequestMs) {
  const networkMs = Math.max(0, totalRequestMs - serverProcessingMs)
  return {
    response_time_ms: totalRequestMs,
    network_ms: networkMs,
    server_processing_ms: serverProcessingMs
  }
}

// Test different scenarios
console.log('=== Router Response (Fast) ===')
const routerTiming = simulateResponseTiming(150, 200) // 50ms network
console.log(routerTiming)

console.log('=== Benchmark Response (Slow) ===') 
const benchmarkTiming = simulateResponseTiming(300, 400) // 100ms network
console.log(benchmarkTiming)

console.log('=== Speed Comparison ===')
const speedMultiplier = benchmarkTiming.response_time_ms / routerTiming.response_time_ms
console.log(`Router is ${speedMultiplier.toFixed(1)}x faster`)
console.log(`Time saved: ${benchmarkTiming.response_time_ms - routerTiming.response_time_ms}ms`)

export { simulateResponseTiming }