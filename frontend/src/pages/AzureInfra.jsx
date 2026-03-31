const AZURE_SERVICES = [
    {
        name: 'Azure Maps',
        icon: 'public',
        color: 'var(--secondary)',
        status: 'Active',
        description: 'Geospatial APIs for forest region visualization, mapping, and spatial analysis. Provides location-based environmental insights and region-wise carbon monitoring.',
        metrics: { 'API Calls': '12.5K/day', 'Regions Mapped': '20', 'Uptime': '99.98%' },
        border: 'var(--secondary)',
    },
    {
        name: 'Azure Data Lake Storage',
        icon: 'database',
        color: 'var(--tertiary)',
        status: 'Active',
        description: 'Stores satellite imagery datasets (Sentinel-2), processed NDVI rasters, and feature Parquet files. Hierarchical namespace for optimized big data analytics.',
        metrics: { 'Total Storage': '2.8 TB', 'Files Stored': '45.2K', 'Throughput': '850 MB/s' },
        border: 'var(--tertiary)',
    },
    {
        name: 'Azure Virtual Machines',
        icon: 'computer',
        color: 'var(--primary)',
        status: 'Restricted',
        description: 'Standard B-series compute nodes for batch processing. Currently restricted by university Azure Student VNET policy. Cloud Governance demo point.',
        metrics: { 'vCPU Assigned': '4', 'RAM': '16 GB', 'Policy': 'Student Plan' },
        border: 'var(--outline)',
    },
    {
        name: 'Azure Machine Learning',
        icon: 'psychology',
        color: 'var(--secondary)',
        status: 'Active',
        description: 'AutoML runs for NDVI regression and biomass prediction. Registered models for carbon stock estimation with SAR feature inputs.',
        metrics: { 'Models Registered': '3', 'Accuracy': '87.4%', 'Train Time': '~12 min' },
        border: 'var(--secondary)',
    },
    {
        name: 'Synapse Analytics',
        icon: 'analytics',
        color: 'var(--tertiary)',
        status: 'Active',
        description: 'Serverless SQL pools for querying Parquet and GeoTIFF datasets. Supports T-SQL analytics on carbon sequestration outputs.',
        metrics: { 'Queries/day': '840', 'Data Scanned': '1.2 TB', 'Serverless': 'Yes' },
        border: 'var(--tertiary)',
    },
    {
        name: 'Azure App Service',
        icon: 'cloud_done',
        color: 'var(--primary)',
        status: 'Active',
        description: 'Hosts the FastAPI backend and React SPA frontend. Serves production build of the CloudCarbonSeq monitoring dashboard, deployed via ZIP deploy.',
        metrics: { 'URL': 'cloudcarbonseq-api-2026', 'Stack': 'Python 3.12', 'Plan': 'F1 Free' },
        border: 'var(--primary)',
    },
    {
        name: 'Azure Monitor',
        icon: 'monitoring',
        color: 'var(--secondary)',
        status: 'Active',
        description: 'Application Insights for API latency tracking and uptime monitoring. Kusto queries over performance counters for satellite ingestion pipeline health.',
        metrics: { 'Alerts': '4 active', 'Logs': '99.98% uptime', 'Retention': '30 days' },
        border: 'var(--secondary)',
    },
];

const DATA_FLOW = [
    { icon: 'satellite_alt', label: 'Sentinel-2 Satellite' },
    { icon: 'cloud_download', label: 'ADLS Gen2 Ingest' },
    { icon: 'psychology', label: 'Azure ML Engine' },
    { icon: 'calculate', label: 'CO₂ Verification' },
    { icon: 'token', label: 'Credit Tokenization' },
    { icon: 'monitoring', label: 'Azure Monitor' },
    { icon: 'cloud_done', label: 'App Service API' },
];

export default function AzureInfra() {
    return (
        <div className="page-content">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <div>
                    <p className="section-label" style={{ marginBottom: 6 }}>System Topology</p>
                    <h1 className="page-title">Cloud Data Highway</h1>
                    <p className="page-sub">7 Azure Services · Central India · Student Subscription</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pulse-dot" />
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)' }}>All Systems Operational</span>
                </div>
            </div>

            {/* Plain-English Intro Banner */}
            <div style={{
                background: 'rgba(0,100,155,0.07)', border: '1px solid rgba(0,100,155,0.25)',
                padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--tertiary)', flexShrink: 0, marginTop: 1 }}>info</span>
                <div>
                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 2 }}>How This Pipeline Works</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                        This page shows the 7 Microsoft Azure cloud services powering CloudCarbonSeq.
                        Satellite imagery from Sentinel-2 enters via ADLS, gets processed by Azure ML to estimate
                        carbon sequestration, and results are served through the App Service API.
                        Credits are only issued after the full pipeline completes and a third-party audit (Verra VCS) is passed.
                        Uptime 99.98% = the service was available 99.98% of the time.
                    </div>
                </div>
            </div>

            {/* Data Flow */}
            <div className="chart-card" style={{ marginBottom: 20 }}>
                <div className="chart-card-subtitle" style={{ marginBottom: 20 }}>Pipeline Architecture · L-Band to Terminal</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {DATA_FLOW.map((node, i) => (
                        <>
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 64, height: 64,
                                    background: 'var(--surface)',
                                    border: i === DATA_FLOW.length - 1 ? '2px solid var(--primary)' : '1px solid rgba(173,179,180,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)' }}>{node.icon}</span>
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--on-surface-variant)', textAlign: 'center', maxWidth: 80 }}>{node.label}</span>
                            </div>
                            {i < DATA_FLOW.length - 1 && (
                                <span key={`arr-${i}`} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, fontSize: 18, flexShrink: 0 }}>→</span>
                            )}
                        </>
                    ))}
                </div>
            </div>

            {/* Service Cards */}
            <div className="azure-grid">
                {AZURE_SERVICES.map((svc, i) => (
                    <div key={i} className="azure-service-card" style={{ borderBottomColor: svc.border }}>
                        <span className="material-symbols-outlined azure-service-icon" style={{ color: svc.color }}>{svc.icon}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div className="azure-service-name">{svc.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 8, height: 8,
                                    background: svc.status === 'Active' ? 'var(--secondary)' : 'var(--error)',
                                    borderRadius: '50%',
                                }} />
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: svc.status === 'Active' ? 'var(--secondary)' : 'var(--error)' }}>{svc.status}</span>
                            </div>
                        </div>
                        <p className="azure-service-desc">{svc.description}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid rgba(173,179,180,0.15)', paddingTop: 12, marginTop: 12 }}>
                            {Object.entries(svc.metrics).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)' }}>{key}</span>
                                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--on-surface)' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="stats-grid" style={{ marginTop: 8, marginBottom: 0 }}>
                {[
                    { icon: 'cloud_done', val: '6/7',   label: 'Services Active',    border: 'var(--secondary)' },
                    { icon: 'public',     val: 'Central India', label: 'Azure Region', border: 'var(--tertiary)' },
                    { icon: 'school',     val: 'Student',   label: 'Subscription Tier', border: 'var(--primary)' },
                    { icon: 'speed',      val: '99.98%', label: 'Avg. Uptime',       border: 'var(--secondary)' },
                ].map(({ icon, val, label, border }) => (
                    <div key={label} className="stat-card" style={{ borderBottomColor: border }}>
                        <div className="stat-card-header">
                            <span className="material-symbols-outlined stat-card-icon" style={{ fontSize: 22 }}>{icon}</span>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{val}</div>
                        <div className="stat-card-label">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
