import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import SatelliteMonitoring from './pages/SatelliteMonitoring';
import CarbonCredits from './pages/CarbonCredits';
import Analytics from './pages/Analytics';
import AzureInfra from './pages/AzureInfra';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!localStorage.getItem('auth')) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-content">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                {/* content-scroll: the scrollable region below the sticky header */}
                <div className="content-scroll">
                    <Routes>
                        <Route index                  element={<Dashboard />} />
                        <Route path="satellite"        element={<SatelliteMonitoring />} />
                        <Route path="credits"          element={<CarbonCredits />} />
                        <Route path="analytics"        element={<Analytics />} />
                        <Route path="azure"            element={<AzureInfra />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/"       element={<LandingPage />} />
            <Route path="/login"  element={<Login />} />
            <Route path="/app/*"  element={<AppLayout />} />
        </Routes>
    );
}
