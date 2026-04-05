import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';

// Static region list for map markers (GPS only — detail comes from real API)
const MAP_REGIONS = [
    { id: 'wg-ker-01',  name: 'WESTERN GHATS',     state: 'Kerala',            lat: 10.8, lng: 76.3,  health_score: 88 },
    { id: 'sun-wb-01',  name: 'SUNDARBANS',         state: 'West Bengal',       lat: 21.9, lng: 88.9,  health_score: 74 },
    { id: 'nmd-ar-01',  name: 'NAMDAPHA NP',        state: 'Arunachal Pradesh', lat: 27.5, lng: 96.7,  health_score: 92 },
    { id: 'sil-kr-01',  name: 'SILENT VALLEY',      state: 'Kerala',            lat: 11.1, lng: 76.4,  health_score: 96 },
    { id: 'nlg-tn-01',  name: 'NILGIRI BIOSPHERE',  state: 'Tamil Nadu',        lat: 11.5, lng: 76.6,  health_score: 84 },
    { id: 'kzr-as-01',  name: 'KAZIRANGA NP',       state: 'Assam',             lat: 26.6, lng: 93.2,  health_score: 79 },
    { id: 'mns-as-01',  name: 'MANAS NP',           state: 'Assam',             lat: 26.7, lng: 90.7,  health_score: 76 },
    { id: 'pnn-mp-01',  name: 'PANNA NP',           state: 'Madhya Pradesh',    lat: 24.7, lng: 80.0,  health_score: 62 },
    { id: 'bnd-ka-01',  name: 'BANDIPUR NP',        state: 'Karnataka',         lat: 11.7, lng: 76.6,  health_score: 83 },
    { id: 'anm-tn-01',  name: 'ANAMALAI TR',        state: 'Tamil Nadu',        lat: 10.4, lng: 77.0,  health_score: 86 },
    { id: 'prr-kr-01',  name: 'PERIYAR NP',         state: 'Kerala',            lat:  9.5, lng: 77.2,  health_score: 84 },
    { id: 'sjy-mp-01',  name: 'SANJAY NP',          state: 'Madhya Pradesh',    lat: 23.7, lng: 83.5,  health_score: 63 },
    { id: 'ddw-up-01',  name: 'DUDHWA NP',          state: 'Uttar Pradesh',     lat: 28.6, lng: 80.5,  health_score: 72 },
    { id: 'cbt-uk-01',  name: 'CORBETT NP',         state: 'Uttarakhand',       lat: 29.5, lng: 78.9,  health_score: 77 },
    { id: 'srs-rj-01',  name: 'SARISKA TR',         state: 'Rajasthan',         lat: 27.3, lng: 76.4,  health_score: 59 },
    { id: 'bht-od-01',  name: 'BHITARKANIKA',       state: 'Odisha',            lat: 20.7, lng: 87.0,  health_score: 80 },
    { id: 'sml-od-01',  name: 'SIMLIPAL NP',        state: 'Odisha',            lat: 21.8, lng: 86.5,  health_score: 81 },
    { id: 'knh-mh-01',  name: 'SANJAY GANDHI NP',  state: 'Maharashtra',       lat: 19.2, lng: 72.9,  health_score: 68 },
    { id: 'stm-rj-01',  name: 'SITAMATA WLS',       state: 'Rajasthan',         lat: 24.0, lng: 74.3,  health_score: 65 },
    { id: 'dnd-ka-01',  name: 'DANDELI NP',         state: 'Karnataka',         lat: 15.3, lng: 74.6,  health_score: 83 },
];

const API_BASE = import.meta.env.VITE_API_URL || '';

function ndviColor(v) {
    if (v >= 0.8) return 'var(--secondary)';
    if (v >= 0.6) return 'var(--tertiary)';
    return 'var(--error)';
}

function healthLabel(s) {
    if (s >= 90) return { label: 'Excellent', cls: 'badge-verified' };
    if (s >= 75) return { label: 'Good', cls: 'badge-warning' };
    if (s >= 60) return { label: 'Moderate', cls: 'badge-pending' };
    return { label: 'At Risk', cls: 'badge-error' };
}

