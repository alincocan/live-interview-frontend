import axios from 'axios';
import { Response } from "../bo/Response.ts";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  occupation?: string;
  dateOfBirth?: string;
  yearsOfExperience?: number;
  tokens?: number;
  createTime?: string;
}

export interface PurchaseTokensResponse extends Response {
  newTokenBalance?: number;
}

export interface UserResponse extends Response {
  user?: User;
}

export class UserService {
  private static instance: UserService;
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async getCurrentUser(): Promise<UserResponse> {
    try {
      // Get the auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      const response = await axios.get<User>(
        `${this.baseUrl}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Store user data in the same storage as the token
      if (response.data.id) {
        const userData = JSON.stringify(response.data);
        if (localStorage.getItem('authToken')) {
          localStorage.setItem('userData', userData);
        } else {
          sessionStorage.setItem('userData', userData);
        }
      }

      return {
        success: true,
        user: response.data,
        message: ''
      };
    } catch (error: unknown) {
      console.error('Get current user error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to fetch user data.'
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
          message: 'An error occurred while fetching user data. Please try again.'
        };
      }
    }
  }

  public getUserFromStorage(): User | null {
    const userDataString = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userDataString) {
      try {
        return JSON.parse(userDataString) as User;
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        return null;
      }
    }
    return null;
  }

  public deductTokens(amount: number): boolean {
    const user = this.getUserFromStorage();
    if (user) {
      if (user.tokens === undefined) {
        user.tokens = 0;
      }
      user.tokens -= amount;

      // Save updated user data back to storage
      const updatedUserData = JSON.stringify(user);
      if (localStorage.getItem('authToken')) {
        localStorage.setItem('userData', updatedUserData);
      } else {
        sessionStorage.setItem('userData', updatedUserData);
      }

      // Dispatch a custom event to notify components about token changes
      const event = new CustomEvent('tokenUpdate', { detail: { tokens: user.tokens } });
      window.dispatchEvent(event);

      return true;
    }
    return false;
  }

  public clearUserData(): void {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
  }

  public async purchaseTokens(amount: number): Promise<PurchaseTokensResponse> {
    try {
      // Get the auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      const response = await axios.post<PurchaseTokensResponse>(
        `${this.baseUrl}/users/purchase-tokens`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update user data in storage with new token balance
      if (response.data.success && response.data.newTokenBalance !== undefined) {
        const userData = this.getUserFromStorage();
        if (userData) {
          userData.tokens = response.data.newTokenBalance;
          const updatedUserData = JSON.stringify(userData);

          if (localStorage.getItem('authToken')) {
            localStorage.setItem('userData', updatedUserData);
          } else {
            sessionStorage.setItem('userData', updatedUserData);
          }
        }
      }

      return response.data;
    } catch (error: unknown) {
      console.error('Purchase tokens error:', error);

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Failed to purchase tokens.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        return {
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred while purchasing tokens. Please try again.'
        };
      }
    }
  }

  public async updateUser(userData: Partial<User>): Promise<UserResponse> {
    try {
      // Get the auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      // Create a copy of userData without the id property
      const dataToUpdate = { ...userData };
      delete dataToUpdate.id;

      const response = await axios.put<User>(
        `${this.baseUrl}/users/me`,
        dataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update user data in storage
      if (response.data) {
        const updatedUserData = JSON.stringify(response.data);

        if (localStorage.getItem('authToken')) {
          localStorage.setItem('userData', updatedUserData);
        } else {
          sessionStorage.setItem('userData', updatedUserData);
        }
      }

      return {
        success: true,
        user: response.data,
        message: 'User data updated successfully'
      };
    } catch (error: unknown) {
      console.error('Update user error:', error);

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Failed to update user data.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        return {
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred while updating user data. Please try again.'
        };
      }
    }
  }
}
