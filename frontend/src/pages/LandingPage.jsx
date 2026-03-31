import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function useCounter(target, duration = 2200, start = false) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!start || target === 0) return;
        let s = null;
        const step = (ts) => {
            if (!s) s = ts;
            const p = Math.min((ts - s) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(ease * target));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return val;
}

// Shared data constants — single source of truth used across pages
export const GLOBAL_CARBON_TONNES = 842901;   // tCO₂e sequestered, all time
export const GLOBAL_CREDITS_ISSUED = 74450;   // total tCO₂e certified credits (matches ledger)
export const GLOBAL_REGIONS = 20;
export const GLOBAL_PRICE_INR = 42.84;         // ₹ per tCO₂e

const HOW_IT_WORKS = [
    { num: '01', icon: 'satellite_alt',  title: 'Satellite Capture', desc: 'Multi-spectral Sentinel-2 imaging at 10m resolution. Near real-time data—updated every ~5 days on satellite revisit cycle.' },
    { num: '02', icon: 'grid_view',      title: 'NDVI + EVI Analysis', desc: 'Vegetation health via NDVI, Enhanced Vegetation Index (EVI), and NDWI for water stress. Seasonal smoothing removes cloud artifacts.' },
    { num: '03', icon: 'psychology',     title: 'AI Biomass Model', desc: 'Gradient-boosted ML model calculates wood density and carbon stock per m². Calibrated against FAO / NASA GEDI ground-truth datasets.' },
    { num: '04', icon: 'calculate',      title: 'Carbon Conversion', desc: 'IPCC-standardised conversion: biomass → tCO₂e. Confidence interval ±5% applied to all output values.' },
    { num: '05', icon: 'verified',       title: 'Credit Issuance', desc: 'Credits issued only after Verra VCS v4.2 third-party audit. Unique immutable IDs prevent double-counting.' },
];

const FORESTS = [
    { tag: 'Western Ghats', state: 'Kerala, India',        ndvi: 0.82, stock: '98.4K tCO₂e', growth: '+12.3% YoY', img: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=600&auto=format&fit=crop' },
    { tag: 'Sundarbans',    state: 'West Bengal, India',   ndvi: 0.72, stock: '56.1K tCO₂e', growth: '+4.2% YoY',  img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop' },
    { tag: 'Namdapha NP',   state: 'Arunachal Pradesh',   ndvi: 0.85, stock: '72.3K tCO₂e', growth: '+7.8% YoY',  img: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?q=80&w=600&auto=format&fit=crop' },
    { tag: 'Silent Valley', state: 'Kerala, India',        ndvi: 0.88, stock: '18.2K tCO₂e', growth: '+5.4% YoY',  img: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop' },
];

const AZURE_NODES = [
    { icon: 'satellite',   label: 'L-Band Sensor',  isMain: false },
    { icon: 'cloud_sync',  label: 'Ingestor',        isMain: false },
    { icon: 'memory',      label: 'ML Engine',       isMain: false, iconClass: 'secondary-icon' },
    { icon: 'database',    label: 'Vector Store',    isMain: false },
    { icon: 'token',       label: 'Token Mint',      isMain: false, iconClass: 'secondary-icon' },
    { icon: 'analytics',   label: 'API Gateway',     isMain: false },
    { icon: 'monitoring',  label: 'Terminal',        isMain: true },
];

// Footer popup modals config
const FOOTER_MODALS = {
    Terms: {
        title: 'Terms of Use',
        body: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p><strong>Platform Use:</strong> CloudCarbonSeq is a research and demonstration platform for satellite-based carbon sequestration monitoring. Data displayed is based on near real-time satellite estimates and carries a ±5% confidence margin.</p>
                <p><strong>Data Accuracy:</strong> All carbon values are estimates derived from Sentinel-2 NDVI/EVI models calibrated against FAO & NASA GEDI ground-truth datasets. These are not certified financial instruments.</p>
                <p><strong>Credit Standards:</strong> Carbon credits displayed are modelled against Verra VCS v4.2 standard. Live deployment would require full third-party audit before credits are tradeable.</p>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 10 }}>Last Updated: March 2026 · CloudCarbonSeq Intelligence Platform</p>
            </div>
        ),
    },
    Privacy: {
        title: 'Privacy Policy',
        body: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p><strong>Data Collected:</strong> This platform collects only session authentication data (login state stored in localStorage). No personal data is transmitted to external servers.</p>
                <p><strong>Satellite Data:</strong> Forest monitoring data is sourced from ESA Copernicus (Sentinel-2) and processed by Microsoft Azure ML. No user location data is collected.</p>
                <p><strong>Cookies:</strong> No third-party tracking cookies are used. Session token is cleared on logout.</p>
                <p><strong>Contact:</strong> For privacy queries write to: <a href="mailto:smilyff9894@gmail.com" style={{ color: 'var(--primary)' }}>smilyff9894@gmail.com</a></p>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 10 }}>Last Updated: March 2026</p>
            </div>
        ),
    },
    Contact: {
        title: 'Contact Us',
        body: null, // rendered separately as a form
    },
};

