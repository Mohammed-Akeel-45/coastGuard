import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApiService } from '../services/api';
const apiService = new ApiService();

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

// Mock Data for Demo Mode
const MOCK_DATA = {
    users: {
        citizen: {
            userName: 'Demo Citizen',
            email: 'citizen@demo.com',
            role: 'citizen',
            phone: '+1234567890'
        },
        official: {
            userName: 'Demo Official',
            email: 'official@demo.com',
            role: 'official',
            phone: '+1234567890'
        },
        analyst: {
            userName: 'Demo Analyst',
            email: 'analyst@demo.com',
            role: 'analyst',
            phone: '+1234567890'
        }
    },
    reports: [
        {
            report_id: 1,
            user_id: 1,
            type_id: 1,
            type_name: 'Tsunami',
            status_id: 2,
            status_name: 'official_verified',
            description: 'Large waves spotted near the coast. Water receding rapidly.',
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            location_name: 'Marina Beach, Chennai',
            report_time: '2024-11-18T10:30:00Z',
            media_urls: ['https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800'],
            relevance_score: 95
        },
        {
            report_id: 2,
            user_id: 2,
            type_id: 3,
            type_name: 'Oil Spill',
            status_id: 1,
            status_name: 'not_verified',
            description: 'Oil slick visible on water surface near the harbor.',
            location: { type: 'Point', coordinates: [77.6046, 12.9816] },
            location_name: 'Harbor Area',
            report_time: '2024-11-18T11:45:00Z',
            media_urls: ['https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800'],
            relevance_score: 87
        },
        {
            report_id: 3,
            user_id: 3,
            type_id: 2,
            type_name: 'High Wave',
            status_id: 3,
            status_name: 'community_verified',
            description: 'Unusually high waves hitting the shore. Strong currents observed.',
            location: { type: 'Point', coordinates: [77.5846, 12.9616] },
            location_name: 'Elliot Beach',
            report_time: '2024-11-18T09:15:00Z',
            media_urls: ['https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=800'],
            relevance_score: 92
        },
        {
            report_id: 4,
            user_id: 4,
            type_id: 4,
            type_name: 'Flooding',
            status_id: 4,
            status_name: 'debunked',
            description: 'Coastal flooding reported in low-lying areas.',
            location: { type: 'Point', coordinates: [77.6146, 12.9916] },
            location_name: 'Beach Road',
            report_time: '2024-11-18T08:00:00Z',
            media_urls: [],
            relevance_score: 65
        },
        {
            report_id: 5,
            user_id: 1,
            type_id: 1,
            type_name: 'Tsunami',
            status_id: 1,
            status_name: 'not_verified',
            description: 'Strong earthquake felt, possible tsunami warning.',
            location: { type: 'Point', coordinates: [77.5746, 12.9516] },
            location_name: 'Coastal Highway',
            report_time: '2024-11-18T12:00:00Z',
            media_urls: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
            relevance_score: 98
        }
    ],
    socialPosts: [
        {
            post_id: 1,
            platform: 'Twitter',
            author_name: '@CoastalWatch',
            content: '🌊 High tide alert! Stay away from the beach areas. #CoastSafety #TsunamiWatch',
            latitude: 12.9716,
            longitude: 77.5946,
            location_name: 'Chennai Coast',
            post_time: '2024-11-18T10:00:00Z',
            sentiment: 'Negative',
            relevance_score: 89,
            media_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'
        },
        {
            post_id: 2,
            platform: 'Facebook',
            author_name: 'Marine Conservation Society',
            content: 'Beautiful calm seas today. Perfect weather for coastal activities! 🌅',
            latitude: 12.9616,
            longitude: 77.5846,
            location_name: 'Marina',
            post_time: '2024-11-18T09:30:00Z',
            sentiment: 'Positive',
            relevance_score: 45,
            media_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800'
        },
        {
            post_id: 3,
            platform: 'Instagram',
            author_name: '@BeachLife',
            content: 'Warning: Strong currents reported near the pier. Exercise caution! ⚠️',
            latitude: 12.9816,
            longitude: 77.6046,
            location_name: 'City Pier',
            post_time: '2024-11-18T11:00:00Z',
            sentiment: 'Neutral',
            relevance_score: 78,
            media_url: null
        }
    ],
    hotspots: [
        {
            hotspot_id: 1,
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            radius_km: 2.5,
            intensity_score: 8.5,
            dominant_hazard_type_id: 1,
            created_at: '2024-11-18T10:00:00Z',
            updated_at: '2024-11-18T12:00:00Z'
        },
        {
            hotspot_id: 2,
            location: { type: 'Point', coordinates: [77.6046, 12.9816] },
            radius_km: 1.8,
            intensity_score: 6.2,
            dominant_hazard_type_id: 3,
            created_at: '2024-11-18T11:00:00Z',
            updated_at: '2024-11-18T12:00:00Z'
        }
    ]
};

