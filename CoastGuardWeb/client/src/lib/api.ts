import { useAuthStore } from "./store";

const API_BASE_URL = "http://localhost:8080/api/v1";

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export async function apiRequest<T>(
    method: string,
    endpoint: string,
    data?: unknown
): Promise<T> {
    const token = useAuthStore.getState().token;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (data && method !== "GET") {
        config.body = JSON.stringify(data);
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new ApiError(
            response.status,
            errorData.error || errorData.message || `HTTP ${response.status}`
        );
    }

    return response.json();
}

export async function uploadReportWithMedia(
    formData: FormData
): Promise<{ reportId: number; mediaUrls: string[] }> {
    const token = useAuthStore.getState().token;

    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/v1/reports`, {
        method: "POST",
        headers,
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new ApiError(
            response.status,
            errorData.error || errorData.message || `HTTP ${response.status}`
        );
    }

    return response.json();
}
