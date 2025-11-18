import { API_BASE_URL } from "../utils/constants";
const token = localStorage.getItem("token");

export class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request("/api/v1/auth/login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail: email, password }),
    });
    return response.json();
  }

  async register(userName, email, password, phone) {
    const response = await this.request("/api/v1/auth/register", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, email, password, phone }),
    });
    return response.json();
  }

  // Profile endpoints
  async getUserProfile(token) {
    const response = await this.request("/api/v1/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }

  // Reports endpoints
  async getReports(limit = 50) {
    const response = await this.request(`/api/v1/reports?limit=${limit}`);
    return response.json();
  }

  async getMyReports(token) {
    const response = await this.request("/api/v1/reports/mine", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }

  async submitReport(token, reportData) {
    const formData = new FormData();
    if (reportData.text) formData.append("text", reportData.text);
    if (reportData.type_id) formData.append("type_id", reportData.type_id);
    formData.append("latitude", reportData.latitude);
    formData.append("longitude", reportData.longitude);
    if (reportData.location_name)
      formData.append("location_name", reportData.location_name);
    if (reportData.media) {
      reportData.media.forEach((file) => formData.append("media", file));
    }

    const response = await this.request("/api/v1/reports", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response;
  }

  async verifyReport(token, reportId) {
    const response = await this.request(
      `/api/v1/verify-user-report/${reportId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response;
  }

  async debunkReport(token, reportId) {
    const response = await this.request(
      `/api/v1/debunk-user-report/${reportId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response;
  }

  // Hotspots endpoints
  async getHotspots() {
    const response = await this.request("/api/v1/hotspots");
    return response.json();
  }

  // Social posts endpoints
  async getSocialPosts(token, limit = 50) {
    const response = await this.request(`/api/v1/social-posts?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }
}
