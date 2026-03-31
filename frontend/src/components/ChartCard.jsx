export default function ChartCard({ title, icon: Icon, children, style = {} }) {
    return (
        <div className="card fade-in" style={style}>
            <div className="card-title">
                {Icon && <Icon size={18} style={{ color: 'var(--emerald-400)' }} />}
                {title}
            </div>
            {children}
        </div>
    );
}
