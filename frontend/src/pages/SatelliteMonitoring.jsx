import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../utils/api';

const MOCK_REGIONS = [
    { id: 'amz-west-24', name: 'WESTERN GHATS', country: 'Kerala, India', ndvi_current: 0.82, biomass_tonnes: 98400, health_score: 88, area_ha: 12400, lat: 10.8, lng: 76.3 },
    { id: 'sun-bay-01',  name: 'SUNDARBANS',    country: 'West Bengal', ndvi_current: 0.72, biomass_tonnes: 56100, health_score: 74, area_ha: 8200, lat: 21.9, lng: 88.9 },
    { id: 'nmd-arp-12',  name: 'NAMDAPHA NP',  country: 'Arunachal Pradesh', ndvi_current: 0.85, biomass_tonnes: 72300, health_score: 92, area_ha: 15400, lat: 27.5, lng: 96.7 },
    { id: 'sil-val-kr',  name: 'SILENT VALLEY', country: 'Kerala, India', ndvi_current: 0.88, biomass_tonnes: 18200, health_score: 96, area_ha: 2400, lat: 11.1, lng: 76.4 },
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

function createRegionIcon(isSelected, healthScore) {
    const c = healthScore >= 90 ? '#1c6d25' : (healthScore >= 75 ? '#00649b' : '#9f403d');
    const bg = `${c}40`; // 25% opacity
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="width: ${isSelected ? 48 : 32}px; height: ${isSelected ? 48 : 32}px; background: ${bg}; border: 2px solid ${isSelected ? c : 'rgba(173,179,180,0.4)'}; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); transition: all 0.2s;"><div style="width: ${isSelected ? 12 : 8}px; height: ${isSelected ? 12 : 8}px; background: ${c};"></div></div>`,
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
                            center={[20, 80]} 
                            zoom={5} 
                            style={{ width: '100%', height: '100%', background: '#0a0f1a' }}
                            zoomControl={false}
                            scrollWheelZoom={true}
                        >
                            <ZoomControl position="bottomleft" />
                            <TileLayer 
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution="Tiles &copy; Esri"
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
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.1, backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} />

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
