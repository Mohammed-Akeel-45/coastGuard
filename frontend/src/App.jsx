import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import MapView from './components/map/MapView';
import FeedView from './components/feed/FeedView';
import PostReportView from './components/reports/PostReportView';
import MyReportsView from './components/reports/MyReportsView';
import TriageView from './components/triage/TriageView';
import AnalyticsView from './components/analytics/AnalyticsView';

const AutoRefresh = () => {
    const { fetchHotspots, fetchReports } = useApp();

    useEffect(() => {
        const interval = setInterval(() => {
            fetchHotspots();
            fetchReports();
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchHotspots, fetchReports]);

    return null;
};

const token = localStorage.getItem("token");
const App = () => {
    const { currentView } = useApp();

    if (!token) {
        return <LoginPage />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'map':
                return <MapView />;
            case 'feed':
                return <FeedView />;
            case 'post':
                return <PostReportView />;
            case 'myReports':
                return <MyReportsView />;
            case 'triage':
                return <TriageView />;
            case 'analytics':
                return <AnalyticsView />;
            default:
                return <MapView />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            <div className="flex-1 overflow-hidden">
                <AutoRefresh />
                {renderView()}
            </div>
        </div>
    );
};

export default App;
