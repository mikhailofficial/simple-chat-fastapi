import {ClerkProvider} from "@clerk/clerk-react"
import {BrowserRouter} from "react-router-dom"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

export default function ClerkProviderWithRoutes({children}) {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <BrowserRouter>{children}</BrowserRouter>
        </ClerkProvider>
    )
}