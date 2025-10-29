export interface AuthToken {
  id: string
  token: string
  expiry: number
}

export const decodeAuthToken = (token: string): AuthToken => {
  return JSON.parse(atob(token)) as AuthToken
}

export const getStoredAuthToken = () => sessionStorage.getItem("authToken")

export const parseStoredAuthToken = (): AuthToken | null => {
  const token = getStoredAuthToken()
  if (!token) {
    return null
  }

  return decodeAuthToken(token)
}

export const getAuthHeaders = () => {
  const token = getStoredAuthToken()
  if (!token) {
    return {}
  }

  return { Authorization: `Bearer ${token}` }
}
