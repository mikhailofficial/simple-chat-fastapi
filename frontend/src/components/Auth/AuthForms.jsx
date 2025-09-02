import React, { useState } from "react"
import { useAuth } from "./AuthProvider"
import styles from "./AuthForms.module.css"

export function SignInForm() {
    const { signIn } = useAuth()
    const [form, setForm] = useState({ username: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    
    const onSubmit = async (e) => {
        e.preventDefault()
        if (!form.username.trim() || !form.password.trim()) {
            setError("Username and password are required")
            return
        }
        
        setError("")
        setLoading(true)
        try {
            await signIn(form)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <h2>Sign In</h2>
            <label>
                <span>Username</span>
                <input 
                    name="username" 
                    value={form.username} 
                    onChange={onChange} 
                    autoComplete="username"
                    required
                />
            </label>
            <label>
                <span>Password</span>
                <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={onChange} 
                    autoComplete="current-password"
                    required
                />
            </label>
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
            </button>
        </form>
    )
}

export function SignUpForm() {
    const { signUp } = useAuth()
    const [form, setForm] = useState({ username: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    
    const onSubmit = async (e) => {
        e.preventDefault()
        if (!form.username.trim() || !form.password.trim()) {
            setError("Username and password are required")
            return
        }
        
        if (form.password.length < 3) {
            setError("Password must be at least 8 characters")
            return
        }
        
        setError("")
        setLoading(true)
        try {
            await signUp(form)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <h2>Sign Up</h2>
            <label>
                <span>Username</span>
                <input 
                    name="username" 
                    value={form.username} 
                    onChange={onChange} 
                    autoComplete="username"
                    required
                />
            </label>
            <label>
                <span>Password</span>
                <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={onChange} 
                    autoComplete="new-password"
                    required
                />
            </label>
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
            </button>
        </form>
    )
}


