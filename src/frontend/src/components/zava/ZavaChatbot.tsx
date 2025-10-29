import { useState, useRef, useEffect } from 'react'
import { Lightning, PaperPlaneRight, X, Minus, SpinnerGap, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getAuthHeaders } from '@/utils/auth'
import replayData from '@/data/replayData.json'

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  modelName?: string
}

interface ChatbotProps {
  defaultOpen?: boolean
}

export function ZavaChatbot({ defaultOpen = true }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const initialMessages: Message[] = [
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m the Zava AI assistant. I can help you with questions about our smart sportswear technology, products, and performance tracking. How can I help you today?',
      timestamp: new Date()
    }
  ]
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [modelType, setModelType] = useState<'router' | 'benchmark'>('router')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestedMessages = [
    {
      text: "What's the main difference between the Elite and Speed cleats?",
      label: "Simple scenario",
      tooltip: "Information available in knowledge base"
    },
    {
      text: "I'm thinking about cancelling my membership. Do you even know why I'm so annoyed?",
      label: "Complex scenario",
      tooltip: "Requires reasoning across membership history, spend patterns, cancellation drivers, and prior support interactions to address the underlying frustration before responding."
    }
  ]

  const handleSuggestedMessage = (messageText: string) => {
    setShowSuggestions(false)
    handleSendMessage(messageText)
  }

  const handleReset = () => {
    setMessages(initialMessages)
    setInputValue('')
    setIsLoading(false)
    setModelType('router')
    setShowSuggestions(true)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Check for offline mode changes
  useEffect(() => {
    const checkOfflineMode = () => {
      const isOffline = sessionStorage.getItem('offlineMode') === 'true'
      setOfflineMode(isOffline)
    }

    // Check initially
    checkOfflineMode()

    // Check periodically in case it changes in another tab/component
    const interval = setInterval(checkOfflineMode, 1000)

    return () => clearInterval(interval)
  }, [])

  // Helper function to simulate streaming response
  const simulateStreamingResponse = async (
    response: string,
    startDelayMs: number,
    totalDurationMs: number,
    wordsPerChunk: number,
    assistantMessageId: string,
    modelName: string
  ) => {
    // Wait for the initial delay before starting to stream
    await new Promise(resolve => setTimeout(resolve, startDelayMs))

    const words = response.split(' ')
    const chunks: string[] = []
    
    // Split response into chunks
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(' ') + ' ')
    }

    const streamingDuration = totalDurationMs - startDelayMs
    const delayPerChunk = chunks.length > 1 ? streamingDuration / chunks.length : 0

    let accumulatedContent = ''

    for (let i = 0; i < chunks.length; i++) {
      accumulatedContent += chunks[i]
      
      // Don't show model name until streaming is complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: accumulatedContent.trim() }
            : msg
        )
      )

      // Wait before sending next chunk (except for last chunk)
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayPerChunk))
      }
    }

    // Now that streaming is complete, add the model name
    setMessages(prev =>
      prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, modelName }
          : msg
      )
    )
  }

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputValue.trim()
    
    if (!messageToSend || isLoading) return

    setShowSuggestions(false) // Hide suggestions after first message

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Create a placeholder message for the streaming response
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, assistantMessage])

    // Check if offline mode is enabled
    const isOfflineMode = sessionStorage.getItem('offlineMode') === 'true'

    // Check if we have replay data for this message
    const replayScenarios = replayData.zavaScenarios as Record<string, any>
    const scenarioData = replayScenarios[messageToSend]

    if (isOfflineMode && scenarioData) {
      // Use replay data
      try {
        const dataToUse = modelType === 'router' ? scenarioData.router : scenarioData.benchmark
        
        await simulateStreamingResponse(
          dataToUse.response,
          dataToUse.startStreamingMs,
          dataToUse.finishStreamingMs,
          dataToUse.wordsPerChunk,
          assistantMessageId,
          dataToUse.model
        )
      } catch (error) {
        console.error('Error in replay mode:', error)
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: 'I apologize, but I encountered an error in replay mode. Please try again.', modelName: undefined }
              : msg
          )
        )
      } finally {
        setIsLoading(false)
      }
      return
    }

    // If not in offline mode or no replay data, use real API
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/zava`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          model_type: modelType
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let accumulatedContent = ''
      let isDone = false

      while (!isDone) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                console.error('Streaming error:', data.error)
                throw new Error(data.error)
              }
              
              if (data.content) {
                accumulatedContent += data.content
                // Update the assistant message with accumulated content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }

              if (data.model) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, modelName: data.model }
                      : msg
                  )
                )
              }
              
              if (data.done) {
                isDone = true
              }
            } catch (parseError) {
              // Skip invalid JSON lines (could be incomplete chunks)
              if (line.trim() && !line.includes('{')) {
                console.warn('Failed to parse SSE data:', line, parseError)
              }
            }
          }
        }
      }

      // If no content was received, show an error
      if (!accumulatedContent) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: 'I apologize, but I couldn\'t generate a response. Please try again.', modelName: undefined }
              : msg
          )
        )
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'I apologize, but I encountered an error. Please try again later.', modelName: undefined }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        aria-label="Open Zava Assistant"
      >
        <Lightning className="w-8 h-8 text-primary-foreground" weight="bold" />
      </button>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-80 shadow-lg border-primary/20">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full flex items-center justify-between p-4 border-b bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-t-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
                <Lightning className="w-5 h-5 text-primary" weight="bold" />
              </div>
              <span className="font-semibold">Zava Assistant</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              className="p-1 hover:bg-primary-foreground/20 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 h-[600px] shadow-2xl border-primary/20 flex flex-col">
        {/* Header */}
        <button
          onClick={() => setIsMinimized(true)}
          className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg hover:bg-primary/90 transition-colors w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
              <Lightning className="w-5 h-5 text-primary" weight="bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Zava Assistant</span>
              {offlineMode && (
                <span className="text-xs text-primary-foreground/80">Offline Mode (Replay)</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReset()
                    }}
                    className="p-1 hover:bg-primary-foreground/20 rounded transition-colors"
                    aria-label="Reset chat"
                  >
                    <ArrowCounterClockwise className="w-5 h-5" weight="bold" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              className="p-1 hover:bg-primary-foreground/20 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          </div>
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex flex-col gap-1 max-w-[80%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  {message.role === 'user' ? 'Emily' : 'Zava AI'}
                </span>
                <div
                  className={`w-full rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content ? (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && message.modelName && (
                        <p className="mt-2 text-[11px] text-muted-foreground">Model: {message.modelName}</p>
                      )}
                    </>
                  ) : (
                    <SpinnerGap className="w-5 h-5 animate-spin text-primary" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Messages */}
        {showSuggestions && (
          <div className="border-t border-b p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="space-y-2">
              <TooltipProvider>
                {suggestedMessages.map((suggestion, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSuggestedMessage(suggestion.text)}
                        className="w-full text-left p-2 rounded-lg border border-border bg-background hover:bg-accent/10 hover:border-accent transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-foreground flex-1">{suggestion.text}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs whitespace-nowrap ${
                              suggestion.label === 'Simple scenario' 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-orange-100 text-orange-800 border-orange-300'
                            }`}
                          >
                            {suggestion.label}
                          </Badge>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-sm">{suggestion.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 bg-background rounded-b-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Select value={modelType} onValueChange={(value: 'router' | 'benchmark') => setModelType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="router">Model Router</SelectItem>
                <SelectItem value="benchmark">Benchmark Model</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Ask about Zava..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || offlineMode}
                      className="flex-1"
                    />
                  </div>
                </TooltipTrigger>
                {offlineMode && (
                  <TooltipContent>
                    <p>Offline Mode: Use suggested questions for replay data</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <PaperPlaneRight className="w-5 h-5" weight="bold" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
