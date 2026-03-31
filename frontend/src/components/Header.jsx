import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return time;
}

export default function Header({ onMenuClick }) {
    const navigate = useNavigate();
    const time = useClock();
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const istTime = time.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Kolkata', hour12: true,
    });

    return (
        <header className="app-header">
            {/* Menu toggle */}
            <div>
                <button className="hamburger-btn" onClick={onMenuClick}>
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* IST Clock */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-surface)' }}>schedule</span>
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--on-surface)' }}>
                        {istTime} IST
                    </span>
                </div>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowNotif(!showNotif)} style={{ position: 'relative', color: 'var(--on-surface-variant)', display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
                        <span style={{
                            position: 'absolute', top: 0, right: 0,
                            width: 8, height: 8, background: 'var(--error)',
                        }} />
                    </button>
                    {showNotif && (
                        <div className="dropdown-popup" style={{ right: 0 }}>
                            <div className="dropdown-header">
                                <span>Notifications (2)</span>
                                <button className="settings-item" style={{ padding: 0, width: 'auto' }} onClick={() => setShowNotif(false)}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span></button>
                            </div>
                            <div>
                                <div className="notification-item">
                                    <div className="notification-title">NDVI Anomaly Detected</div>
                                    <div className="notification-sub">Block 4A, Sundarbans shows a -0.12 drop in index density.</div>
                                    <div className="notification-time">10 MINS AGO</div>
                                </div>
                                <div className="notification-item">
                                    <div className="notification-title">Pipeline Succeeded</div>
                                    <div className="notification-sub">Batch [20260331-P1] processed 45,000 km² cleanly.</div>
                                    <div className="notification-time">1 HOUR AGO</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sensors */}
                <button 
                    onClick={() => setActiveModal('radar')}
                    style={{ color: 'var(--on-surface-variant)', display: 'flex' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>sensors</span>
                </button>

                {/* Avatar */}
                <div style={{ position: 'relative' }}>
                    <div 
                        onClick={() => setShowProfile(!showProfile)}
                        style={{
                            width: 32, height: 32,
                            background: 'var(--surface-container-highest)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: 'var(--on-surface)',
                            cursor: 'pointer',
                        }}>
                        SS
                    </div>
                    {showProfile && (
                        <div className="dropdown-popup" style={{ right: 0, minWidth: 240 }}>
                            <div className="dropdown-header">
                                <span style={{ textTransform: 'none', color: 'var(--on-surface)', fontSize: 'var(--font-sm)', letterSpacing: 'normal' }}>admin@cloudcarbon.io</span>
                                <button className="settings-item" style={{ padding: 0, width: 'auto' }} onClick={() => setShowProfile(false)}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                                </button>
                            </div>
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(173,179,180,0.1)' }}>
                                <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Role</div>
                                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--on-surface)' }}>Azure Operations Admin</div>
                            </div>
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(173,179,180,0.1)' }}>
                                <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Permissions</div>
                                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--on-surface)' }}>Full Write Access (Production)</div>
                            </div>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('auth');
                                    navigate('/');
                                }}
                                className="settings-item" 
                                style={{ padding: '12px 16px', color: 'var(--error)' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                                <span>Terminate Session</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Radar Modal */}
            {activeModal === 'radar' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-panel" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-body" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary)' }}>sensors</span>
                                <span style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>Sensor Matrix Status</span>
                            </div>
                            <p style={{ fontSize: 'var(--font-sm)' }}>Diagnostic: L-Band Radar matrix is fully operational.</p>
                            <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ justifyContent: 'center', width: '100%', marginTop: 24 }}>Acknowledge</button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
