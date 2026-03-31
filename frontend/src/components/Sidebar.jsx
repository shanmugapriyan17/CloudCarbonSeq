import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

// Shared data — same constants as LandingPage so values match
const TOTAL_TONNES  = 74450;   // total tCO₂e in credit ledger
const PRICE_PER_T   = 42.84;   // ₹ per tCO₂e

const navItems = [
    { path: '/app',            label: 'Dashboard',      icon: 'dashboard' },
    { path: '/app/satellite',  label: 'Satellite',      icon: 'satellite_alt' },
    { path: '/app/credits',    label: 'Credits',        icon: 'payments' },
    { path: '/app/analytics',  label: 'Analytics',      icon: 'analytics' },
    { path: '/app/azure',      label: 'Infrastructure', icon: 'cloud_done' },
];

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate  = useNavigate();
    const [activeModal, setActiveModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [supportForm, setSupportForm] = useState({ name: '', email: '', issue: '', msg: '' });
    const [supportSent, setSupportSent] = useState(false);

    const showToast = (msg, icon = 'check_circle', color = 'var(--secondary)') => {
        setToast({ msg, icon, color });
        setTimeout(() => setToast(null), 3500);
    };

    const handleExport = () => {
        // Build CSV with current page-relevant data
        const now = new Date().toISOString().slice(0,10);
        const rows = [
            ['CloudCarbonSeq — Exported Data', `Generated: ${now}`, '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
            ['Credit ID', 'Date Issued', 'Project Source', 'Amount (tCO₂e)', 'Status', 'Buyer', 'Value (₹ INR)'],
            ['CCS-2025-0X9F', '24 MAY 2025', 'Western Ghats Reforest',  '12400', 'verified', 'Tesla Group',     `₹${Math.round(12400 * PRICE_PER_T)}`],
            ['CCS-2025-4K1L', '22 MAY 2025', 'Sundarbans Mangrove',      '8150',  'pending',  'Microsoft ESG',   `₹${Math.round(8150  * PRICE_PER_T)}`],
            ['CCS-2025-1P88', '20 MAY 2025', 'Nilgiri Biosphere',        '45000', 'retired',  'Goldman Sachs',   `₹${Math.round(45000 * PRICE_PER_T)}`],
            ['CCS-2025-W2N2', '18 MAY 2025', 'Namdapha National Park',   '2100',  'verified', 'Apple Inc.',      `₹${Math.round(2100  * PRICE_PER_T)}`],
            ['CCS-2025-Q7B3', '15 MAY 2025', 'Silent Valley Protected',  '6800',  'verified', 'Google DeepMind', `₹${Math.round(6800  * PRICE_PER_T)}`],
            ['', '', '', '', '', '', ''],
            ['TOTAL', '', '', `${TOTAL_TONNES} tCO₂e`, '', '', `₹${Math.round(TOTAL_TONNES * PRICE_PER_T)}`],
            ['', '', '', '', '', '', ''],
            ['Notes: All values carry ±5% confidence margin.', `Price used: ₹${PRICE_PER_T}/tCO₂e`, 'Standard: Verra VCS v4.2', '', '', '', ''],
        ];

        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `CloudCarbonSeq_Export_${now}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`CSV downloaded: CloudCarbonSeq_Export_${now}.csv`, 'download_done', 'var(--secondary)');
    };

    const handleSupportSend = () => {
        const subject = encodeURIComponent(`[CloudCarbonSeq Support] ${supportForm.issue} — ${supportForm.name}`);
        const body    = encodeURIComponent(
            `Support Request\n\nName: ${supportForm.name}\nEmail: ${supportForm.email}\nIssue Type: ${supportForm.issue}\n\nDescription:\n${supportForm.msg}`
        );
        window.open(`mailto:smilyff9894@gmail.com?subject=${subject}&body=${body}`);
        setSupportSent(true);
        showToast('Support request opened in email client.', 'send', 'var(--tertiary)');
    };

    return (
        <>
        {/* Toast notification */}
        {toast && (
            <div style={{
                position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--surface-container-highest)', color: 'var(--on-surface)',
                padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
                border: '1px solid rgba(173,179,180,0.3)', zIndex: 9999, fontSize: 'var(--font-sm)',
                fontWeight: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease',
            }}>
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: 20, color: toast.color }}>{toast.icon}</span>
                {toast.msg}
            </div>
        )}

        <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Brand */}
            <div
                style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 12, height: 'var(--header-height)', cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <div style={{ width: 32, height: 32, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined ms-filled" style={{ fontSize: 20, color: 'white' }}>cloud_done</span>
                </div>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 'var(--font-lg)', letterSpacing: '-0.03em', textTransform: 'uppercase', color: 'var(--on-surface)', lineHeight: 1 }}>
                        CloudCarbonSeq
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginTop: 1 }}>
                        Carbon Intelligence
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {navItems.map(({ path, label, icon }) => {
                    const isActive = path === '/app'
                        ? location.pathname === '/app'
                        : location.pathname.startsWith(path);
                    return (
                        <NavLink key={path} to={path}
                            className={isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
                            style={{ textDecoration: 'none' }}
                            onClick={onClose}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
                            <span style={{ fontSize: 'var(--font-base)' }}>{label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Export Button — real CSV download */}
            <div style={{ padding: '12px', borderTop: '1px solid rgba(173,179,180,0.2)' }}>
                <button className="btn-primary" onClick={handleExport} style={{ width: '100%', justifyContent: 'center', fontSize: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                    Export CSV Report
                </button>
            </div>

            {/* Bottom Links */}
            <div style={{ padding: '8px 12px 16px' }}>
                <button className="settings-item" onClick={() => setActiveModal('settings')}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--on-surface-variant)' }}>settings</span>
                    <span>Settings</span>
                </button>
                <button className="settings-item" onClick={() => { setActiveModal('support'); setSupportSent(false); }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--on-surface-variant)' }}>help</span>
                    <span>Support</span>
                </button>
            </div>
        </aside>

        {/* Modals */}
        {activeModal && (
            <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                <div className="modal-panel" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                    <div className="modal-header" style={{ padding: '16px 20px' }}>
                        <h2 className="modal-title" style={{ fontSize: 'var(--font-md)' }}>
                            {activeModal === 'settings' ? 'Global Settings' : 'Support Desk'}
                        </h2>
                        <button className="modal-close" onClick={() => setActiveModal(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="modal-body" style={{ padding: 20 }}>
                        {activeModal === 'settings' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Data Display</h4>
                                    <p style={{ fontSize: 'var(--font-sm)', marginTop: 4 }}>Unit: <strong>tCO₂e</strong> (tonnes CO₂ equivalent) · Currency: <strong>₹ INR</strong></p>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Telemetry Polling</h4>
                                    <p style={{ fontSize: 'var(--font-sm)', marginTop: 4 }}>Price ticker updates every 6s. Satellite data: ~5 day revisit. Managed by Azure Monitor.</p>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Confidence Margin</h4>
                                    <p style={{ fontSize: 'var(--font-sm)', marginTop: 4 }}>All carbon values carry <strong>±5% confidence interval</strong> per IPCC measurement standard.</p>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                    <input type="checkbox" defaultChecked />
                                    <span style={{ fontSize: 'var(--font-sm)' }}>Allow desktop notifications</span>
                                </label>
                            </div>
                        ) : (
                            /* Support Panel */
                            supportSent ? (
                                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                    <span className="material-symbols-outlined ms-filled" style={{ fontSize: 48, color: 'var(--secondary)', display: 'block', marginBottom: 12 }}>check_circle</span>
                                    <div style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>Ticket Opened!</div>
                                    <p style={{ color: 'var(--on-surface-variant)', marginTop: 8, fontSize: 'var(--font-sm)' }}>Your email app has been opened with your support request. Please send the email to complete submission.</p>
                                    <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ justifyContent: 'center', marginTop: 20 }}>Done</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--on-surface-variant)' }}>
                                        Having an issue? Fill in the form below — your message will open in your email client.
                                    </p>
                                    {[
                                        { label: 'Your Name', key: 'name', type: 'text', placeholder: 'Full name' },
                                        { label: 'Your Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
                                    ].map(({ label, key, type, placeholder }) => (
                                        <div key={key}>
                                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 4 }}>{label}</div>
                                            <input type={type} placeholder={placeholder} value={supportForm[key]}
                                                onChange={e => setSupportForm(f => ({ ...f, [key]: e.target.value }))}
                                                style={{ width: '100%', background: 'var(--surface-container)', border: '1px solid rgba(173,179,180,0.3)', padding: '8px 10px', fontSize: 'var(--font-sm)', color: 'var(--on-surface)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                                        </div>
                                    ))}
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Issue Type</div>
                                        <select value={supportForm.issue} onChange={e => setSupportForm(f => ({ ...f, issue: e.target.value }))}
                                            className="filter-select" style={{ width: '100%' }}>
                                            <option value="">Select issue type…</option>
                                            <option value="Data Accuracy">Data Accuracy Issue</option>
                                            <option value="UI Bug">UI / Display Bug</option>
                                            <option value="Export Problem">Export / Download Problem</option>
                                            <option value="Access Issue">Login / Access Issue</option>
                                            <option value="General Enquiry">General Enquiry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Description</div>
                                        <textarea rows={3} placeholder="Describe your issue in detail…" value={supportForm.msg}
                                            onChange={e => setSupportForm(f => ({ ...f, msg: e.target.value }))}
                                            style={{ width: '100%', background: 'var(--surface-container)', border: '1px solid rgba(173,179,180,0.3)', padding: '8px 10px', fontSize: 'var(--font-sm)', color: 'var(--on-surface)', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                                    </div>
                                    <button className="btn-primary" onClick={handleSupportSend}
                                        disabled={!supportForm.name || !supportForm.email || !supportForm.issue || !supportForm.msg}
                                        style={{ justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                                        Submit via Email
                                    </button>
                                    <p style={{ fontSize: 9, color: 'var(--on-surface-variant)', textAlign: 'center' }}>Opens your email app · To: smilyff9894@gmail.com</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
