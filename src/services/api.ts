import axios from "axios";
import { MOCK_REPORTS } from "../utils/mock-data";

// Create Axios instance pointing to our new local Express server
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-type": "application/json",
  },
});

export const api = {
  // COMPLAINTS (REPORTS)
  getComplaints: async () => {
    try {
      const response = await apiClient.get("/complaints");
      return response.data;
    } catch (error) {
      console.warn("Backend complaints query failed, fallback to mock:", error);
      return MOCK_REPORTS;
    }
  },
  getComplaint: async (id: number) => {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  },
  createComplaint: async (data: any) => {
    const response = await apiClient.post("/complaints", data);
    return response.data;
  },
  updateComplaintStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/complaints/${id}?status=${status}`);
    return response.data;
  },
  
  // SERVICES
  getServices: async () => {
    try {
      const response = await apiClient.get("/services");
      return response.data;
    } catch (error) {
      console.warn("Backend services unavailable:", error);
      return [];
    }
  },
  applyService: async (data: { serviceId: number; userId?: number; applicantName: string; contactNumber?: string; details?: any }) => {
    const response = await apiClient.post("/services/apply", data);
    return response.data;
  },

  // REWARDS
  getRewards: async () => {
    try {
      const response = await apiClient.get("/rewards");
      return response.data;
    } catch (error) {
      console.warn("Backend rewards unavailable:", error);
      return [];
    }
  },
  getRewardsBalance: async (userId: number) => {
    try {
      const response = await apiClient.get(`/rewards/balance/${userId}`);
      return response.data;
    } catch (error) {
      return { userId, points: 100, redemptions: [] };
    }
  },
  redeemReward: async (data: { rewardId: string; userId: number }) => {
    const response = await apiClient.post("/rewards/redeem", data);
    return response.data;
  },

  // NOTIFICATIONS
  getNotifications: async () => {
    try {
      const response = await apiClient.get("/notifications");
      return response.data;
    } catch (error) {
      return [];
    }
  },
  markNotificationRead: async (id: number) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllNotificationsRead: async () => {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data;
  },

  // USER STATS & TIMELINE
  getUserStats: async (userId: number) => {
    try {
      const response = await apiClient.get(`/users/${userId}/profile-stats`);
      return response.data;
    } catch (error) {
      return {
        userId,
        points: 350,
        aadhaarVerified: true,
        issuesResolved: 12,
        co2SavedKg: "45kg",
        contributorRank: "Top 5%",
        wardId: "Ward 23"
      };
    }
  },
  getUserTimeline: async (userId: number) => {
    try {
      const response = await apiClient.get(`/users/${userId}/timeline`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // DASHBOARD STATS
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // CITIZEN AADHAAR REGISTRATION & VERIFICATION
  registerCitizen: async (data: {
    fullName: string;
    dateOfBirth: string;
    email?: string;
    mobile?: string;
    wardId?: string;
    aadhaarNumber?: string;
    fileBase64?: string;
  }) => {
    const response = await apiClient.post("/auth/register-citizen", data);
    return response.data;
  },

  generateTestAadhaarPdf: async (data: { fullName: string; dateOfBirth: string }) => {
    const response = await apiClient.post("/auth/aadhaar-test-pdf", data);
    return response.data;
  },
  
  // WORKERS
  getWorkers: async () => {
    try {
      const response = await apiClient.get("/workers");
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  // EMERGENCIES
  getEmergencies: async () => {
    try {
      const response = await apiClient.get("/emergencies");
      return response.data;
    } catch (error) {
      return [];
    }
  },
  createEmergency: async (data: any) => {
    const response = await apiClient.post("/emergencies", data);
    return response.data;
  },
  
  // DEPARTMENTS
  getDepartments: async () => {
    try {
      const response = await apiClient.get("/departments");
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  // USERS
  getUsers: async () => {
    try {
      const response = await apiClient.get("/users");
      return response.data;
    } catch (error) {
      return [];
    }
  }
};
