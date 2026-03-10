'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import './login.css'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message?: string; error?: string }
}) {
    const [isSignup, setIsSignup] = useState(false)

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Petra Portal</h1>
                <p className="login-subtitle">
                    {isSignup ? 'Create your account' : 'Sign in to your account'}
                </p>

                {searchParams?.error && (
                    <div className="error-banner">
                        {searchParams.error}
                    </div>
                )}
                {searchParams?.message && (
                    <div className="success-banner">
                        {searchParams.message}
                    </div>
                )}

                <form className="login-form">
                    {isSignup && (
                        <>
                            <div className="form-row">
                                <div className="input-group flex-1">
                                    <label htmlFor="first_name">First Name</label>
                                    <input id="first_name" name="first_name" type="text" required />
                                </div>
                                <div className="input-group flex-1" style={{ marginLeft: '1rem' }}>
                                    <label htmlFor="last_name">Last Name</label>
                                    <input id="last_name" name="last_name" type="text" required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label htmlFor="role">I am a...</label>
                                <select id="role" name="role" required>
                                    <option value="student">Student</option>
                                    <option value="parent">Parent</option>
                                    <option value="tutor">Tutor</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" required placeholder="email@example.com" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" required placeholder="••••••••" />
                    </div>

                    <div className="button-group">
                        {!isSignup ? (
                            <>
                                <button formAction={login} className="btn-primary">Log in</button>
                                <button type="button" onClick={() => setIsSignup(true)} className="btn-secondary">Create Account</button>
                            </>
                        ) : (
                            <>
                                <button formAction={signup} className="btn-primary">Sign up</button>
                                <button type="button" onClick={() => setIsSignup(false)} className="btn-secondary">Back to Login</button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
