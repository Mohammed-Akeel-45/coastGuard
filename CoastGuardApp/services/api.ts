import axios from 'axios';
import { getToken } from '@/utils/storage';
import { useAuthStore } from '../store/authStore';

// Change this to your local IP if testing on a physical device
const BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Request Interceptor: Attach Access Token
api.interceptors.request.use(async (config) => {
    const token = await getToken('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await getToken('refresh_token');

                if (!refreshToken) {
                    // No refresh token available, force logout
                    useAuthStore.getState().logout();
                    return Promise.reject(error);
                }

                // Call the endpoint to get a new access token
                // Note: We use a fresh axios call to avoid infinite loops in interceptors
                const response = await axios.post(`${BASE_URL}/get-new-access-token`, {
                    refresh_token: refreshToken
                });

                const { access_token } = response.data;

                // Update storage and store state
                await useAuthStore.getState().setTokens(access_token);

                // Update the header for the failed request and retry
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (refreshError) {
                // If refresh fails (e.g., refresh token expired), force logout
                console.log("Session expired, logging out...");
                await useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
