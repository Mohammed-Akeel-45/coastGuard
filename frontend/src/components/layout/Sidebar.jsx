import React from 'react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
    const { user, logout, currentView, setCurrentView } = useApp();

    const menuItems = [
        { id: 'map', label: 'Map', icon: '', roles: ['citizen', 'official', 'analyst'] },
        { id: 'feed', label: 'Feed', icon: '', roles: ['citizen', 'official', 'analyst'] },
        { id: 'post', label: 'New Report', icon: '', roles: ['citizen'] },
        { id: 'myReports', label: 'My Reports', icon: '', roles: ['citizen'] },
        { id: 'triage', label: 'Triage', icon: '', roles: ['official'] },
        { id: 'analytics', label: 'Analytics', icon: '', roles: ['analyst'] },
    ];

    const userRole = user?.role || 'citizen';

    return (
        <div className="w-64 bg-gray-800 h-screen flex flex-col border-r border-gray-700 shadow-xl">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900 to-gray-800">
                <h1 className="text-2xl font-bold text-blue-400 mb-1">CoastGuard</h1>
                <p className="text-sm text-gray-300 font-medium">{user?.userName || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize mt-1 bg-gray-700 inline-block px-2 py-1 rounded">
                    {userRole}
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems
                    .filter((item) => item.roles.includes(userRole))
                    .map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${currentView === item.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
