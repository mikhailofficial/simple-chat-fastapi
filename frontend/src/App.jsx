import {AuthenticationPage} from "./components/Auth/AuthenticationPage.jsx"
import {Routes, Route} from "react-router-dom"
import {Layout} from "./layout/Layout.jsx"
import {Chat} from "./pages/ChatPage/ChatPage.jsx"
import { AuthProvider } from "./components/Auth/AuthProvider"
import { BrowserRouter } from "react-router-dom"
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<AuthenticationPage />} />
          <Route path="/sign-up" element={<AuthenticationPage />} />
          <Route element={<Layout />} >
            <Route path="/" element={<Chat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
