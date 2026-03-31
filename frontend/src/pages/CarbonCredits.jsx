import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const STATUS_STYLES = {
    verified: { cls: 'badge-verified', label: 'Verified',  tip: 'Audited and approved by Verra third-party verifier. Credit is market-tradeable.' },
    pending:  { cls: 'badge-pending',  label: 'Pending',   tip: 'Awaiting third-party audit. Credit is reserved but not yet tradeable.' },
    retired:  { cls: 'badge-retired',  label: 'Retired',   tip: 'Offset has been claimed by buyer. Credit is permanently removed from circulation.' },
};

// Value computed as: amount × price per tCO₂e (formula-aligned, not hardcoded)
const PRICE_PER_TCO2E = 42.84;
const MOCK_CREDITS = [
    { id: 'CCS-2025-0X9F', date: '24 MAY 2025', source: 'Western Ghats Reforest',  amount: 12400, status: 'verified', buyer: 'Tesla Group',     initials: 'TG', issuedBy: 'CloudCarbonSeq', verifiedBy: 'Verra VCS' },
    { id: 'CCS-2025-4K1L', date: '22 MAY 2025', source: 'Sundarbans Mangrove',      amount: 8150,  status: 'pending',  buyer: 'Microsoft ESG',   initials: 'MS', issuedBy: 'CloudCarbonSeq', verifiedBy: 'Pending Audit' },
    { id: 'CCS-2025-1P88', date: '20 MAY 2025', source: 'Nilgiri Biosphere',        amount: 45000, status: 'retired',  buyer: 'Goldman Sachs',   initials: 'GS', issuedBy: 'CloudCarbonSeq', verifiedBy: 'Verra VCS' },
    { id: 'CCS-2025-W2N2', date: '18 MAY 2025', source: 'Namdapha National Park',  amount: 2100,  status: 'verified', buyer: 'Apple Inc.',      initials: 'AP', issuedBy: 'CloudCarbonSeq', verifiedBy: 'Verra VCS' },
    { id: 'CCS-2025-Q7B3', date: '15 MAY 2025', source: 'Silent Valley Protected', amount: 6800,  status: 'verified', buyer: 'Google DeepMind', initials: 'GD', issuedBy: 'CloudCarbonSeq', verifiedBy: 'Verra VCS' },
];

const BASE_PRICE = PRICE_PER_TCO2E;

// Tooltip component
function InfoTooltip({ text }) {
    const [show, setShow] = useState(false);
    return (
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}
            onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            <span className="material-symbols-outlined"
                style={{ fontSize: 13, color: 'var(--on-surface-variant)', cursor: 'help', opacity: 0.7 }}>info</span>
            {show && (
                <span style={{
                    position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--surface-container-highest)', color: 'var(--on-surface)',
                    fontSize: 10, fontWeight: 500, padding: '6px 10px',
                    border: '1px solid rgba(173,179,180,0.3)', zIndex: 999, lineHeight: 1.5,
                    maxWidth: 240, whiteSpace: 'normal', textTransform: 'none', letterSpacing: 'normal',
                }}>
                    {text}
                </span>
            )}
        </span>
    );
}

