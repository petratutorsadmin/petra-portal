import { login, signup } from './actions'
import './login.css' // We will create this or rely on global index.css with simple vanilla CSS

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    const resolvedParams = await searchParams
    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Petra Portal</h1>
                <p className="login-subtitle">Sign in to your account</p>

                {resolvedParams?.error && (
                    <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                        {resolvedParams.error}
                    </div>
                )}
                {resolvedParams?.message && (
                    <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
                        {resolvedParams.message}
                    </div>
                )}

                <form className="login-form" action={login}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" required defaultValue="admin@petratutors.com" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" required defaultValue="password123" />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn-primary">Log in</button>
                        <button formAction={signup} className="btn-secondary">Sign up</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
