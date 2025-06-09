import axios from 'axios';
import { Response } from "../bo/Response.ts";

interface PaymentResponse extends Response {
  checkoutUrl?: string;
}

// Define payment option types
export interface BasePaymentOption {
  id: number | string;
  name: string;
  tokens: number;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
}

export interface SubscriptionPaymentOption extends BasePaymentOption {
  period: 'month' | 'year';
}

export type PaymentType = 'onetime' | 'subscription';

class PaymentService {
  private static instance: PaymentService;
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async checkout(planId: string): Promise<PaymentResponse> {
    try {
      // Get the auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      const response = await axios.post<PaymentResponse>(
        `${this.baseUrl}/checkout`,
        { planId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Create one-time payment error:', error);

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Failed to create one-time payment.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        return {
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred while creating one-time payment. Please try again.'
        };
      }
    }
  }
}

export default PaymentService.getInstance();