export const AppProvider = ({ children }) => {
    const [demoMode, setDemoMode] = useState(true); // Enable demo mode by default
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [reports, setReports] = useState([]);
    const [myReports, setMyReports] = useState([]);
    const [socialPosts, setSocialPosts] = useState([]);
    const [hotspots, setHotspots] = useState([]);
    const [currentView, setCurrentView] = useState('map');
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [mapLayers, setMapLayers] = useState({
        hotspots: true,
        reports: true,
        socialPosts: false,
    });

    useEffect(() => {
        if (token) {
            if (demoMode) {
                // Load mock data in demo mode
                setReports(MOCK_DATA.reports);
                setMyReports(MOCK_DATA.reports.slice(0, 2));
                setSocialPosts(MOCK_DATA.socialPosts);
                setHotspots(MOCK_DATA.hotspots);
            } else {
                // Real API calls
                fetchUserProfile();
                fetchReports();
                fetchHotspots();
                fetchSocialPosts();
            }
        }
    }, [token, demoMode]);

    const fetchUserProfile = async () => {
        if (demoMode) return;
        try {
            const data = await apiService.getUserProfile(token);
            if (data.data) {
                setUser(data.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchReports = async () => {
        if (demoMode) {
            setReports(MOCK_DATA.reports);
            return;
        }
        try {
            const data = await apiService.getReports(50);
            setReports(data.data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const fetchMyReports = async () => {
        if (demoMode) {
            setMyReports(MOCK_DATA.reports.slice(0, 2));
            return;
        }
        try {
            const data = await apiService.getMyReports(token);
            setMyReports(data.data || []);
        } catch (error) {
            console.error('Error fetching my reports:', error);
        }
    };

    const fetchHotspots = async () => {
        if (demoMode) {
            setHotspots(MOCK_DATA.hotspots);
            return;
        }
        try {
            const data = await apiService.getHotspots();
            setHotspots(data || []);
        } catch (error) {
            console.error('Error fetching hotspots:', error);
        }
    };

    const fetchSocialPosts = async () => {
        if (demoMode) {
            setSocialPosts(MOCK_DATA.socialPosts);
            return;
        }
        try {
            const data = await apiService.getSocialPosts(token, 50);
            setSocialPosts(data.data || []);
        } catch (error) {
            console.error('Error fetching social posts:', error);
        }
    };

    const login = async (email, password) => {
        if (demoMode) {
            // Demo login - determine role based on email
            let mockUser = MOCK_DATA.users.citizen;
            if (email.includes('official')) {
                mockUser = MOCK_DATA.users.official;
            } else if (email.includes('analyst')) {
                mockUser = MOCK_DATA.users.analyst;
            }

            setUser(mockUser);
            localStorage.setItem("token", "demo-token-12345");
            setToken('demo-token-12345');
            return { success: true };
        }

        try {
            const data = await apiService.login(email, password);
            if (data.data?.token) {
                setToken(data.data.token);
                localStorage.setItem("token", data.data.token);
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    };

    const register = async (userName, email, password, phone) => {
        if (demoMode) {
            const mockUser = { ...MOCK_DATA.users.citizen, userName, email, phone };
            setUser(mockUser);
            setToken('demo-token-12345');
            return { success: true };
        }

        try {
            const data = await apiService.register(userName, email, password, phone);
            if (data.data?.token) {
                setToken(data.data.token);
                localStorage.setItem("token", data.data.token);;
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    };

    const logout = () => {
        localStorage.setItem("token", "");
        setToken(null);
        setUser(null);
        setReports([]);
        setMyReports([]);
        setSocialPosts([]);
        setHotspots([]);
    };

    const submitReport = async (reportData) => {
        if (demoMode) {
            // Simulate successful submission in demo mode
            const newReport = {
                report_id: Date.now(),
                user_id: 1,
                type_id: reportData.type_id,
                type_name: MOCK_DATA.reports.find(r => r.type_id === reportData.type_id)?.type_name || 'Hazard',
                status_id: 1,
                status_name: 'not_verified',
                description: reportData.text,
                location: { type: 'Point', coordinates: [parseFloat(reportData.longitude), parseFloat(reportData.latitude)] },
                location_name: reportData.location_name,
                report_time: new Date().toISOString(),
                media_urls: [],
                relevance_score: Math.floor(Math.random() * 30) + 70
            };

            setReports(prev => [newReport, ...prev]);
            setMyReports(prev => [newReport, ...prev]);
            return { success: true };
        }

        try {
            const response = await apiService.submitReport(token, reportData);
            if (response.ok) {
                fetchReports();
                fetchMyReports();
                return { success: true };
            }
            return { success: false, message: 'Failed to submit report' };
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    };

    return (
        <AppContext.Provider
            value={{
                demoMode,
                setDemoMode,
                user,
                token,
                reports,
                myReports,
                socialPosts,
                hotspots,
                currentView,
                setCurrentView,
                selectedReport,
                setSelectedReport,
                selectedPost,
                setSelectedPost,
                mapLayers,
                setMapLayers,
                login,
                register,
                logout,
                submitReport,
                fetchReports,
                fetchMyReports,
                fetchHotspots,
                fetchSocialPosts,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

// import React, { createContext, useState, useEffect, useContext } from 'react';
// import apiService from '../services/api';

// const AppContext = createContext();

// export const useApp = () => {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error('useApp must be used within AppProvider');
//   }
//   return context;
// };

// export const AppProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [myReports, setMyReports] = useState([]);
//   const [socialPosts, setSocialPosts] = useState([]);
//   const [hotspots, setHotspots] = useState([]);
//   const [currentView, setCurrentView] = useState('map');
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [mapLayers, setMapLayers] = useState({
//     hotspots: true,
//     reports: true,
//     socialPosts: false,
//   });

//   useEffect(() => {
//     if (token) {
//       fetchUserProfile();
//       fetchReports();
//       fetchHotspots();
//       fetchSocialPosts();
//     }
//   }, [token]);

//   const fetchUserProfile = async () => {
//     try {
//       const data = await apiService.getUserProfile(token);
//       if (data.data) {
//         setUser(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     }
//   };

//   const fetchReports = async () => {
//     try {
//       const data = await apiService.getReports(50);
//       setReports(data.data || []);
//     } catch (error) {
//       console.error('Error fetching reports:', error);
//     }
//   };

//   const fetchMyReports = async () => {
//     try {
//       const data = await apiService.getMyReports(token);
//       setMyReports(data.data || []);
//     } catch (error) {
//       console.error('Error fetching my reports:', error);
//     }
//   };

//   const fetchHotspots = async () => {
//     try {
//       const data = await apiService.getHotspots();
//       setHotspots(data || []);
//     } catch (error) {
//       console.error('Error fetching hotspots:', error);
//     }
//   };

//   const fetchSocialPosts = async () => {
//     try {
//       const data = await apiService.getSocialPosts(token, 50);
//       setSocialPosts(data.data || []);
//     } catch (error) {
//       console.error('Error fetching social posts:', error);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const data = await apiService.login(email, password);
//       if (data.data?.token) {
//         setToken(data.data.token);
//         return { success: true };
//       }
//       return { success: false, message: data.message };
//     } catch (error) {
//       return { success: false, message: 'Network error' };
//     }
//   };

//   const register = async (userName, email, password, phone) => {
//     try {
//       const data = await apiService.register(userName, email, password, phone);
//       if (data.data?.token) {
//         setToken(data.data.token);
//         return { success: true };
//       }
//       return { success: false, message: data.message };
//     } catch (error) {
//       return { success: false, message: 'Network error' };
//     }
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//   };

//   const submitReport = async (reportData) => {
//     try {
//       const response = await apiService.submitReport(token, reportData);
//       if (response.ok) {
//         fetchReports();
//         fetchMyReports();
//         return { success: true };
//       }
//       return { success: false, message: 'Failed to submit report' };
//     } catch (error) {
//       return { success: false, message: 'Network error' };
//     }
//   };

//   return (
//     <AppContext.Provider
//       value={{
//         user,
//         token,
//         reports,
//         myReports,
//         socialPosts,
//         hotspots,
//         currentView,
//         setCurrentView,
//         selectedReport,
//         setSelectedReport,
//         selectedPost,
//         setSelectedPost,
//         mapLayers,
//         setMapLayers,
//         login,
//         register,
//         logout,
//         submitReport,
//         fetchReports,
//         fetchMyReports,
//         fetchHotspots,
//         fetchSocialPosts,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// };
