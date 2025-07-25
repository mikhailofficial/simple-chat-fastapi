import {AuthenticationPage} from "./components/auth/AuthenticationPage.jsx"
import ClerkProviderWithRoutes from "./components/auth/ClerkProviderWithRoutes.jsx"
import {Routes, Route} from "react-router-dom"
import {Layout} from "./layout/Layout.jsx"
import {Chat} from "./pages/ChatPage/ChatPage.jsx"
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
