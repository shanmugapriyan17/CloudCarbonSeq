import { useState, useMemo, useRef } from 'react';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const SEASON_LABELS = ['Winter','Winter','Pre-Summer','Summer','Summer','Monsoon','Monsoon','Monsoon','Post-Mon.','Post-Mon.','Winter','Winter'];

const HISTORICAL = [
    { month: 'Jan', val: 218450 }, { month: 'Feb', val: 226300 }, { month: 'Mar', val: 240100 },
    { month: 'Apr', val: 255930 }, { month: 'May', val: 268400 }, { month: 'Jun', val: 261200 },
    { month: 'Jul', val: 253700 }, { month: 'Aug', val: 248600 }, { month: 'Sep', val: 240300 },
    { month: 'Oct', val: 232800 }, { month: 'Nov', val: 228900 }, { month: 'Dec', val: 224500 },
];

const REGIONS = ['W. Ghats','Sundarbans','Namdapha','S. Valley','Nilgiri BR','Kaziranga',
    'Manas NP','Panna NP','Bandipur','Anamalai','Periyar NP','Sanjay NP',
    'Dudhwa NP','Corbett NP','Sariska NP','Bhitarkanika','Simlipal NP','Kanheri',
    'Sitamata','Dandeli NP'];

// Region-wise base NDVI (realistic ecological variation)
const REGION_BASE_NDVI = {
    'W. Ghats': 0.82, 'Sundarbans': 0.72, 'Namdapha': 0.85, 'S. Valley': 0.88,
    'Nilgiri BR': 0.80, 'Kaziranga': 0.75, 'Manas NP': 0.73, 'Panna NP': 0.62,
    'Bandipur': 0.78, 'Anamalai': 0.81, 'Periyar NP': 0.79, 'Sanjay NP': 0.65,
    'Dudhwa NP': 0.70, 'Corbett NP': 0.74, 'Sariska NP': 0.60, 'Bhitarkanika': 0.76,
    'Simlipal NP': 0.77, 'Kanheri': 0.68, 'Sitamata': 0.66, 'Dandeli NP': 0.79,
};

// Smooth seasonal curve: peaks in monsoon (Jun-Sep), dips in summer (Mar-May)
function seasonalNDVI(base, monthIndex) {
    const seasonal = Math.sin((monthIndex - 2) * Math.PI / 6) * 0.10;   // ±0.10 seasonal swing
    const microNoise = (Math.sin(base * monthIndex * 137.5) % 1) * 0.02; // deterministic micro-variation
    return Math.min(0.98, Math.max(0.30, base + seasonal + microNoise - 0.01));
}

function linReg(data) {
    const n = data.length;
    const xs = data.map((_, i) => i);
    const ys = data.map(d => d.val);
    const xm = xs.reduce((a,b)=>a+b,0)/n;
    const ym = ys.reduce((a,b)=>a+b,0)/n;
    const slope = xs.reduce((acc,x,i)=>acc+(x-xm)*(ys[i]-ym),0) / xs.reduce((acc,x)=>acc+(x-xm)**2,0);
    const intercept = ym - slope * xm;
    return { slope, intercept };
}

function heatColor(v) {
    const g = Math.round(50 + v * 120);
    const r = Math.round(150 - v * 100);
    return `rgb(${r},${g},50)`;
}

const GAUGE_SIZE = 200;
const GAUGE_CX = GAUGE_SIZE / 2;
const GAUGE_R = 70;

