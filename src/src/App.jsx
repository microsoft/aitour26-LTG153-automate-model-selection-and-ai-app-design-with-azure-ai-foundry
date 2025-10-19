import React, { useState, useEffect, useMemo } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Grid, Select, MenuItem,
  Card, CardContent, Button, TextField, Paper, Box, CssBaseline, CircularProgress, useMediaQuery
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Reusable Response Panel Component
const ResponsePanel = ({ title, isLoading, result, sampleOutput, pricingData, isModelRouter = false }) => {
  // Get pricing from external configuration file
  const getPricing = (modelType) => {
    if (!pricingData) {
      // Fallback pricing if data hasn't loaded yet
      return { input_per_1m: 5.00, output_per_1m: 15.00 };
    }
    
    return pricingData[modelType] || pricingData['default'] || { input_per_1m: 5.00, output_per_1m: 15.00 };
  };

  // Get Model Router pricing specifically
  const getModelRouterPricing = () => {
    if (!pricingData) {
      return { input_per_1m: 0.14, output_per_1m: 0.00 };
    }
    return pricingData['model-router'] || { input_per_1m: 0.14, output_per_1m: 0.00 };
  };

  const calculateCost = (promptTokens, completionTokens, modelType, isModelRouter = false) => {
    if (isModelRouter) {
      // Model Router cost = (Router input + Underlying input) * input tokens + Underlying output * output tokens
      const routerPricing = getModelRouterPricing();
      const underlyingPricing = getPricing(modelType);
      
      const combinedInputPrice = routerPricing.input_per_1m + underlyingPricing.input_per_1m;
      const outputPrice = underlyingPricing.output_per_1m; // Only underlying model charges for output
      
      const promptCost = (promptTokens / 1000000) * combinedInputPrice;
      const completionCost = (completionTokens / 1000000) * outputPrice;
      const totalCost = promptCost + completionCost;
      
      return {
        promptCost: promptCost.toFixed(6),
        completionCost: completionCost.toFixed(6),
        totalCost: totalCost.toFixed(6),
        pricing: {
          input_per_1m: combinedInputPrice,
          output_per_1m: outputPrice,
          router_input_per_1m: routerPricing.input_per_1m,
          underlying_input_per_1m: underlyingPricing.input_per_1m,
          underlying_output_per_1m: outputPrice
        }
      };
    } else {
      // Standard pricing for non-router models
      const pricing = getPricing(modelType);
      const promptCost = (promptTokens / 1000000) * pricing.input_per_1m;
      const completionCost = (completionTokens / 1000000) * pricing.output_per_1m;
      const totalCost = promptCost + completionCost;
      
      return {
        promptCost: promptCost.toFixed(6),
        completionCost: completionCost.toFixed(6),
        totalCost: totalCost.toFixed(6),
        pricing: pricing
      };
    }
  };

  const costData = result ? calculateCost(
    result.prompt_tokens || 0,
    result.completion_tokens || 0,
    result.model_type || 'default',
    isModelRouter
  ) : null;

  const chartData = {
    labels: ['Prompt Tokens', 'Completion Tokens', 'Total Tokens'],
    datasets: [
      {
        label: 'Token Usage',
        data: [
          result?.prompt_tokens || 0,
          result?.completion_tokens || 0,
          result?.total_tokens || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Token Usage Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress />
        </Box>
      ) : result ? (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {result.error ? (
            <Typography color="error"><strong>Error:</strong> {result.error}</Typography>
          ) : (
            <>
              {/* Model and Token Info - Enhanced with Cost */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 0.5,
                p: 1.5,
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: 1,
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}>
                <Typography variant="body2"><strong>Model Used:</strong> {result.model_type}</Typography>
                <Typography variant="body2"><strong>Prompt Tokens:</strong> {result.prompt_tokens}</Typography>
                <Typography variant="body2"><strong>Completion Tokens:</strong> {result.completion_tokens}</Typography>
                <Typography variant="body2"><strong>Total Tokens:</strong> {result.total_tokens}</Typography>
                {/* Response time (if measured by frontend) */}
                {result.response_time_ms !== undefined && (
                  <>
                    <Typography variant="body2"><strong>Total Time (client):</strong> {result.response_time_ms.toFixed(1)} ms</Typography>
                    {result.server_processing_ms !== undefined && (
                      <Typography variant="body2"><strong>Server Processing:</strong> {result.server_processing_ms} ms</Typography>
                    )}
                    {result.network_ms !== undefined && (
                      <Typography variant="body2"><strong>Network Latency:</strong> {result.network_ms.toFixed(1)} ms</Typography>
                    )}
                  </>
                )}
                
                {/* Cost Information */}
                {costData && (
                   <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                     <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                       <strong>💰 Cost Analysis:</strong>
                     </Typography>
                    {isModelRouter && costData.pricing.router_input_per_1m !== undefined ? (
                      // Model Router cost breakdown
                      <>
                        <Typography variant="body2">
                          <strong>Input Cost:</strong> ${costData.promptCost}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontSize: '0.85em', color: '#666' }}>
                          • Router: ${costData.pricing.router_input_per_1m}/1M tokens
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontSize: '0.85em', color: '#666' }}>
                          • Underlying Model: ${costData.pricing.underlying_input_per_1m}/1M tokens
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontSize: '0.85em', color: '#666' }}>
                          • Combined: ${costData.pricing.input_per_1m}/1M tokens
                        </Typography>
                        <Typography variant="body2">
                          <strong>Output Cost:</strong> ${costData.completionCost} 
                          <span style={{ color: '#666', fontSize: '0.85em' }}> (${costData.pricing.output_per_1m}/1M tokens - underlying model only)</span>
                        </Typography>
                      </>
                    ) : (
                      // Standard cost display
                      <>
                        <Typography variant="body2">
                          <strong>Input Cost:</strong> ${costData.promptCost} 
                          <span style={{ color: '#666', fontSize: '0.85em' }}> (${costData.pricing.input_per_1m}/1M tokens)</span>
                        </Typography>
                        <Typography variant="body2">
                          <strong>Output Cost:</strong> ${costData.completionCost} 
                          <span style={{ color: '#666', fontSize: '0.85em' }}> (${costData.pricing.output_per_1m}/1M tokens)</span>
                        </Typography>
                      </>
                    )}
                     <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                       <strong>Total Cost: ${costData.totalCost}</strong>
                     </Typography>
                 </Box>
               )}
             </Box>
              
              {/* Chart - Fixed height to prevent overlay */}
              <Box sx={{ height: 180, minHeight: 180 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
              
              {/* Response Text - Separate container */}
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Response:</Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    minHeight: 150,
                    maxHeight: 300
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: result.output }} />
                </Paper>
              </Box>
            </>
          )}
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {sampleOutput && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>Sample Output:</Typography>
              <Paper variant="outlined" sx={{ p: 1, mt: 1, flexGrow: 1, overflowY: 'auto', maxHeight: 300 }}>
                <div dangerouslySetInnerHTML={{ __html: sampleOutput }} />
              </Paper>
            </>
          )}
          {!sampleOutput && <Typography>Awaiting prompt submission...</Typography>}
        </Box>
      )}
    </Paper>
  );
};

