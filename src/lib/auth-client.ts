import { createAuthClient } from "better-auth/react"

const browserOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

const authBaseURL = (
    browserOrigin || process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000"
).replace(/\/api\/auth\/?$/, "");

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: authBaseURL
})