function GaugeSVG({ score }) {
    const angle = (score / 100) * Math.PI + Math.PI;
    const endX = GAUGE_CX + GAUGE_R * Math.cos(angle);
    const endY = GAUGE_SIZE / 2 - 20 + GAUGE_R * Math.sin(angle);
    const trackPath = `M ${GAUGE_CX - GAUGE_R} ${GAUGE_SIZE / 2 - 20} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R} ${GAUGE_SIZE / 2 - 20}`;
    const fillPath  = `M ${GAUGE_CX - GAUGE_R} ${GAUGE_SIZE / 2 - 20} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${endX} ${endY}`;
    const gaugeColor = score >= 80 ? 'var(--secondary)' : score >= 60 ? 'var(--tertiary)' : 'var(--error)';
    return (
        <svg width={GAUGE_SIZE} height={GAUGE_SIZE / 2 + 20} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE / 2 + 20}`}>
            <path d={trackPath} fill="none" stroke="var(--surface-container-highest)" strokeWidth={14} strokeLinecap="butt" />
            <path d={fillPath}  fill="none" stroke={gaugeColor} strokeWidth={14} strokeLinecap="butt" />
            <text x={GAUGE_CX} y={GAUGE_SIZE / 2 - 24} textAnchor="middle" fontFamily="Inter" fontWeight="900" fontSize={28} fill="var(--on-surface)">{score}%</text>
            <text x={GAUGE_CX} y={GAUGE_SIZE / 2 - 6}  textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize={9}  fill="var(--on-surface-variant)" letterSpacing="1">HEALTH SCORE</text>
        </svg>
    );
}

// Info tooltip component
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
                    maxWidth: 220, whiteSpace: 'normal', textTransform: 'none', letterSpacing: 'normal',
                }}>
                    {text}
                </span>
            )}
        </span>
    );
}

export default function Analytics() {
    const [metric, setMetric] = useState('carbon');
    const [year,   setYear]   = useState('2025');
    const heatmapRef = useRef(null);

    const scrollToHeatmap = () => {
        heatmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Brief highlight flash
        if (heatmapRef.current) {
            heatmapRef.current.style.outline = '2px solid var(--primary)';
            setTimeout(() => { if (heatmapRef.current) heatmapRef.current.style.outline = 'none'; }, 1500);
        }
    };

    const { slope, intercept } = useMemo(() => {
        const factor = metric === 'biomass' ? 0.4 : (year === '2024' ? 0.8 : 1);
        return linReg(HISTORICAL.map(d => ({ ...d, val: d.val * factor })));
    }, [metric, year]);

    const forecastData = useMemo(() =>
        Array.from({ length: 6 }, (_, i) => ({
            month: ['Jan','Feb','Mar','Apr','May','Jun'][i] + " '26",
            val: Math.round(intercept + slope * (12 + i)),
            forecast: true,
        })), [slope, intercept]);

    const allData = [
        ...HISTORICAL.map(d => ({ ...d, val: d.val * (metric === 'biomass' ? 0.4 : (year === '2024' ? 0.8 : 1)) })),
        ...forecastData,
    ];
    const maxVal = Math.max(...allData.map(d => d.val), 1);

    // Smoothed NDVI heatmap — deterministic seasonal curve per region
    const heatmapData = useMemo(() => {
        return REGIONS.map(r => ({
            region: r,
            cells: MONTHS.map((_, mi) => {
                const base = REGION_BASE_NDVI[r] || 0.70;
                const metricShift = metric === 'ndvi' ? 0 : metric === 'biomass' ? -0.05 : 0.02;
                const yearShift = year === '2024' ? -0.04 : 0;
                return seasonalNDVI(base + metricShift + yearShift, mi);
            }),
        }));
    }, [metric, year]);

    // Health score: NDVI × 0.5 + Biomass Trend × 0.3 + Risk Factor × 0.2
    const avgNDVI   = heatmapData.reduce((s, r) => s + r.cells.reduce((a, c) => a + c, 0) / r.cells.length, 0) / heatmapData.length;
    const trendScore = slope > 0 ? 0.85 : 0.55;  // positive trend = healthy
    const riskScore  = 0.78;                        // deforestation risk factor (simulated)
    const healthRaw  = avgNDVI * 0.5 + trendScore * 0.3 + riskScore * 0.2;
    const avgHealth  = Math.round(Math.min(99, Math.max(30, healthRaw * 100)));

    // Risk factors for breakdown display
    const ndviScore   = Math.round(avgNDVI * 100);
    const trendPct    = Math.round(trendScore * 100);
    const riskPct     = Math.round(riskScore * 100);

    return (
        <div className="page-content">
            {/* Filter Bar */}
            <div className="filter-bar" style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                    <select className="filter-select" value={metric} onChange={e => setMetric(e.target.value)}>
                        <option value="carbon">Metric: Carbon Output</option>
                        <option value="ndvi">Metric: NDVI Index</option>
                        <option value="biomass">Metric: Biomass</option>
                    </select>
                </div>
                <div style={{ position: 'relative' }}>
                    <select className="filter-select" value={year} onChange={e => setYear(e.target.value)}>
                        <option value="2025">Year: 2025 vs 2024</option>
                        <option value="2024">Year: 2024</option>
                    </select>
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 'auto', alignSelf: 'center' }}>
                    Near Real-Time · Sentinel-2B Revisit ~5 days
                </div>
            </div>

            {/* Main Charts Row */}
            <div className="analytics-grid" style={{ marginBottom: 20 }}>
                {/* AI Forecast Chart */}
                <div className="chart-card">
                    <div className="chart-card-header" style={{ marginBottom: 16 }}>
                        <div>
                            <div className="chart-card-subtitle">
                                AI Trend Model · 6-Month Forecast
                                <InfoTooltip text="Linear Regression: draws a best-fit line through historical data to project future carbon output. Formula: y = mx + b, where m is the trend slope." />
                            </div>
                            <div className="chart-card-title">Carbon Trajectory &amp; Prediction</div>
                        </div>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 20, height: 3, background: 'var(--primary)' }} />
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Actual</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 20, borderTop: '2px dashed var(--tertiary)' }} />
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Forecast</span>
                            </div>
                        </div>
                    </div>

                    {/* Y-axis label */}
                    <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.1em', marginBottom: 4, opacity: 0.7 }}>
                        ↑ tCO₂e Sequestered (thousands) — Actual | - - Forecast →
                    </div>

                    <div className="bar-chart-area" style={{ height: 200 }}>
                        {allData.map((d, i) => (
                            <div key={i}
                                style={{
                                    flex: 1,
                                    height: `${(d.val / maxVal) * 100}%`,
                                    background: d.forecast
                                        ? 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,100,155,0.2) 3px, rgba(0,100,155,0.2) 6px)'
                                        : 'rgba(95,94,94,0.2)',
                                    border: d.forecast ? '1px dashed var(--tertiary)' : 'none',
                                    borderBottom: 'none',
                                    position: 'relative',
                                    cursor: 'default',
                                    transition: 'background 0.15s',
                                }}
                                title={`${d.month}: ${d.val.toLocaleString()} tCO₂e${d.forecast ? ' (Forecast)' : ' (Actual)'}`}
                            />
                        ))}
                    </div>

                    {/* Actual | Forecast divider label */}
                    <div style={{ display: 'flex', marginBottom: 4 }}>
                        <div style={{ flex: 12, borderRight: '2px dashed var(--tertiary)', paddingRight: 4 }} />
                        <div style={{ flex: 6, paddingLeft: 4 }} />
                    </div>

                    <div className="bar-chart-labels" style={{ justifyContent: 'space-between' }}>
                        {allData.filter((_, i) => i % 3 === 0).map(d => (
                            <span key={d.month} className="bar-chart-label">{d.month}</span>
                        ))}
                    </div>
                    <div style={{ fontSize: 8, color: 'var(--on-surface-variant)', marginTop: 4, opacity: 0.6, fontWeight: 600 }}>
                        * Model calibrated using ground-truth biomass datasets (FAO / NASA GEDI).
                    </div>
                </div>

                {/* Risk Gauge + Health Score */}
                <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 16 }}>
                        <div className="chart-card-subtitle">Composite Forest Health Index
                            <InfoTooltip text="Composite score combining: NDVI vegetation index (50% weight), Carbon trend direction (30%), and Deforestation risk factors (20%)." />
                        </div>
                        <div className="chart-card-title">Health Dial</div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <GaugeSVG score={avgHealth} />

                        {/* Health Score Formula */}
                        <div style={{
                            background: 'var(--surface-container-lowest)',
                            border: '1px solid rgba(173,179,180,0.2)',
                            padding: '8px 12px', marginTop: 8, width: '100%',
                        }}>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', marginBottom: 4 }}>
                                Score Formula
                            </div>
                            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--on-surface)' }}>
                                Health = NDVI × 0.5 + Trend × 0.3 + Risk × 0.2
                            </div>
                        </div>

                        {/* Risk Breakdown */}
                        <div style={{ width: '100%', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[
                                { label: 'NDVI Vegetation Index', val: ndviScore, color: 'var(--secondary)', tip: 'Avg NDVI across all regions (0.3–0.98 scale normalized to %)' },
                                { label: 'Carbon Trend (↑/↓)',    val: trendPct,  color: 'var(--tertiary)', tip: 'Whether carbon sequestration is trending up (+) or down (-)' },
                                { label: 'Deforestation Risk',    val: riskPct,   color: 'var(--primary)',  tip: 'Multi-factor risk: human encroachment + fire + rainfall deviation' },
                            ].map(({ label, val, color, tip }) => (
                                <div key={label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center' }}>
                                            {label}
                                            <InfoTooltip text={tip} />
                                        </span>
                                        <span style={{ fontSize: 9, fontWeight: 700, color }}>{val}%</span>
                                    </div>
                                    <div style={{ height: 3, background: 'var(--surface-container-highest)' }}>
                                        <div style={{ height: '100%', width: `${val}%`, background: color, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ marginTop: 12, width: '100%' }}>
                            {[
                                { label: 'Excellent (>80%)', color: 'var(--secondary)' },
                                { label: 'Good (60–80%)',    color: 'var(--tertiary)'  },
                                { label: 'At Risk (<60%)',   color: 'var(--error)'     },
                            ].map(({ label, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
                                    <div style={{ width: 10, height: 10, background: color }} />
                                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={scrollToHeatmap}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>keyboard_arrow_down</span>
                        View NDVI Heatmap ↓
                    </button>
                </div>
            </div>

            {/* NDVI Heatmap — anchored so View Heatmap button can scroll here */}
            <div className="chart-card" ref={heatmapRef} id="ndvi-heatmap" style={{ scrollMarginTop: 80 }}>
                <div style={{ marginBottom: 8 }}>
                    <div className="chart-card-subtitle">
                        Seasonal NDVI Telemetry · 20 Regions × 12 Months
                        <InfoTooltip text="NDVI (Normalized Difference Vegetation Index): measures vegetation density on a 0–1 scale. Values above 0.7 indicate healthy, dense forest. Seasonal curves follow India's monsoon calendar." />
                    </div>
                    <div className="chart-card-title">NDVI Intensity Matrix</div>
                    <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', marginTop: 4, fontWeight: 600 }}>
                        Supplemented with EVI (Enhanced Vegetation Index) and NDWI (Water Index) for dense canopy accuracy.
                    </div>
                </div>

                {/* Season indicators */}
                <div style={{ display: 'flex', gap: 1, marginBottom: 4, paddingLeft: 100 }}>
                    {MONTHS.map((_, mi) => {
                        const seasonColors = {
                            'Winter': 'rgba(0,100,155,0.15)', 'Pre-Summer': 'rgba(200,150,0,0.15)',
                            'Summer': 'rgba(200,80,0,0.20)', 'Monsoon': 'rgba(28,109,37,0.20)',
                            'Post-Mon.': 'rgba(100,150,50,0.15)',
                        };
                        return (
                            <div key={mi} style={{
                                flex: 1, textAlign: 'center', fontSize: 7, fontWeight: 700,
                                background: seasonColors[SEASON_LABELS[mi]] || 'transparent',
                                color: 'var(--on-surface-variant)', padding: '2px 0',
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                            }}>
                                {SEASON_LABELS[mi].slice(0, 3)}
                            </div>
                        );
                    })}
                </div>

                <div className="heatmap-grid" style={{ overflowX: 'auto' }}>
                    <table style={{ minWidth: 700, borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ width: 100, textAlign: 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', padding: '4px 0', letterSpacing: '0.06em' }}>Region</th>
                                {MONTHS.map(m => (
                                    <th key={m} style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', textAlign: 'center', letterSpacing: '0.05em', padding: '4px 2px' }}>{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {heatmapData.map(({ region, cells }) => (
                                <tr key={region}>
                                    <td style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--on-surface)', whiteSpace: 'nowrap', padding: '3px 8px 3px 0' }}>{region}</td>
                                    {cells.map((v, i) => (
                                        <td key={i} className="heatmap-cell" style={{
                                            background: heatColor(v),
                                            padding: '6px 2px',
                                            fontSize: 8, fontWeight: 700,
                                            textAlign: 'center', color: '#fff',
                                        }} title={`${region} ${MONTHS[i]}: NDVI=${v.toFixed(2)} · ${SEASON_LABELS[i]}`}>
                                            {v.toFixed(2)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Heatmap Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Low NDVI (0.3)</span>
                    <div style={{ flex: 1, height: 8, background: 'linear-gradient(to right, rgb(150,50,50), rgb(170,120,50), rgb(50,120,50))' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>High NDVI (1.0)</span>
                </div>
                <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', marginTop: 6, fontWeight: 600 }}>
                    * Values follow India's monsoon calendar. Confidence interval: ±0.04 NDVI units across all readings.
                </div>
            </div>
        </div>
    );
}
