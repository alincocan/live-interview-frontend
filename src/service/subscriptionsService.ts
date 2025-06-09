import axios from 'axios';
import { Response } from "../bo/Response.ts";
import { PaymentType } from './paymentService';

// Define subscription data interface
export interface Subscription {
  subscriptionId: string;
  name: string;
  price: number;
  currency: string;
  tokens: number;
  type: PaymentType;
  startDate: string; // LocalDate format
  nextBillingDate: string; // LocalDate format
}

// API response interface
export interface ApiSubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface SubscriptionsResponse extends Response {
  subscriptions?: Subscription[];
}

class SubscriptionsService {
  private static instance: SubscriptionsService;
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  private constructor() {}

  public static getInstance(): SubscriptionsService {
    if (!SubscriptionsService.instance) {
      SubscriptionsService.instance = new SubscriptionsService();
    }
    return SubscriptionsService.instance;
  }

  public async getSubscriptions(): Promise<SubscriptionsResponse> {
    try {
      // Get the auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      const response = await axios.get<ApiSubscriptionsResponse>(
        `${this.baseUrl}/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return {
        success: true,
        subscriptions: response.data.subscriptions,
        message: ''
      };
    } catch (error: unknown) {
      console.error('Get subscriptions error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Failed to fetch subscription data.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        return {
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred while fetching subscription data. Please try again.'
        };
      }
    }
  }

  public async cancelSubscription(subscriptionId: string, reason?: string): Promise<Response> {
    try {
      // Get the auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      // Add reason as a query parameter if provided
      const url = reason 
        ? `${this.baseUrl}/subscriptions/${subscriptionId}?reason=${encodeURIComponent(reason)}`
        : `${this.baseUrl}/subscriptions/${subscriptionId}`;

      await axios.delete(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };
    } catch (error: unknown) {
      console.error('Cancel subscription error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Failed to cancel subscription.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        return {
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred while cancelling subscription. Please try again.'
        };
      }
    }
  }
}

export default SubscriptionsService.getInstance();