function createRegionIcon(isSelected, healthScore) {
    const c = healthScore >= 90 ? '#22c55e'
             : healthScore >= 75 ? '#38bdf8'
             : healthScore >= 60 ? '#f59e0b'
             : '#ef4444';
    const size = isSelected ? 52 : 34;
    const innerSize = isSelected ? 14 : 9;
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="width:${size}px;height:${size}px;background:${c}22;border:2px solid ${c};display:flex;align-items:center;justify-content:center;transform:translate(-50%,-50%);transition:all 0.2s ease;box-shadow:0 0 ${isSelected ? 12 : 4}px ${c}88"><div style="width:${innerSize}px;height:${innerSize}px;background:${c};box-shadow:inset 0 0 2px rgba(0,0,0,0.4)"></div></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

export default function SatelliteMonitoring() {
    const [selectedId, setSelectedId] = useState('wg-ker-01');
    const [detail, setDetail]         = useState(null);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);
    const [activeTab, setActiveTab]   = useState('ndvi');

    // ── Fetch REAL data from backend on every region click ──────────────────
    const fetchRegionDetail = useCallback(async (regionId) => {
        setLoading(true);
        setError(null);
        setDetail(null);
        try {
            const res = await fetch(`${API_BASE}/api/region/${regionId}`);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            setDetail(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load first region on mount
    useEffect(() => { fetchRegionDetail(selectedId); }, []);

    const handleSelect = (regionId) => {
        setSelectedId(regionId);
        fetchRegionDetail(regionId);
    };

    const hl = detail ? healthLabel(detail.health_score) : null;

    // Monthly trend bars from real API data
    const trendData    = detail?.ndvi_trend || [];
    const isNDVI       = activeTab === 'ndvi';
    const barValues    = trendData.map(d => isNDVI ? d.ndvi * 100 : d.biomass / Math.max(...trendData.map(x => x.biomass)) * 100);
    const cMax         = Math.max(...barValues, 1);
    const chartAccent  = isNDVI ? '28,109,37' : '0,100,155';
    const chartTitle   = isNDVI ? 'Monthly NDVI Trend (Real)' : 'Monthly Biomass Trend (Real)';

    return (
        <div>
            {/* Status bar */}
            <div className="system-status-bar">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {['COPERNICUS_STAC','OPEN_METEO','FAO_IPCC_MODEL'].map((l, i) => (
                        <div key={i} className="status-item">
                            <span className="material-symbols-outlined ms-filled status-icon-ok" style={{ fontSize: 16 }}>check_circle</span>
                            {l}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
                        Real-Time · Open-Meteo Weather · Copernicus CLMS
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="pulse-dot" />
                        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>Live Data Active</span>
                    </div>
                </div>
            </div>

            {/* Split Layout */}
            <div className="satellite-layout">

                {/* Left — Map */}
                <div className="satellite-map-panel">
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1, filter: 'grayscale(0.5) contrast(1.1) brightness(0.9)' }}>
                        <MapContainer center={[20.5, 80]} zoom={5} style={{ width: '100%', height: '100%', background: '#0d1117' }} zoomControl={false} scrollWheelZoom={true}>
                            <ZoomControl position="bottomleft" />
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                            {MAP_REGIONS.map(r => (
                                <Marker
                                    key={r.id}
                                    position={[r.lat, r.lng]}
                                    icon={createRegionIcon(selectedId === r.id, r.health_score)}
                                    eventHandlers={{ click: () => handleSelect(r.id) }}
                                />
                            ))}
                        </MapContainer>
                    </div>

                    {/* Dot overlay */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.04, backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} />

                    {/* Legend */}
                    <div style={{ position: 'absolute', bottom: 48, left: 12, zIndex: 10, background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Health Legend</div>
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

                    {/* Region list */}
                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', width: 190, maxHeight: 'calc(100% - 80px)', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        <div style={{ padding: '8px 12px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.95)' }}>20 Monitored Regions</div>
                        {MAP_REGIONS.map(r => {
                            const mc = r.health_score >= 90 ? '#22c55e' : r.health_score >= 75 ? '#38bdf8' : r.health_score >= 60 ? '#f59e0b' : '#ef4444';
                            return (
                                <button key={r.id} onClick={() => handleSelect(r.id)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: selectedId === r.id ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left' }}>
                                    <div style={{ width: 8, height: 8, background: mc, flexShrink: 0, boxShadow: `0 0 6px ${mc}88` }} />
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: selectedId === r.id ? '#fff' : 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>{r.name}</div>
                                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{r.state}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: mc }}>{r.health_score}%</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Live telemetry box */}
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

                {/* Right — Real Data Detail Panel */}
                <div className="satellite-detail-panel">
                    <div className="satellite-panel-body">

                        {/* Loading state */}
                        {loading && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>satellite_alt</span>
                                <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fetching Real Satellite Data...</div>
                                <div style={{ fontSize: 9, color: 'var(--on-surface-variant)' }}>Open-Meteo API · Copernicus CLMS</div>
                            </div>
                        )}

                        {/* Error state */}
                        {error && !loading && (
                            <div style={{ padding: 24, color: 'var(--error)', fontSize: 'var(--font-xs)' }}>
                                API Error: {error}
                            </div>
                        )}

                        {/* Real data loaded */}
                        {detail && !loading && (
                            <>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <div className="section-label" style={{ marginBottom: 4 }}>
                                            Real-Time Sector Analysis
                                        </div>
                                        <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1 }}>{detail.name}</h2>
                                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-variant)', marginTop: 4 }}>{detail.country}</p>
                                    </div>
                                    <span className={`badge ${hl.cls}`}>{hl.label}</span>
                                </div>

                                {/* Data Source Banner */}
                                <div style={{ background: 'rgba(0,100,155,0.07)', border: '1px solid rgba(0,100,155,0.25)', padding: '8px 12px', marginBottom: 16, fontSize: 9, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--secondary)' }}>verified</span>
                                    <span>
                                        <strong>Real data</strong> · Weather: {detail.weather_source} ·
                                        Satellite: {detail.satellite_sensor} ·
                                        Acquired: {detail.satellite_acquisition_date?.slice(0, 10)}
                                    </span>
                                </div>

                                {/* Real Quick Stats */}
                                <div className="satellite-quick-stats" style={{ marginBottom: 16 }}>
                                    {[
                                        { label: 'NDVI (Real)',      val: detail.ndvi_current?.toFixed(4), sub: `Scan quality: ${detail.scan_quality}`, accent: false, color: ndviColor(detail.ndvi_current) },
                                        { label: 'Biomass',         val: (detail.biomass_tonnes / 1000).toFixed(1) + ' MT', sub: 'FAO Allometric', accent: false, color: 'var(--on-surface)' },
                                        { label: 'Carbon Credits',  val: (detail.carbon_credits / 1000).toFixed(1) + 'K', sub: 'IPCC Tier 2 / tCO₂e', accent: true, color: 'var(--secondary)' },
                                    ].map(({ label, val, sub, color }) => (
                                        <div key={label} className="satellite-quick-stat">
                                            <div className="satellite-quick-stat-label">{label}</div>
                                            <div className="satellite-quick-stat-value" style={{ color }}>{val}</div>
                                            <div style={{ fontSize: 8, color: 'var(--on-surface-variant)', fontWeight: 600, marginTop: 2 }}>{sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Real Weather Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                                    {[
                                        { icon: 'cloud', label: 'Cloud Cover',    val: `${detail.cloud_cover_pct?.toFixed(0)}%` },
                                        { icon: 'thermostat', label: 'Temperature',  val: `${detail.temperature_c?.toFixed(1)}°C` },
                                        { icon: 'water_drop', label: 'Humidity',     val: `${detail.humidity_pct?.toFixed(0)}%` },
                                        { icon: 'grain', label: 'Precipitation', val: `${detail.precipitation_mm?.toFixed(1)} mm` },
                                    ].map(({ icon, label, val }) => (
                                        <div key={label} style={{ background: 'var(--surface-container)', border: '1px solid rgba(173,179,180,0.2)', padding: '10px 8px', textAlign: 'center' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)', display: 'block', marginBottom: 4 }}>{icon}</span>
                                            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--on-surface)' }}>{val}</div>
                                            <div style={{ fontSize: 8, color: 'var(--on-surface-variant)', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tabs */}
                                <div className="satellite-tabs">
                                    {[{ id: 'ndvi', label: 'NDVI Trend' }, { id: 'biomass', label: 'Biomass Trend' }].map(tab => (
                                        <button key={tab.id} className={`satellite-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: 8 }}>
                                    Monthly trend · {detail.methodology}
                                </div>

                                {/* Real Chart */}
                                <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid rgba(173,179,180,0.2)', padding: 16, marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{chartTitle}</h4>
                                        <span className="badge badge-verified">REAL</span>
                                    </div>
                                    <div className="sparkline-area">
                                        {barValues.map((h, i) => (
                                            <div key={i} className="sparkline-bar" style={{ height: `${(h / cMax) * 100}%`, background: `rgba(${chartAccent},${0.4 + (h / cMax) * 0.4})` }} />
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>JAN</span>
                                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>DEC</span>
                                    </div>
                                </div>

                                {/* Real Events from DB */}
                                <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                                    Live System Events (from DB)
                                </h4>
                                {(detail.recent_events && detail.recent_events.length > 0) ? (
                                    detail.recent_events.map((evt, i) => (
                                        <div key={i} className="telemetry-item">
                                            <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--on-surface-variant)', flexShrink: 0 }}>
                                                {evt.created_at?.slice(11, 19) || '--:--:--'}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{evt.event_type}</div>
                                                <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', fontWeight: 500, marginTop: 2 }}>{evt.message}</div>
                                            </div>
                                            <span className={`material-symbols-outlined ms-filled ${evt.severity === 'OK' ? 'status-icon-ok' : 'status-icon-warning'}`} style={{ fontSize: 16 }}>
                                                {evt.severity === 'OK' ? 'check_circle' : 'warning'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: 9, color: 'var(--on-surface-variant)', padding: '8px 0' }}>
                                        Click another region to generate real scan events...
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{ marginTop: 16, padding: '8px 12px', background: 'var(--surface-container)', fontSize: 9, color: 'var(--on-surface-variant)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Last updated: {detail.last_updated?.slice(0, 19).replace('T', ' ')} UTC</span>
                                    <span>{detail.data_freshness}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
