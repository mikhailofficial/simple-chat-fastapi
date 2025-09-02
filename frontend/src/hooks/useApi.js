import { useAuth } from "../components/Auth/AuthProvider"
import { API_BASE_URL } from "../config/api"

export const useApi = () => {
    const { token } = useAuth()

    const makeRequest = async (endpoint, options = {}) => {
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
        }

        const response = await fetch(API_BASE_URL + endpoint, {
            ...defaultOptions,
            ...options,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            if (response.status === 401) {
                throw new Error("Authentication required")
            }
            if (response.status === 429) {
                throw new Error("Rate limit exceeded")
            }
            throw new Error(errorData?.detail || "Request failed")
        }

        return response.json()
    }

    return { makeRequest }
}