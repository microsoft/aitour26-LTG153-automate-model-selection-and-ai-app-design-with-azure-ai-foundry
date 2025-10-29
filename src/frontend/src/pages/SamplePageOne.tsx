'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createApiWrapper } from "@/utils/api/apiWrapper"
import { Toaster } from '@/components/ui/toaster'
import { Button } from "@/components/ui/button"
import { getAuthHeaders, parseStoredAuthToken } from "@/utils/auth"

interface HelloWorldResponse {
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

export default function CasePage() {
  const { toast } = useToast()
  const apiWrapper = createApiWrapper(toast)
  const [message, setMessage] = useState<string>("")
  const [buttonMessage, setButtonMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      console.log('API URL:', API_BASE_URL)
      const response = await apiWrapper<HelloWorldResponse>(
        async () => {
          const res = await fetch(`${API_BASE_URL}/`, {
            headers: {
              ...getAuthHeaders(),
            },
          })
          if (!res.ok) {
            throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`)
          }
          return res.json()
        },
        {
          successMessage: "Data fetched successfully",
          errorMessage: "Failed to fetch data",
          loadingState: [isLoading, setIsLoading],
          toastDuration: 3000
        }
      )

      if (response) {
        setMessage(response.message)
      }
    }

    fetchData()

    const stored = parseStoredAuthToken()
    if (stored) {
      setUserId(stored.id)
    }
  }, [])

  const handleButtonFetch = async () => {
    const response = await apiWrapper<HelloWorldResponse>(
      async () => {
        const res = await fetch(`${API_BASE_URL}/`, {
          headers: {
            ...getAuthHeaders(),
          },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`)
        }
        return res.json()
      },
      {
        successMessage: "Button data fetched successfully",
        errorMessage: "Failed to fetch button data",
        loadingState: [isButtonLoading, setIsButtonLoading],
        toastDuration: 3000
      }
    )

    if (response) {
      setButtonMessage(response.message)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Automatic Fetch</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <p className="text-gray-800">{message || "No message received"}</p>
          )}
          {userId && (
            <p className="text-sm text-muted-foreground mt-2">Authenticated as {userId}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Manual Fetch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleButtonFetch}
            disabled={isButtonLoading}
            variant="default"
          >
            {isButtonLoading ? "Loading..." : "Fetch Data"}
          </Button>
          {buttonMessage && (
            <p className="text-gray-800">{buttonMessage}</p>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}

