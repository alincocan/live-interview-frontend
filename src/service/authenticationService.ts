import axios from 'axios';
import {LoginCredentials} from "../bo/LoginCredentials.ts";
import {SignUpData} from "../bo/SignUpData.ts";
import {Response} from "../bo/Response.ts";

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

  public async signUp(userData: SignUpData): Promise<Response> {
    try {
      const response = await axios.post<Response>(
        `${this.baseUrl}/auth/sign-up`,
        userData
      );

      return {
        success: true,
        message: response.data.message || 'Registration successful!'
      };
    } catch (error: unknown) {
      console.error('Sign up error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Registration failed. Please try again.'
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
          message: 'An error occurred during registration. Please try again.'
        };
      }
    }
  }

  public async  confirmUser(token: string): Promise<Response> {
    try {
      const response = await axios.post<Response>(
        `${this.baseUrl}/auth/confirm`,
        { token }
      );

      return {
        success: true,
        message: response.data.message || 'Account confirmed successfully!'
      };
    } catch (error: unknown) {
      console.error('Confirmation error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Account confirmation failed. Please try again.'
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
          message: 'An error occurred during confirmation. Please try again.'
        };
      }
    }
  }

  public async recoverPassword(email: string): Promise<Response> {
    try {
      const response = await axios.post<Response>(
        `${this.baseUrl}/auth/recover-password`,
        { email }
      );

      return {
        success: true,
        message: response.data.message || 'Password recovery email sent successfully!'
      };
    } catch (error: unknown) {
      console.error('Password recovery error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Password recovery failed. Please try again.'
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
          message: 'An error occurred during password recovery. Please try again.'
        };
      }
    }
  }

  public async resetPassword(token: string, password: string): Promise<Response> {
    try {
      const response = await axios.post<Response>(
        `${this.baseUrl}/auth/reset-password`,
        { token, password }
      );

      return {
        success: true,
        message: response.data.message || 'Password reset successfully!'
      };
    } catch (error: unknown) {
      console.error('Password reset error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Password reset failed. Please try again.'
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
          message: 'An error occurred during password reset. Please try again.'
        };
      }
    }
  }

  public async googleLogin(): Promise<string> {
    try {
      // Instead of fetching HTML content, get the URL for redirection
      const response = await axios.post(
        `${this.baseUrl}/auth/google/login`,
        {},
        {
          responseType: 'text'
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Method to get the Google login URL directly
  public getGoogleLoginUrl(): string {
    return `${this.baseUrl}/auth/google/login`;
  }

  // Method to authenticate with OAuth2 token
  public async authenticateWithToken(token: string): Promise<LoginResponse> {
    try {
      // Store the token in localStorage (assuming we want to remember the user)
      localStorage.setItem('authToken', token);

      // Return a successful response
      return {
        accessToken: token,
        success: true
      };
    } catch (error: unknown) {
      console.error('OAuth authentication error:', error);

      return {
        success: false,
        message: 'An error occurred during authentication. Please try again.'
      };
    }
  }
}