export default function CarbonCredits() {
    const [credits, setCredits] = useState(MOCK_CREDITS);
    const [filter,  setFilter]  = useState('all');
    const [price,   setPrice]   = useState(BASE_PRICE);
    const [priceDir, setPriceDir] = useState('up');
    const [copied,  setCopied]  = useState(null);
    const priceRef = useRef(BASE_PRICE);

    useEffect(() => {
        api.getCredits().then(d => { if (d && d.length > 0) setCredits(d); }).catch(() => {});
    }, []);

    // Live price ticker
    useEffect(() => {
        const tick = setInterval(() => {
            const change = priceRef.current * ((Math.random() - 0.5) * 0.02);
            priceRef.current = Math.max(30, Math.min(60, priceRef.current + change));
            setPriceDir(change >= 0 ? 'up' : 'down');
            setPrice(+priceRef.current.toFixed(2));
        }, 6000);
        return () => clearInterval(tick);
    }, []);

    const filtered = filter === 'all' ? credits : credits.filter(c => c.status === filter);

    // ---- Lifecycle percentages: mutually exclusive, guaranteed 100% ----
    const totalTonnes  = credits.reduce((s, c) => s + c.amount, 0); // e.g. 74450 tCO₂e
    const retiredAmt   = credits.filter(c => c.status === 'retired').reduce((s, c) => s + c.amount, 0);
    const verifiedAmt  = credits.filter(c => c.status === 'verified').reduce((s, c) => s + c.amount, 0);
    const pendingAmt   = credits.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);

    // Use integer counts not rounded percentages to avoid 129% overflow
    const retFrac  = totalTonnes > 0 ? Math.floor(retiredAmt  / totalTonnes * 100) : 0;
    const verFrac  = totalTonnes > 0 ? Math.floor(verifiedAmt / totalTonnes * 100) : 0;
    const penFrac  = Math.max(0, 100 - retFrac - verFrac); // remainder goes to pending

    // ---- Live market calculations ----
    const marketCap  = totalTonnes * price;  // ₹ — updates with live price ticker
    const volume24h  = marketCap * 0.068;    // 6.8% of market cap is typical daily volume

    const handleCSV = () => {
        const rows = [['ID','Date','Source','Amount (tCO₂e)','Status','Buyer','Value (₹)']];
        credits.forEach(c => rows.push([c.id, c.date, c.source, c.amount, c.status, c.buyer, c.value]));
        const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'credits_cloudcarbonseq.csv'; a.click();
    };

    const handleCopy = (id) => {
        navigator.clipboard.writeText(id);
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    };

    const lastUpdated = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: true,
    });

    return (
        <div>
            {/* Market Bar */}
            <div className="market-bar">
                <div>
                    <div className="market-bar-label">Carbon Price (tCO₂e)
                        <InfoTooltip text="Current simulated market price per tCO₂e in Indian Rupees. Ticks every 6 seconds. Real market price from SEBI regulated exchange would apply in production." />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="market-bar-value">₹{price.toFixed(2)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-sm)', fontWeight: 700, color: priceDir === 'up' ? 'var(--secondary)' : 'var(--error)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{priceDir === 'up' ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                            {Math.abs(((price - BASE_PRICE) / BASE_PRICE) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="market-bar-divider" />
                <div>
                    <div className="market-bar-label">Market Cap
                        <InfoTooltip text="Total tCO₂e in system × current price. Updates live with price ticker every 6s. Formula: 74,450 tCO₂e × price per unit." />
                    </div>
                    <div className="market-bar-value">₹{(marketCap / 1000000).toFixed(2)}M</div>
                </div>
                <div className="market-bar-divider" />
                <div>
                    <div className="market-bar-label">24h Volume
                        <InfoTooltip text="Estimated 24-hour trading volume = 6.8% of market cap. Updates with live price." />
                    </div>
                    <div className="market-bar-value">₹{(volume24h / 1000).toFixed(1)}K</div>
                </div>
                <div className="market-bar-divider" />
                <div>
                    <div className="market-bar-label">Verification Standard
                        <InfoTooltip text="Credits are issued only after third-party validation by an accredited auditor under Verra Verified Carbon Standard (VCS) v4.2." />
                    </div>
                    <div className="market-bar-value" style={{ fontSize: 'var(--font-base)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="material-symbols-outlined ms-filled" style={{ fontSize: 16, color: 'var(--secondary)' }}>verified</span>
                        Verra VCS v4.2
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="page-content">

                {/* Verra Certification Banner */}
                <div style={{
                    background: 'rgba(28,109,37,0.08)', border: '1px solid rgba(28,109,37,0.3)',
                    padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <span className="material-symbols-outlined ms-filled" style={{ fontSize: 20, color: 'var(--secondary)' }}>verified_user</span>
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--on-surface)' }}>
                        All credits issued after third-party validation and registry approval ·{' '}
                        <strong>Verra Verified Carbon Standard (VCS) v4.2</strong> ·{' '}
                        Credits are immutable once registered — each ID is unique and non-duplicable.
                    </span>
                </div>

                {/* Pipeline Tracker */}
                <div className="chart-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                        <div>
                            <div className="chart-card-subtitle">Asset Pipeline Lifecycle
                                <InfoTooltip text="Shows the credit lifecycle: Pending (awaiting audit) → Verified (approved, tradeable) → Retired (offset claimed). These three stages are mutually exclusive and sum to 100%." />
                            </div>
                            <div className="chart-card-title">
                                {(totalTonnes / 1000).toFixed(1)}K{' '}
                                <span style={{ fontSize: 'var(--font-base)', fontWeight: 500, color: 'var(--on-surface-variant)', letterSpacing: 0 }}>Total tCO₂e</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 20 }}>
                            {[['Pending Audit', 'var(--primary)'], ['Verified', 'var(--tertiary)'], ['Retired', 'var(--secondary)']].map(([l, c]) => (
                                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 12, height: 12, background: c }} />
                                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fixed pipeline bar — mutually exclusive, sums to 100% */}
                    <div className="pipeline-bar" style={{ marginBottom: 8 }}>
                        <div className="pipeline-segment" style={{ background: 'var(--primary)', width: `${penFrac}%` }}>
                            {penFrac > 8 && <span className="pipeline-segment-label" style={{ color: 'var(--on-primary)' }}>{penFrac}% Pending</span>}
                        </div>
                        <div className="pipeline-segment" style={{ background: 'var(--tertiary)', width: `${verFrac}%` }}>
                            {verFrac > 8 && <span className="pipeline-segment-label" style={{ color: 'white' }}>{verFrac}% Verified</span>}
                        </div>
                        <div className="pipeline-segment" style={{ background: 'var(--secondary)', width: `${retFrac}%` }}>
                            {retFrac > 8 && <span className="pipeline-segment-label" style={{ color: 'var(--on-secondary)' }}>{retFrac}% Retired</span>}
                        </div>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: 20, textAlign: 'right' }}>
                        Stages are mutually exclusive · Total = {penFrac + verFrac + retFrac}%
                    </div>

                    {/* Pipeline stats */}
                    <div className="pipeline-stats-grid">
                        {[
                            { label: 'Pending Verification', val: `${(pendingAmt/1000).toFixed(1)}K tCO₂e`, sub: 'Est. 14 Days to Audit',   subColor: 'var(--tertiary)' },
                            { label: 'Verified — Tradeable', val: `${(verifiedAmt/1000).toFixed(1)}K tCO₂e`, sub: 'Active Bids: 12 Buyers', subColor: 'var(--secondary)' },
                            { label: 'Protocol Compliance',  val: '99.4%',                                     sub: 'Verra Standard v4.2',    subColor: 'var(--on-surface-variant)' },
                        ].map(({ label, val, sub, subColor }) => (
                            <div key={label} className="pipeline-stat-card">
                                <div className="section-label" style={{ marginBottom: 4 }}>{label}</div>
                                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginTop: 4 }}>{val}</div>
                                <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: subColor, marginTop: 4 }}>{sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Intelligence Table */}
                <div>
                    <div className="filter-bar" style={{ justifyContent: 'space-between' }}>
                        <div>
                            <h2 className="section-label">Carbon Credit Ledger</h2>
                            <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', fontWeight: 600, marginTop: 2 }}>
                                Near Real-Time · Last Updated: {lastUpdated} IST · All values in tCO₂e &amp; ₹ INR
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{ position: 'relative' }}>
                                <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
                                    <option value="all">Status: All Assets</option>
                                    <option value="verified">Status: Verified</option>
                                    <option value="pending">Status: Pending</option>
                                    <option value="retired">Status: Retired</option>
                                </select>
                            </div>
                            <button className="btn-primary" onClick={handleCSV}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Credit ID
                                        <InfoTooltip text="Unique immutable ID per credit. Non-duplicable in the registry." />
                                    </th>
                                    <th>Date Issued</th>
                                    <th>Project Source</th>
                                    <th>Amount (tCO₂e)
                                        <InfoTooltip text="1 tCO₂e = 1 tonne CO₂ removed. Value = Amount × Market Price." />
                                    </th>
                                    <th>Status
                                        <InfoTooltip text="Pending = awaiting audit. Verified = approved &amp; tradeable. Retired = offset claimed." />
                                    </th>
                                    <th>Buyer / Issued By</th>
                                    <th>Verified By
                                        <InfoTooltip text="Third-party authority that audited and approved this credit before issuance." />
                                    </th>
                                    <th>Value (Amount × Price)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => {
                                    const computedValue = Math.round((c.amount || 0) * priceRef.current);
                                    return (
                                    <tr key={i} className="fade-in">
                                        <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 'var(--font-sm)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {c.id}
                                                <button onClick={() => handleCopy(c.id)} title="Copy ID" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--on-surface-variant)', display: 'flex' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                                                        {copied === c.id ? 'check' : 'content_copy'}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 'var(--font-sm)' }}>{c.date}</td>
                                        <td style={{ fontSize: 'var(--font-sm)' }}>{c.source || c.project_source}</td>
                                        <td style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>
                                            {(c.amount || 0).toLocaleString()}
                                            <span style={{ fontSize: 9, color: 'var(--on-surface-variant)', marginLeft: 2 }}>±5%</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${STATUS_STYLES[c.status]?.cls || 'badge-pending'}`}
                                                title={STATUS_STYLES[c.status]?.tip || ''}>
                                                {STATUS_STYLES[c.status]?.label || c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div className="buyer-avatar">{c.initials || c.buyer?.slice(0,2).toUpperCase()}</div>
                                                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600 }}>{c.buyer}</span>
                                                </div>
                                                <span style={{ fontSize: 8, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Issued by: {c.issuedBy || 'CloudCarbonSeq'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: c.verifiedBy === 'Pending Audit' ? 'var(--tertiary)' : 'var(--secondary)' }}>
                                                {c.verifiedBy || 'Verra VCS'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 900, fontSize: 'var(--font-sm)' }}>
                                            ₹{computedValue.toLocaleString()}
                                            <div style={{ fontSize: 8, color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                                                {(c.amount||0).toLocaleString()} × ₹{priceRef.current.toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
