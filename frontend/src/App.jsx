import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.jsx"
import {Routes, Route} from "react-router-dom"
import {AuthenticationPage} from "./auth/AuthenticationPage.jsx"
import {Layout} from "./layout/Layout.jsx"
import {Chat} from "./chat/Chat.jsx"
import './App.css'

function App() {
  return <ClerkProviderWithRoutes>
    <Routes>
      <Route path="/sign-in/*" element={<AuthenticationPage />} />
      <Route path="/sign-up" element={<AuthenticationPage />} />
      <Route element={<Layout />} >
        <Route path="/" element={<Chat />} />
      </Route>
    </Routes>
  </ClerkProviderWithRoutes>
}

export default App
