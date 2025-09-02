import React from "react"
import { Outlet, Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../components/Auth/AuthProvider"

export function Layout() {
    const { isAuthenticated, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = () => {
        signOut()
        navigate("/sign-in")
    }

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="header-content">
                    <h1>Simple chat</h1>
                    <nav>
                        {isAuthenticated ? (
                            <>
                                <Link to="/">Go to the Simple Chat</Link>
                                <button onClick={handleSignOut}>Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate("/sign-in")}>Sign In</button>
                                <button onClick={() => navigate("/sign-up")}>Sign Up</button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="app-main">
                {!isAuthenticated && <Navigate to="/sign-up" replace />}
                {isAuthenticated && <Outlet />}
            </main>
        </div>
    )
}