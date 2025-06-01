import axios from 'axios';
import { DashboardResponse } from "../bo/DashboardData.ts";

export class DashboardService {
  private static instance: DashboardService;
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  public async getDashboardData(): Promise<DashboardResponse> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication token not found. Please log in again.'
        };
      }

      const response = await axios.get<DashboardResponse>(
        `${this.baseUrl}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Dashboard data fetch error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to fetch dashboard data. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          success: false,
          message: 'An error occurred while fetching dashboard data. Please try again.'
        };
      }
    }
  }
}