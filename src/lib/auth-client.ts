import { createAuthClient } from "better-auth/react"
const authBaseURL = (
    process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000"
).replace(/\/api\/auth\/?$/, "");

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: authBaseURL
})