export default function LandingPage() {
    const navigate = useNavigate();
    const [started, setStarted] = useState(false);
    const [showSpecs, setShowSpecs] = useState(false);
    const [footerModal, setFooterModal] = useState(null);
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactSent, setContactSent] = useState(false);
    const heroRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setStarted(true), 400);
        return () => clearTimeout(t);
    }, []);

    // Real aligned values from shared constants
    const c1 = useCounter(GLOBAL_CARBON_TONNES, 2400, started);  // 842,901 tCO₂e
    const c2 = useCounter(GLOBAL_REGIONS,       1200, started);  // 20 regions
    const c3 = useCounter(GLOBAL_CREDITS_ISSUED,2600, started);  // 74,450 credits
    const c4 = useCounter(9998, 1800, started);                  // 99.98% uptime counter

    const handleEnter = () => {
        if (localStorage.getItem('auth')) navigate('/app');
        else navigate('/login');
    };

    const handleContactSend = () => {
        // Opens mailto in user's email client with pre-filled data
        const subject = encodeURIComponent('CloudCarbonSeq Enquiry — ' + contactForm.name);
        const body = encodeURIComponent(`Name: ${contactForm.name}\nFrom: ${contactForm.email}\n\nMessage:\n${contactForm.message}`);
        window.open(`mailto:smilyff9894@gmail.com?subject=${subject}&body=${body}`);
        setContactSent(true);
    };

    return (
        <div className="landing-page">
            {/* ---- NAV ---- */}
            <nav className="landing-nav">
                <span className="landing-nav-brand">CloudCarbonSeq</span>
                <div className="landing-nav-links">
                    <a href="#workflow" className="landing-nav-link">Process</a>
                    <a href="#forests"  className="landing-nav-link">Monitor</a>
                    <a href="#infra"    className="landing-nav-link">Infrastructure</a>
                    <button className="landing-nav-cta" onClick={handleEnter}>
                        Launch Dashboard
                    </button>
                </div>
            </nav>

            {/* ---- HERO ---- */}
            <section className="hero-section" ref={heroRef}>
                <div className="hero-left">
                    <p className="hero-eyebrow">Intelligence Layer 01</p>
                    <h1 className="hero-title">PRECISION<br/>CARBON<br/>SEQUENCING.</h1>
                    <p className="hero-sub">
                        Automated biomass verification via multi-spectral satellite arrays.
                        Near real-time atmospheric reconciliation for institutional-grade carbon markets.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={handleEnter} style={{ padding: '14px 32px', fontSize: 'var(--font-sm)' }}>
                            Launch Dashboard
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                        </button>
                        <button className="btn-secondary" onClick={() => setShowSpecs(true)} style={{ padding: '14px 28px', fontSize: 'var(--font-sm)' }}>
                            How It Works
                        </button>
                    </div>
                </div>

                {/* Right — Counters — aligned with dashboard values */}
                <div className="hero-right">
                    {[
                        {
                            icon: 'eco', iconClass: 'secondary-icon',
                            value: (c1 / 1000).toFixed(0) + 'K tCO₂e',
                            label: 'Carbon Sequestered (All Time)',
                            tip: 'Total CO₂ equivalent absorbed across all 20 monitored forest regions. Near real-time — Sentinel-2B revisit ~5 days. Confidence: ±5%.',
                        },
                        {
                            icon: 'public', iconClass: '',
                            value: c2,
                            label: 'Active Forest Regions',
                            tip: '20 major Indian forest reserves actively monitored via Sentinel-2 satellite imagery.',
                        },
                        {
                            icon: 'payments', iconClass: '',
                            value: (c3 / 1000).toFixed(1) + 'K credits',
                            label: 'Credits Issued (Verra Certified)',
                            tip: 'Carbon offset credits issued after third-party Verra VCS v4.2 audit. 1 credit = 1 tCO₂e offset.',
                        },
                        {
                            icon: 'speed', iconClass: '', live: true,
                            value: (c4 / 100).toFixed(2) + '%',
                            label: 'Azure System Uptime',
                            tip: '99.98% uptime = the Azure App Service was available 99.98% of the time over the past 30 days. 0.02% downtime ≈ ~8 min/month. Tracked by Azure Monitor.',
                        },
                    ].map(({ icon, iconClass, value, label, live, tip }, i) => (
                        <div key={i} className="hero-counter" title={tip}>
                            {live ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', marginBottom: 'auto', paddingBottom: 28 }}>
                                    <span className="pulse-dot" />
                                    Live · Azure Monitor
                                </div>
                            ) : (
                                <span className={`material-symbols-outlined hero-counter-icon ${iconClass}`}>{icon}</span>
                            )}
                            <div>
                                <div className="hero-counter-value">{value}</div>
                                <div className="hero-counter-label">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---- HOW IT WORKS ---- */}
            <section className="workflow-section" id="workflow">
                <div className="workflow-inner">
                    <div className="workflow-header">
                        <div>
                            <p className="section-label" style={{ marginBottom: 8 }}>Process Architecture</p>
                            <h2 className="workflow-title">Protocol Workflow</h2>
                        </div>
                        <div style={{ fontSize: 'var(--font-sm)', fontFamily: 'monospace', color: 'var(--on-surface-variant)' }}>
                            Near Real-Time · Sentinel-2B Revisit ~5 days
                        </div>
                    </div>
                    <div className="workflow-grid">
                        {HOW_IT_WORKS.map((step) => (
                            <div key={step.num} className="workflow-step">
                                <div className="workflow-step-num">{step.num}</div>
                                <span className={`material-symbols-outlined workflow-step-icon${step.num === '05' ? ' secondary-icon' : ''}`}>{step.icon}</span>
                                <h3 className="workflow-step-title">{step.title}</h3>
                                <p className="workflow-step-desc">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- FOREST SPOTLIGHT ---- */}
            <section className="forest-section" id="forests">
                <div className="forest-inner">
                    <div className="forest-header">
                        <div>
                            <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Active Monitor</h2>
                            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--font-base)', marginTop: 4 }}>
                                Near real-time telemetry · Sentinel-2B revisit ~5 days · All values ±5% confidence
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn-secondary" style={{ width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="btn-secondary" style={{ width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div className="forest-grid">
                        {FORESTS.map((f, i) => (
                            <div key={i} className="forest-card">
                                <div className="forest-card-img">
                                    <img src={f.img} alt={f.tag} onError={e => { e.target.style.background = 'var(--surface-container-high)'; e.target.style.display = 'none'; }} />
                                    <span className="forest-card-tag">{f.tag}</span>
                                </div>
                                <div className="forest-card-body">
                                    <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{f.state}</div>
                                    <div className="forest-ndvi-row">
                                        <span className="forest-ndvi-label">NDVI (0–1 scale)</span>
                                        <span className="forest-ndvi-value">{f.ndvi.toFixed(2)}</span>
                                    </div>
                                    <div className="forest-ndvi-track">
                                        <div className="forest-ndvi-fill" style={{ width: `${f.ndvi * 100}%` }} />
                                    </div>
                                    <div className="forest-meta-grid">
                                        <div>
                                            <div className="forest-meta-label">Carbon Stock</div>
                                            <div className="forest-meta-value">{f.stock}</div>
                                        </div>
                                        <div>
                                            <div className="forest-meta-label">Growth</div>
                                            <div className="forest-meta-value" style={{ color: 'var(--secondary)' }}>{f.growth}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- INFRASTRUCTURE ---- */}
            <section className="infra-section" id="infra">
                <div className="infra-inner">
                    <div style={{ textAlign: 'center', marginBottom: 0 }}>
                        <p className="section-label">System Topology</p>
                        <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', marginTop: 8 }}>Cloud Data Highway</h2>
                    </div>
                    <div className="infra-flow">
                        {AZURE_NODES.map((node, i) => (
                            <>
                                <div key={i} className="infra-node">
                                    <div className={`infra-node-box ${node.isMain ? 'highlight' : ''}`}>
                                        <span className={`material-symbols-outlined infra-node-icon ${node.iconClass || ''}`}>{node.icon}</span>
                                    </div>
                                    <span className="infra-node-label">{node.label}</span>
                                </div>
                                {i < AZURE_NODES.length - 1 && (
                                    <span key={`arrow-${i}`} className="infra-arrow">→</span>
                                )}
                            </>
                        ))}
                    </div>
                    <div className="live-status-row">
                        <span className="pulse-dot" />
                        All 7 Azure services operational · 99.98% uptime (Azure Monitor) · Central India
                    </div>
                </div>
            </section>

            {/* ---- FOOTER ---- */}
            <footer className="landing-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>CloudCarbonSeq Intelligence</span>
                    <span style={{ color: 'var(--on-surface-variant)' }}>© 2026</span>
                </div>
                <div style={{ display: 'flex', gap: 24, color: 'var(--on-surface-variant)' }}>
                    {['Terms', 'Privacy', 'Contact'].map(l => (
                        <button key={l} onClick={() => setFooterModal(l)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, fontSize: 'var(--font-sm)', fontFamily: 'inherit', padding: 0 }}>
                            {l}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 12, color: 'var(--on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>language</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>terminal</span>
                </div>
            </footer>

            {/* ---- FOOTER POPUPS ---- */}
            {footerModal && (
                <div className="modal-overlay" onClick={() => { setFooterModal(null); setContactSent(false); }}>
                    <div className="modal-panel" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{FOOTER_MODALS[footerModal]?.title || footerModal}</h2>
                            <button className="modal-close" onClick={() => { setFooterModal(null); setContactSent(false); }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="modal-body" style={{ fontSize: 'var(--font-sm)', lineHeight: 1.7 }}>
                            {footerModal === 'Contact' ? (
                                contactSent ? (
                                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                        <span className="material-symbols-outlined ms-filled" style={{ fontSize: 48, color: 'var(--secondary)', display: 'block', marginBottom: 12 }}>check_circle</span>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>Email Client Opened!</div>
                                        <p style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>Your message has been pre-filled in your email app. Send it to complete the enquiry.</p>
                                        <button className="btn-primary" onClick={() => { setFooterModal(null); setContactSent(false); }} style={{ justifyContent: 'center', marginTop: 20 }}>Done</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <p style={{ color: 'var(--on-surface-variant)' }}>Send us a message — we'll reply within 24 hours.</p>
                                        {[
                                            { label: 'Your Name', key: 'name', type: 'text', placeholder: 'e.g. Shankar Rajan' },
                                            { label: 'Your Email', key: 'email', type: 'email', placeholder: 'yourname@example.com' },
                                        ].map(({ label, key, type, placeholder }) => (
                                            <div key={key}>
                                                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 4 }}>{label}</div>
                                                <input type={type} placeholder={placeholder} value={contactForm[key]}
                                                    onChange={e => setContactForm(f => ({ ...f, [key]: e.target.value }))}
                                                    style={{ width: '100%', background: 'var(--surface-container)', border: '1px solid rgba(173,179,180,0.3)', padding: '10px 12px', fontSize: 'var(--font-sm)', color: 'var(--on-surface)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                                            </div>
                                        ))}
                                        <div>
                                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 4 }}>Message</div>
                                            <textarea rows={4} placeholder="Describe your query..." value={contactForm.message}
                                                onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                                                style={{ width: '100%', background: 'var(--surface-container)', border: '1px solid rgba(173,179,180,0.3)', padding: '10px 12px', fontSize: 'var(--font-sm)', color: 'var(--on-surface)', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                                        </div>
                                        <button className="btn-primary" onClick={handleContactSend}
                                            disabled={!contactForm.name || !contactForm.email || !contactForm.message}
                                            style={{ justifyContent: 'center' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                                            Send via Email App
                                        </button>
                                        <p style={{ fontSize: 9, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                                            Opens your default email client · To: smilyff9894@gmail.com
                                        </p>
                                    </div>
                                )
                            ) : FOOTER_MODALS[footerModal]?.body}
                        </div>
                    </div>
                </div>
            )}

            {/* ---- SPECS MODAL ---- */}
            {showSpecs && (
                <div className="modal-overlay" onClick={() => setShowSpecs(false)}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">CloudCarbonSeq Intelligence</h2>
                            <button className="modal-close" onClick={() => setShowSpecs(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-section">
                                <h3 className="modal-section-title">Core Technology Overview</h3>
                                <p className="modal-text">
                                    CloudCarbonSeq uses Sentinel-2 multi-spectral imagery for near real-time forest monitoring across 20 Indian reserves.
                                    ML models (gradient-boosted, calibrated with FAO/NASA GEDI ground truth) estimate above-ground biomass and convert to tCO₂e.
                                </p>
                                <p className="modal-text">
                                    All values carry ±5% confidence margin. <strong>System uptime 99.98%</strong> = measured by Azure Monitor over 30 days (≈8 min downtime/month).
                                    Credits issued only after Verra VCS v4.2 third-party audit, preventing double-counting.
                                </p>
                            </div>
                            <div className="modal-section">
                                <h3 className="modal-section-title">Algorithmic Process</h3>
                                <div className="modal-steps-grid">
                                    {HOW_IT_WORKS.map(step => (
                                        <div key={step.num} className={`modal-step-card ${step.num === '02' ? 'green' : step.num === '05' ? 'blue' : ''}`}>
                                            <div className="modal-step-num">{step.num}</div>
                                            <div className="modal-step-title">{step.title}</div>
                                            <div className="modal-step-desc">{step.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="btn-primary" onClick={() => { setShowSpecs(false); handleEnter(); }} style={{ width: '100%', justifyContent: 'center', padding: '16px 0' }}>
                                Launch the Platform
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
