import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, value, label, trend, trendValue, color = 'emerald' }) {
    const isUp = trend === 'up';

    return (
        <div className={`stat-card ${color} fade-in`}>
            <div className={`stat-card-icon ${color}`}>
                <Icon size={22} />
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
            {trendValue && (
                <div className={`stat-card-trend ${trend}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {trendValue}
                </div>
            )}
        </div>
    );
}
