import axios from 'axios';
import {LoginCredentials} from "../bo/LoginCredentials.ts";

export interface LoginResponse {
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
  success: boolean;
  message?: string;
}

export class AuthenticationService {
  private static instance: AuthenticationService;
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  private constructor() {}

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${this.baseUrl}/auth/login`, 
        credentials
      );

      // Store token in localStorage if remember is true
      if (response.data.accessToken && credentials.remember) {
        localStorage.setItem('authToken', response.data.accessToken);
      } else if (response.data.accessToken) {
        // Store in sessionStorage if not remembering
        sessionStorage.setItem('authToken', response.data.accessToken);
      }

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Login error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Authentication failed. Please check your credentials.'
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
          message: 'An error occurred during login. Please try again.'
        };
      }
    }
  }

  public logout(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken');
  }
}
