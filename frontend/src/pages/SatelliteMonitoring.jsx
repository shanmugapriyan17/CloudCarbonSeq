import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../utils/api';

// All 20 monitored Indian forest reserves — matches LandingPage & Analytics data
const MOCK_REGIONS = [
    { id: 'wg-ker-01',  name: 'WESTERN GHATS',     country: 'Kerala, India',          ndvi_current: 0.82, biomass_tonnes: 98400,  health_score: 88, area_ha: 124000, lat: 10.8,  lng: 76.3  },
    { id: 'sun-wb-01',  name: 'SUNDARBANS',         country: 'West Bengal, India',     ndvi_current: 0.72, biomass_tonnes: 56100,  health_score: 74, area_ha: 82000,  lat: 21.9,  lng: 88.9  },
    { id: 'nmd-ar-01',  name: 'NAMDAPHA NP',        country: 'Arunachal Pradesh',      ndvi_current: 0.85, biomass_tonnes: 72300,  health_score: 92, area_ha: 154000, lat: 27.5,  lng: 96.7  },
    { id: 'sil-kr-01',  name: 'SILENT VALLEY',      country: 'Kerala, India',          ndvi_current: 0.88, biomass_tonnes: 18200,  health_score: 96, area_ha: 24000,  lat: 11.1,  lng: 76.4  },
    { id: 'nlg-tn-01',  name: 'NILGIRI BIOSPHERE',  country: 'Tamil Nadu, India',      ndvi_current: 0.80, biomass_tonnes: 143000, health_score: 84, area_ha: 585000, lat: 11.5,  lng: 76.6  },
    { id: 'kzr-as-01',  name: 'KAZIRANGA NP',       country: 'Assam, India',           ndvi_current: 0.75, biomass_tonnes: 34200,  health_score: 79, area_ha: 43000,  lat: 26.6,  lng: 93.2  },
    { id: 'mns-as-01',  name: 'MANAS NP',           country: 'Assam, India',           ndvi_current: 0.73, biomass_tonnes: 29100,  health_score: 76, area_ha: 39000,  lat: 26.7,  lng: 90.7  },
    { id: 'pnn-mp-01',  name: 'PANNA NP',           country: 'Madhya Pradesh, India',  ndvi_current: 0.62, biomass_tonnes: 21500,  health_score: 62, area_ha: 54000,  lat: 24.7,  lng: 80.0  },
    { id: 'bnd-ka-01',  name: 'BANDIPUR NP',        country: 'Karnataka, India',       ndvi_current: 0.78, biomass_tonnes: 41800,  health_score: 83, area_ha: 87000,  lat: 11.7,  lng: 76.6  },
    { id: 'anm-tn-01',  name: 'ANAMALAI TR',        country: 'Tamil Nadu, India',      ndvi_current: 0.81, biomass_tonnes: 37200,  health_score: 86, area_ha: 96000,  lat: 10.4,  lng: 77.0  },
    { id: 'prr-kr-01',  name: 'PERIYAR NP',         country: 'Kerala, India',          ndvi_current: 0.79, biomass_tonnes: 31600,  health_score: 84, area_ha: 78000,  lat:  9.5,  lng: 77.2  },
    { id: 'sjy-mp-01',  name: 'SANJAY NP',          country: 'Madhya Pradesh, India',  ndvi_current: 0.65, biomass_tonnes: 18900,  health_score: 63, area_ha: 45000,  lat: 23.7,  lng: 83.5  },
    { id: 'ddw-up-01',  name: 'DUDHWA NP',          country: 'Uttar Pradesh, India',   ndvi_current: 0.70, biomass_tonnes: 26400,  health_score: 72, area_ha: 61000,  lat: 28.6,  lng: 80.5  },
    { id: 'cbt-uk-01',  name: 'CORBETT NP',         country: 'Uttarakhand, India',     ndvi_current: 0.74, biomass_tonnes: 33100,  health_score: 77, area_ha: 52000,  lat: 29.5,  lng: 78.9  },
    { id: 'srs-rj-01',  name: 'SARISKA NP',         country: 'Rajasthan, India',       ndvi_current: 0.60, biomass_tonnes: 15200,  health_score: 59, area_ha: 39000,  lat: 27.3,  lng: 76.4  },
    { id: 'bht-od-01',  name: 'BHITARKANIKA',       country: 'Odisha, India',          ndvi_current: 0.76, biomass_tonnes: 22800,  health_score: 80, area_ha: 25000,  lat: 20.7,  lng: 87.0  },
    { id: 'sml-od-01',  name: 'SIMLIPAL NP',        country: 'Odisha, India',          ndvi_current: 0.77, biomass_tonnes: 28500,  health_score: 81, area_ha: 284000, lat: 21.8,  lng: 86.5  },
    { id: 'knh-mh-01',  name: 'KANHERI CAVE FR',    country: 'Maharashtra, India',     ndvi_current: 0.68, biomass_tonnes: 9200,   health_score: 68, area_ha: 10500,  lat: 19.2,  lng: 72.9  },
    { id: 'stm-rj-01',  name: 'SITAMATA WLS',       country: 'Rajasthan, India',       ndvi_current: 0.66, biomass_tonnes: 13600,  health_score: 65, area_ha: 42000,  lat: 24.0,  lng: 74.3  },
    { id: 'dnd-ka-01',  name: 'DANDELI NP',         country: 'Karnataka, India',       ndvi_current: 0.79, biomass_tonnes: 35800,  health_score: 83, area_ha: 82000,  lat: 15.3,  lng: 74.6  },
];


