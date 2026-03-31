import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('auth')) {
            navigate('/app');
        }
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('auth', '1');
            navigate('/app');
        }, 1500);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', background: 'var(--surface-container-lowest)' }}>
            <style>{`
                .login-left { display: flex; flex-direction: column; flex: 1; background-color: var(--surface); padding: 64px; border-right: 1px solid rgba(173,179,180,0.3); }
                @media (max-width: 900px) { .login-left { display: none !important; } }
                .login-brand-mobile { display: none; align-items: center; gap: 12px; margin-bottom: 48px; justify-content: center; }
                @media (max-width: 900px) { .login-brand-mobile { display: flex !important; } }
                .spin-icon { animation: spinAnim 1s linear infinite; }
                @keyframes spinAnim { 100% { transform: rotate(360deg); } }
            `}</style>

            {/* Left side info panel */}
            <div className="login-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'auto' }}>
                    <div style={{ width: 40, height: 40, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined ms-filled" style={{ fontSize: 24, color: 'white' }}>cloud_done</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 'var(--font-2xl)', letterSpacing: '-0.03em', textTransform: 'uppercase', color: 'var(--on-surface)', lineHeight: 1 }}>CloudCarbonSeq</div>
                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginTop: 2 }}>Intelligence Core</div>
                    </div>
                </div>
                
                <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24 }}>System<br/>Access<br/>Restricted</h1>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--font-md)', maxWidth: 400, lineHeight: 1.6 }}>Azure Operator authentication required. Institutional carbon intelligence and high-resolution telemetry dashboard.</p>
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', gap: 24, fontSize: 'var(--font-sm)', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    <span>Azure AD Secure</span>
                    <span>Monitoring Matrix V4</span>
                </div>
            </div>

            {/* Right side form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    
                    <div className="login-brand-mobile">
                        <div style={{ width: 32, height: 32, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined ms-filled" style={{ fontSize: 20, color: 'white' }}>cloud_done</span></div>
                        <div style={{ fontWeight: 900, fontSize: 'var(--font-xl)', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>CloudCarbonSeq</div>
                    </div>

                    <div style={{ marginBottom: 40 }}>
                        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>
                            {isSignUp ? 'Request Protocol Access' : 'Admin Authentication'}
                        </h2>
                        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--font-sm)' }}>
                            {isSignUp ? 'Submit institution credentials for orbital telemetry access.' : 'Please verify your credentials to continue.'}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {isSignUp && (
                            <>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Dr. S. Sharma"
                                        style={{ width: '100%', background: 'var(--surface-container-low)', border: '1px solid rgba(173,179,180,0.3)', padding: '16px', fontSize: 'var(--font-base)', color: 'var(--on-surface)', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Institution / Agency</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. UN Environment Programme"
                                        style={{ width: '100%', background: 'var(--surface-container-low)', border: '1px solid rgba(173,179,180,0.3)', padding: '16px', fontSize: 'var(--font-base)', color: 'var(--on-surface)', outline: 'none' }}
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Operator Identity</label>
                            <input 
                                type="email" 
                                required
                                defaultValue={isSignUp ? "" : "admin@cloudcarbon.io"}
                                placeholder="operator@agency.gov"
                                style={{ width: '100%', background: 'var(--surface-container-low)', border: '1px solid rgba(173,179,180,0.3)', padding: '16px', fontSize: 'var(--font-base)', color: 'var(--on-surface)', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>Passkey</label>
                                {!isSignUp && <a href="#" style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--secondary)' }}>Reset?</a>}
                            </div>
                            <input 
                                type="password" 
                                required
                                defaultValue={isSignUp ? "" : "**********"}
                                placeholder="••••••••••••"
                                style={{ width: '100%', background: 'var(--surface-container-low)', border: '1px solid rgba(173,179,180,0.3)', padding: '16px', fontSize: 'var(--font-base)', color: 'var(--on-surface)', outline: 'none', letterSpacing: '0.2em' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ 
                                width: '100%', justifyContent: 'center', padding: '18px', 
                                marginTop: 16, border: 'none', letterSpacing: '0.08em', fontSize: 'var(--font-sm)',
                                opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto', gap: 8, display: 'flex', alignItems: 'center'
                            }}
                        >
                            {loading ? (
                                <><span className="material-symbols-outlined spin-icon" style={{ fontSize: 18 }}>sync</span> <span>{isSignUp ? 'Provisioning...' : 'Authenticating Layer...'}</span></>
                            ) : (
                                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isSignUp ? 'person_add' : 'login'}</span> <span>{isSignUp ? 'Submit Request' : 'Initialize Session'}</span></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <button 
                            onClick={() => setIsSignUp(!isSignUp)} 
                            style={{ background: 'none', border: 'none', fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--secondary)', cursor: 'pointer' }}
                        >
                            {isSignUp ? 'Already authenticated? Sign In' : 'No access? Request Operator Identity'}
                        </button>
                    </div>

                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                            ← Return to Public Terminal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