// Dynamic Theme Function
const createZavaTheme = (isDarkMode) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: isDarkMode ? '#4F9CF9' : '#00205B', // Lighter blue for dark mode
    },
    secondary: {
      main: isDarkMode ? '#60A5FA' : '#3182CE',
    },
    success: {
      main: isDarkMode ? '#10B981' : '#28a745',
      light: isDarkMode ? '#1F2937' : '#f8f9fa',
      contrastText: isDarkMode ? '#D1FAE5' : '#1F2937',
    },
    background: {
      default: isDarkMode ? '#0F0F23' : '#F7FAFC', // Dark background similar to screenshot
      paper: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    },
    text: {
      primary: isDarkMode ? '#E2E8F0' : '#2D3748',
      secondary: isDarkMode ? '#94A3B8' : '#4A5568',
    },
  },
  typography: {
    fontFamily: 'Inter, Lato, sans-serif',
    h4: {
      fontWeight: 700,
      color: isDarkMode ? '#E2E8F0' : '#2D3748',
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#16213E' : '#00205B',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1A1A2E' : '#FFFFFF',
        },
      },
    },
  },
});

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [department, setDepartment] = useState('Finance');
  const [routingResult, setRoutingResult] = useState(null);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [output] = useState('');
  const [pricingData, setPricingData] = useState(null);

  // Detect system dark mode preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => createZavaTheme(prefersDarkMode), [prefersDarkMode]);

  useEffect(() => {
    // Load scenarios from external file
    fetch('/data/scenarios.json')
      .then(response => response.json())
      .then(data => {
        // Flatten the nested structure - each department has its own array
        const allScenarios = [];
        Object.keys(data).forEach(dept => {
          data[dept].forEach(scenario => {
            allScenarios.push({
              ...scenario,
              department: dept // Add department field to each scenario
            });
          });
        });
        setScenarios(allScenarios);
      })
      .catch(error => console.error('Error loading scenarios:', error));

    // Load pricing data from external file  
    fetch('/data/pricing.json')
      .then(response => response.json())
      .then(data => setPricingData(data.models))
      .catch(error => console.error('Error loading pricing data:', error));
  }, []);

  // Filter scenarios by department
  const filteredScenarios = scenarios.filter(scenario => 
    scenario.department === department
  );

  const handleScenarioSelect = async (scenario) => {
    setSelectedScenario(scenario);
    
    // Just set the scenario prompt (RAG data will be added server-side)
    setPrompt(scenario.prompt);
  };

  const handleRouteChange = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // Reset previous results
    setRoutingResult(null);
    setBenchmarkResult(null);
    setRoutingLoading(true);
    setBenchmarkLoading(true);

    // Start both requests in parallel but handle them separately
    // Router request
    const routerStartTime = performance.now();
    fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    .then(response => response.json())
    .then(data => {
      const routerEndTime = performance.now();
      const responseTimeMs = routerEndTime - routerStartTime;
      const networkMs = responseTimeMs - (data.server_processing_ms || 0);
      
      setRoutingResult({
        ...data,
        response_time_ms: responseTimeMs,
        network_ms: networkMs
      });
      setRoutingLoading(false);
    })
    .catch(error => {
      setRoutingResult({ error: error.message });
      setRoutingLoading(false);
    });

    // Benchmark request 
    const benchmarkStartTime = performance.now();
    fetch('/api/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    .then(response => response.json())
    .then(data => {
      const benchmarkEndTime = performance.now();
      const responseTimeMs = benchmarkEndTime - benchmarkStartTime;
      const networkMs = responseTimeMs - (data.server_processing_ms || 0);
      
      setBenchmarkResult({
        ...data,
        response_time_ms: responseTimeMs,
        network_ms: networkMs
      });
      setBenchmarkLoading(false);
    })
    .catch(error => {
      setBenchmarkResult({ error: error.message });
      setBenchmarkLoading(false);
    });
    
    setIsLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <img src="/zava-logo.png" alt="Zava Logo" style={{ height: '40px', marginRight: '16px' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Model Router Demo
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            display: 'flex',
          }}
        >
          <Grid container spacing={3} sx={{ flexGrow: 1 }}>
            {/* Left Panel: Scenarios + Prompt (Stacked) */}
            <Grid item xs={12} md={4}>
              {/* Scenarios Section */}
              <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '60vh', mb: 3 }}>
                <Typography variant="h6" gutterBottom>Departments</Typography>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Development">Product Development</MenuItem>
                </Select>
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  {filteredScenarios.map((scenario) => (
                    <Card
                      key={scenario.id}
                      sx={{ 
                        mb: 1, 
                        cursor: 'pointer', 
                        backgroundColor: selectedScenario?.id === scenario.id ? 'primary.main' : 'background.paper', 
                        '&:hover': { 
                          backgroundColor: selectedScenario?.id === scenario.id ? 'primary.dark' : 'action.hover' 
                        } 
                      }}
                      onClick={() => handleScenarioSelect(scenario)}
                    >
                      <CardContent>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: selectedScenario?.id === scenario.id ? 'primary.contrastText' : 'text.primary' 
                          }}
                        >
                          {scenario.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>

              {/* Prompt Section */}
              <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '30vh' }}>
                <Typography variant="h6" gutterBottom>Prompt & Controls</Typography>
                {selectedScenario && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2"><strong>Complexity:</strong> {selectedScenario.complexity}</Typography>
                    <Typography variant="subtitle2"><strong>Quality Expectation:</strong> {selectedScenario.qualityExpectation}</Typography>
                  </Box>
                )}
                <TextField
                  fullWidth
                  multiline
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  variant="outlined"
                  placeholder="Enter your prompt here or select a scenario."
                  sx={{ mb: 1, flexGrow: 1, '& .MuiInputBase-root': { height: '100%' } }}
                  InputProps={{
                    sx: {
                      height: '100%',
                      alignItems: 'flex-start',
                      '& .MuiInputBase-input': {
                        height: '100% !important',
                        overflow: 'auto !important'
                      }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRouteChange}
                  disabled={isLoading || !prompt.trim()}
                  fullWidth
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Paper>
            </Grid>

            {/* Right Panel: Results (Now at top) */}
            <Grid item xs={12} md={8}>
              <Box>
                  {/* Cost & Latency Analysis - Now prominently at top */}
                  {routingResult && benchmarkResult && !routingResult.error && !benchmarkResult.error && pricingData && (
                    <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'success.light', border: 2, borderColor: 'success.main', color: 'success.contrastText' }}>
                      <Typography variant="h5" sx={{ mb: 3, color: 'success.contrastText', fontWeight: 700, textAlign: 'center' }}>
                        💰 Cost Savings Analysis
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 600, mb: 1 }}>Model Router Cost</Typography>
                            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                              {(() => {
                                // Model Router cost = (Router input + Underlying input) * input tokens + Underlying output * output tokens
                                const routerPricing = pricingData['model-router'] || { input_per_1m: 0.14, output_per_1m: 0.00 };
                                const underlyingPricing = pricingData[routingResult.model_type] || pricingData['default'] || { input_per_1m: 1.25, output_per_1m: 10.00 };
                                
                                const combinedInputPrice = routerPricing.input_per_1m + underlyingPricing.input_per_1m;
                                const inputCost = (routingResult.prompt_tokens / 1000000) * combinedInputPrice;
                                const outputCost = (routingResult.completion_tokens / 1000000) * underlyingPricing.output_per_1m;
                                const totalCost = inputCost + outputCost;
                                
                                return `$${totalCost.toFixed(6)}`;
                              })()}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 600, mb: 1 }}>Benchmark Cost</Typography>
                            <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 700 }}>
                              {(() => {
                                // Use actual model pricing for benchmark responses
                                const benchmarkPricing = pricingData[benchmarkResult.model_type] || pricingData['default'] || { input_per_1m: 1.25, output_per_1m: 10.00 };
                                const cost = (benchmarkResult.prompt_tokens / 1000000) * benchmarkPricing.input_per_1m + (benchmarkResult.completion_tokens / 1000000) * benchmarkPricing.output_per_1m;
                                return `$${cost.toFixed(6)}`;
                              })()}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="success.contrastText">Cost Savings</Typography>
                            <Typography variant="h6" sx={{ color: 'success.contrastText', fontWeight: 700 }}>
                              {(() => {
                                // Model Router cost = (Router input + Underlying input) * input tokens + Underlying output * output tokens
                                const routerPricing = pricingData['model-router'] || { input_per_1m: 0.14, output_per_1m: 0.00 };
                                const routerUnderlyingPricing = pricingData[routingResult.model_type] || pricingData['default'] || { input_per_1m: 1.25, output_per_1m: 10.00 };
                                
                                const routerCombinedInputPrice = routerPricing.input_per_1m + routerUnderlyingPricing.input_per_1m;
                                const routerInputCost = (routingResult.prompt_tokens / 1000000) * routerCombinedInputPrice;
                                const routerOutputCost = (routingResult.completion_tokens / 1000000) * routerUnderlyingPricing.output_per_1m;
                                const routerTotalCost = routerInputCost + routerOutputCost;
                                
                                // Benchmark cost (standard pricing)
                                const benchmarkPricing = pricingData[benchmarkResult.model_type] || pricingData['default'] || { input_per_1m: 1.25, output_per_1m: 10.00 };
                                const benchmarkCost = (benchmarkResult.prompt_tokens / 1000000) * benchmarkPricing.input_per_1m + (benchmarkResult.completion_tokens / 1000000) * benchmarkPricing.output_per_1m;
                                
                                const savings = benchmarkCost > 0 ? ((benchmarkCost - routerTotalCost) / benchmarkCost * 100).toFixed(1) : '0.0';
                                return `${savings}%`;
                              })()}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {/* Latency Comparison Micro-Chart */}
                      {routingResult && benchmarkResult && (routingResult.response_time_ms || benchmarkResult.response_time_ms) && (
                        (() => {
                          const rTime = routingResult.response_time_ms || routingResult.server_processing_ms || 0;
                          const bTime = benchmarkResult.response_time_ms || benchmarkResult.server_processing_ms || 0;
                          const maxT = Math.max(rTime, bTime, 1);
                          const gapMs = bTime - rTime;
                          const gapPct = bTime > 0 ? ((gapMs / bTime) * 100).toFixed(1) : '0.0';

                          return (
                            <Box sx={{ mt: 2, p: 3, backgroundColor: 'background.paper', borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
                              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>⚡ Latency Comparison</Typography>
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption">Model Router: {rTime.toFixed(1)} ms</Typography>
                                  <Box sx={{ height: 10, background: '#eee', borderRadius: 1, mt: 0.5 }}>
                                    <Box sx={{ height: '100%', background: '#3182CE', width: `${(rTime / maxT) * 100}%`, borderRadius: 1 }} />
                                  </Box>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption">Benchmark: {bTime.toFixed(1)} ms</Typography>
                                  <Box sx={{ height: 10, background: '#eee', borderRadius: 1, mt: 0.5 }}>
                                    <Box sx={{ height: '100%', background: '#E53E3E', width: `${(bTime / maxT) * 100}%`, borderRadius: 1 }} />
                                  </Box>
                                </Box>
                                <Box sx={{ minWidth: 200, textAlign: 'center', p: 2, backgroundColor: gapMs >= 0 ? 'rgba(40, 167, 69, 0.1)' : 'rgba(229, 62, 62, 0.1)', borderRadius: 2, border: '2px solid', borderColor: gapMs >= 0 ? '#28a745' : '#E53E3E' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 800, color: gapMs >= 0 ? '#28a745' : '#E53E3E', mb: 1 }}>
                                    {gapMs >= 0 ? `${(bTime/rTime).toFixed(1)}x` : `${(rTime/bTime).toFixed(1)}x`}
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: gapMs >= 0 ? '#28a745' : '#E53E3E' }}>
                                    {gapMs >= 0 ? `Router is ${(bTime/rTime).toFixed(1)}x faster` : `Router is ${(rTime/bTime).toFixed(1)}x slower`}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                                    {gapMs >= 0 ? `(${gapMs.toFixed(0)} ms faster)` : `(${Math.abs(gapMs).toFixed(0)} ms slower)`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })()
                      )}
                      
                      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic', color: 'text.secondary' }}>
                        *Pricing is loaded from data/pricing.json. Update that file to reflect your actual model costs.
                      </Typography>
                    </Paper>
                  )}

                  {/* Results Grid */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <ResponsePanel 
                        title="Model Router Response"
                        isLoading={routingLoading}
                        result={routingResult}
                        sampleOutput={!routingResult ? output : null}
                        pricingData={pricingData}
                        isModelRouter={true}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResponsePanel 
                        title="Benchmark Model Response"
                        isLoading={benchmarkLoading}
                        result={benchmarkResult}
                        sampleOutput={null}
                        pricingData={pricingData}
                        isModelRouter={false}
                      />
                    </Grid>
                  </Grid>
                </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;