function ndviColor(v) {
    if (v >= 0.8) return 'var(--secondary)';
    if (v >= 0.6) return 'var(--tertiary)';
    return 'var(--error)';
}

function healthLabel(s) {
    if (s >= 90) return { label: 'Excellent', cls: 'badge-verified' };
    if (s >= 75) return { label: 'Good',      cls: 'badge-warning' };
    if (s >= 60) return { label: 'Moderate',  cls: 'badge-pending' };
    return { label: 'At Risk', cls: 'badge-error' };
}

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function generateNDVI(baseNDVI) {
    return MONTHS.map((m, i) => {
        const seasonal = Math.sin((i - 2) * Math.PI / 6) * 0.08;
        const noise = (Math.random() - 0.5) * 0.04;
        return { month: m, ndvi: Math.min(0.99, Math.max(0.1, baseNDVI + seasonal + noise)) };
    });
}

// Marker colors: clean, visible scheme — no orange
function createRegionIcon(isSelected, healthScore) {
    // Emerald green, sky blue, amber (only for moderate), red — clear against aerial imagery
    const c = healthScore >= 90 ? '#22c55e'
             : healthScore >= 75 ? '#38bdf8'
             : healthScore >= 60 ? '#f59e0b'
             : '#ef4444';
    const size = isSelected ? 52 : 34;
    const innerSize = isSelected ? 14 : 9;
    // Outer translucent ring + solid inner square
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="
            width: ${size}px; height: ${size}px;
            background: ${c}22;
            border: 2px solid ${c};
            display: flex; align-items: center; justify-content: center;
            transform: translate(-50%, -50%);
            transition: all 0.2s ease;
            box-shadow: 0 0 ${isSelected ? 12 : 4}px ${c}88;
        "><div style="
            width: ${innerSize}px; height: ${innerSize}px;
            background: ${c};
            box-shadow: inset 0 0 2px rgba(0,0,0,0.4);
        "></div></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

export default function SatelliteMonitoring() {
    const [regions, setRegions] = useState(MOCK_REGIONS);
    const [selected, setSelected] = useState(MOCK_REGIONS[0]);
    const [activeTab, setActiveTab] = useState('ndvi');
    const [ndviData, setNdviData] = useState([]);

    useEffect(() => {
        api.getRegions().then(r => { if (r && r.length > 0) setRegions(r.map(rg => ({ ...rg, id: rg.id || rg.region_id }))); }).catch(() => {});
    }, []);

    useEffect(() => {
        if (selected) setNdviData(generateNDVI(selected.ndvi_current));
    }, [selected]);

    const barHeights = ndviData.map(d => d.ndvi * 100);
    const hl = selected ? healthLabel(selected.health_score) : null;
    
    // Chart dynamic switching
    const isNDVI = activeTab === 'ndvi';
    const chartTitle = isNDVI ? 'Spectral Consistency' : 'Total Biomass Density';
    const chartSubtitle = isNDVI ? '+12.4% YoY' : '+3.1% MoM';
    const chartAccent = isNDVI ? '28,109,37' : '0,100,155';
    const displayBars = isNDVI ? barHeights : barHeights.map(h => Math.abs(150 - h * 1.2));
    const cMax = Math.max(...displayBars, 1);

    return (
        <div>
            {/* Status bar — Near Real-Time */}
            <div className="system-status-bar">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {['SAT_UPLINK','GRID_SYNC','CO2_API_V4'].map((l, i) => (
                        <div key={i} className="status-item">
                            <span className="material-symbols-outlined ms-filled status-icon-ok" style={{ fontSize: 16 }}>check_circle</span>
                            {l}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
                        Near Real-Time · Sentinel-2B Revisit: ~5 days
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="pulse-dot" />
                        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>Live Uplink Active</span>
                    </div>
                </div>
            </div>

            {/* Split Layout */}
            <div className="satellite-layout">
                {/* Left — Map Panel */}
                <div className="satellite-map-panel">
                    
                    {/* Interactive Leaflet Map Layer */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1, filter: 'grayscale(0.5) contrast(1.1) brightness(0.9)' }}>
                        <MapContainer 
                            center={[20.5, 80]} 
                            zoom={5} 
                            style={{ width: '100%', height: '100%', background: '#0d1117' }}
                            zoomControl={false}
                            scrollWheelZoom={true}
                        >
                            <ZoomControl position="bottomleft" />
                            {/* Clean dark OSM tile — markers are clearly visible */}
                            <TileLayer 
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
                            />
                            {regions.map(r => (
                                <Marker 
                                    key={r.id}
                                    position={[r.lat, r.lng]}
                                    icon={createRegionIcon(selected?.id === r.id, r.health_score)}
                                    eventHandlers={{ click: () => setSelected(r) }}
                                />
                            ))}
                        </MapContainer>
                    </div>

                    {/* Dot overlay for tech aesthetic */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.04, backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} />

                    {/* Map colour legend */}
                    <div style={{ position: 'absolute', bottom: 48, left: 12, zIndex: 10, background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Marker Legend</div>
                        {[
                            { color: '#22c55e', label: 'Excellent (≥90%)' },
                            { color: '#38bdf8', label: 'Good (75–89%)' },
                            { color: '#f59e0b', label: 'Moderate (60–74%)' },
                            { color: '#ef4444', label: 'At Risk (<60%)' },
                        ].map(({ color, label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, background: color, flexShrink: 0 }} />
                                <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Scrollable region quick-select list */}
                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', width: 190, maxHeight: 'calc(100% - 80px)', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        <div style={{ padding: '8px 12px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.95)' }}>20 Monitored Regions</div>
                        {MOCK_REGIONS.map(r => {
                            const markerColor = r.health_score >= 90 ? '#22c55e' : r.health_score >= 75 ? '#38bdf8' : r.health_score >= 60 ? '#f59e0b' : '#ef4444';
                            return (
                                <button key={r.id} onClick={() => setSelected(r)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: selected?.id === r.id ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left' }}>
                                    <div style={{ width: 8, height: 8, background: markerColor, flexShrink: 0, boxShadow: `0 0 6px ${markerColor}88` }} />
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: selected?.id === r.id ? '#fff' : 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>{r.name}</div>
                                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{r.country.split(',')[0]}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: markerColor }}>{r.health_score}%</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Telemetry overlay */}
                    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(173,179,180,0.4)', padding: 16, width: 176 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Live Telemetry</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6, fontSize: 'var(--font-xs)' }}>
                            <span>Altitude</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>708.2km</span>
                        </div>
                        <div style={{ height: 3, background: 'var(--surface-container)', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: 'var(--primary)' }} />
                        </div>
                    </div>
                </div>

                {/* Right — Detail Panel */}
                <div className="satellite-detail-panel">
                    <div className="satellite-panel-body">
                        {selected ? (
                            <>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                    <div>
                                        <div className="section-label" style={{ marginBottom: 4 }}>Sector Analysis</div>
                                        <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1 }}>{selected.name}</h2>
                                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-variant)', marginTop: 4 }}>{selected.country}</p>
                                    </div>
                                    <span className={`badge ${hl.cls}`}>{hl.label}</span>
                                </div>

                                {/* Quick Stats — with uncertainty margins */}
                                <div className="satellite-quick-stats">
                                    {[
                                        { label: 'Sequestration',   val: (selected.biomass_tonnes / 1000).toFixed(1) + ' MT', sub: '±5% confidence',  accent: false },
                                        { label: 'Health Index',    val: selected.health_score + '%',                          sub: 'NDVI + Risk + Trend', accent: true },
                                        { label: 'Hectares',        val: (selected.area_ha / 1000).toFixed(1) + 'k ha',        sub: '10m SAR resolution', accent: false },
                                    ].map(({ label, val, sub, accent }) => (
                                        <div key={label} className="satellite-quick-stat">
                                            <div className="satellite-quick-stat-label">{label}</div>
                                            <div className="satellite-quick-stat-value" style={{ color: accent ? 'var(--secondary)' : 'var(--on-surface)' }}>{val}</div>
                                            <div style={{ fontSize: 8, color: 'var(--on-surface-variant)', fontWeight: 600, marginTop: 2 }}>{sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tabs + NDVI tooltip */}
                                <div className="satellite-tabs">
                                    {[{ id: 'ndvi', label: 'NDVI Trend' }, { id: 'biomass', label: 'Biomass Mass' }].map(tab => (
                                        <button key={tab.id} className={`satellite-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: 8 }}>
                                    NDVI = Normalized Difference Vegetation Index (0–1 scale, healthy forest &gt;0.7) ·
                                    Supplemented with EVI &amp; NDWI for dense canopy accuracy.
                                </div>

                                {/* Sparkline */}
                                <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid rgba(173,179,180,0.2)', padding: 16, marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{chartTitle}</h4>
                                        <span className={`badge ${isNDVI ? 'badge-verified' : 'badge-pending'}`}>{chartSubtitle}</span>
                                    </div>
                                    <div className="sparkline-area">
                                        {displayBars.map((h, i) => (
                                            <div key={i} className="sparkline-bar" style={{ height: `${(h / cMax) * 100}%`, background: `rgba(${chartAccent},${0.4 + (h/cMax) * 0.4})` }} />
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>JAN 2025</span>
                                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>DEC 2025</span>
                                    </div>
                                </div>

                                {/* Telemetry Log — with explanations */}
                                <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--on-surface-variant)', marginBottom: 12 }}>Telemetry Logs</h4>
                                {[
                                    { time: '14:22:01', event: 'Sentinel-2B Pass Completed',     detail: 'New 10m imagery tile ingested — NDVI recalculated for this sector.', ok: true },
                                    { time: '12:10:45', event: 'SAR Interferometry Updated',      detail: 'Radar backscatter improved biomass estimate precision by ±2.1%.', ok: true },
                                    { time: '09:15:22', event: 'Carbon Storage Recalibration',   detail: 'Ground truth dataset applied — model re-fitting in progress.', ok: null },
                                ].map((t, i) => (
                                    <div key={i} className="telemetry-item">
                                        <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--on-surface-variant)', flexShrink: 0 }}>{t.time}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.event}</div>
                                            <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', fontWeight: 500, marginTop: 2 }}>{t.detail}</div>
                                        </div>
                                        <span className={`material-symbols-outlined ms-filled ${t.ok === true ? 'status-icon-ok' : t.ok === false ? 'status-icon-error' : 'status-icon-pending'}`} style={{ fontSize: 16 }}>
                                            {t.ok === true ? 'check_circle' : t.ok === false ? 'error' : 'refresh'}
                                        </span>
                                    </div>
                                ))}

                                {/* CTA */}
                                <button onClick={() => alert('COMMAND REJECTED: High-resolution orbital capture requests are throttled for free tier operators.')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 28, padding: '14px 0', letterSpacing: '0.25em' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>file_download</span>
                                    Request High-Res Capture
                                </button>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center', opacity: 0.4 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 56 }}>satellite</span>
                                <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 12 }}>No Region Selected</h3>
                                <p style={{ fontSize: 'var(--font-xs)', lineHeight: 1.6, maxWidth: 200 }}>Select a coordinate cluster on the map to initialize deep spectral analysis.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
