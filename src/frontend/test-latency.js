// Test script to verify latency calculations
import { modelRouterApi } from './src/utils/api/apiWrapper'

// Mock fetch for testing
global.fetch = async (url, options) => {
  const mockResponse = {
    model_type: "test-model",
    output: "Test response",
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150,
    server_processing_ms: 200
  }
  
  // Simulate server delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    ok: true,
    json: async () => mockResponse
  }
}

// Mock performance.now()
let mockTime = 1000
global.performance = {
  now: () => {
    mockTime += 100 // Each call adds 100ms
    return mockTime
  }
}

async function testLatencyCalculation() {
  console.log('Testing latency calculation...')
  
  const result = await modelRouterApi.routePrompt("test prompt")
  
  console.log('Result:', {
    server_processing_ms: result.server_processing_ms,
    response_time_ms: result.response_time_ms,
    network_ms: result.network_ms
  })
  
  // Expected: response_time_ms should be ~300ms total time
  // network_ms should be response_time_ms - server_processing_ms
  const expectedNetworkMs = (result.response_time_ms || 0) - (result.server_processing_ms || 0)
  
  console.log('Expected network latency:', expectedNetworkMs)
  console.log('Actual network latency:', result.network_ms)
  console.log('Test passed:', Math.abs((result.network_ms || 0) - expectedNetworkMs) < 1)
}

export { testLatencyCalculation }