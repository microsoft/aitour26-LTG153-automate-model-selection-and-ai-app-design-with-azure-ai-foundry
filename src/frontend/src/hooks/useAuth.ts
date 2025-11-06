import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { decodeAuthToken, getStoredAuthToken } from "@/utils/auth"

const authEnabled = import.meta.env.VITE_AUTH === "true"
const authUrl = import.meta.env.VITE_AUTH_URL || ""
const appName = import.meta.env.VITE_APP_NAME || "Application"

const getAppUrl = () => {
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return ""
}

const redirectToAuth = (targetUrl: string) => {
  if (!authUrl) {
    throw new Error("AUTH_URL is not configured")
  }

  const info = {
    app: appName,
    url: targetUrl,
  }

  const encoded = btoa(JSON.stringify(info))
  window.location.href = `${authUrl}?v=${encoded}`
}

export const useAuth = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(!authEnabled)
  const [ready, setReady] = useState(!authEnabled)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!authEnabled) {
      return
    }

    let cancelled = false

    const checkAuth = async () => {
      const appUrl = getAppUrl()
      const params = new URLSearchParams(location.search)
      const queryToken = params.get("t")
      const storedToken = getStoredAuthToken()
      const token = queryToken || storedToken

      if (!token) {
        redirectToAuth(appUrl)
        return
      }

      const decoded = decodeAuthToken(token)

      if (Date.now() > decoded.expiry) {
        const response = await fetch(`${authUrl}/check/`, {
          headers: { "x-token": decoded.token },
        })

        if (!response.ok) {
          sessionStorage.removeItem("authToken")
          redirectToAuth(appUrl)
          return
        }
      }

      sessionStorage.setItem("authToken", token)

      if (queryToken) {
        params.delete("t")
        const search = params.toString()
        navigate({ pathname: location.pathname, search: search ? `?${search}` : "" }, { replace: true })
      }

      if (!cancelled) {
        setAuthorized(true)
        setReady(true)
        setUserId(decoded.id)
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [location.key, navigate, authUrl, authEnabled])

  return useMemo(
    () => ({
      authorized,
      ready,
      userId,
    }),
    [authorized, ready, userId],
  )
}
