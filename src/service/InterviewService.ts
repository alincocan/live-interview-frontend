import axios from 'axios';
import {Response} from "../bo/Response.ts";

export interface InterviewQuestion {
  id: string;
  question: string;
  softSkill: boolean;
  tags: string[];
  answer?: string;
  score?: number;
  correctAnswer?: string;
  audio?: string; // Base64 encoded mp3 audio for the question
  bookmarked?: boolean; // Flag to indicate if the question is bookmarked
  // Add other properties as needed
}

export interface GenerateQuestionsResponse {
  questions: InterviewQuestion[];
  success: boolean;
  message?: string;
  interviewId?: string;
}

export interface GenerateQuestionsRequest {
  duration: number;
  jobName: string;
  softSkillsPercentage: number;
  tags: string[];
}

export interface ValidateAnswerRequest {
  questionId: string;
  question: string;
  answer: string;
  interviewId?: string;
  jobName?: string;
  tags?: string[];
  softSkill?: boolean;
}

export interface FinalizeInterviewRequest {
  interviewId: string;
}

export interface InterviewDetailsResponse {
  id: string;
  jobName: string;
  difficulty: string;
  duration: number;
  score: number;
  questions: InterviewQuestion[];
  success?: boolean;
  message?: string;
}

export interface InterviewListItem {
  id: string;
  jobName: string;
  difficulty: string;
  duration: number;
  createTime: string,
  score: number;
  date: string; // ISO date string
}

export interface InterviewListResponse {
  interviews: InterviewListItem[];
  success: boolean;
  message?: string;
}

export class InterviewService {
  private static instance: InterviewService;
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  private constructor() {}

  public static getInstance(): InterviewService {
    if (!InterviewService.instance) {
      InterviewService.instance = new InterviewService();
    }
    return InterviewService.instance;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  public async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<GenerateQuestionsResponse>(
        `${this.baseUrl}/interviews/generate`,
        request,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Generate questions error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          questions: [],
          success: false,
          message: error.response.data?.message || 'Failed to generate interview questions. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          questions: [],
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          questions: [],
          success: false,
          message: 'An error occurred while generating interview questions. Please try again.'
        };
      }
    }
  }

  public async validateAnswer(request: ValidateAnswerRequest): Promise<Response> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<Response>(
        `${this.baseUrl}/interviews/questions/validate`,
        request,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Validate answer error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to validate answer. Please try again.'
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
          message: 'An error occurred while validating your answer. Please try again.'
        };
      }
    }
  }

  public async finalizeInterview(request: FinalizeInterviewRequest): Promise<Response> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<Response>(
        `${this.baseUrl}/interviews/finalize`,
        request,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Finalize interview error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to finalize interview. Please try again.'
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
          message: 'An error occurred while finalizing the interview. Please try again.'
        };
      }
    }
  }

  public async getInterviews(): Promise<InterviewListResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<InterviewListResponse>(
        `${this.baseUrl}/interviews`,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Get interviews list error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          interviews: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch interviews. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          interviews: [],
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          interviews: [],
          success: false,
          message: 'An error occurred while fetching interviews. Please try again.'
        };
      }
    }
  }

  public async toggleBookmark(questionId: string): Promise<Response> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.put<Response>(
        `${this.baseUrl}/questions/${questionId}/bookmark`,
        {},
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Toggle bookmark error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to toggle bookmark. Please try again.'
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
          message: 'An error occurred while toggling the bookmark. Please try again.'
        };
      }
    }
  }

  public async getInterviewDetails(interviewId: string): Promise<InterviewDetailsResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<InterviewDetailsResponse>(
        `${this.baseUrl}/interviews/${interviewId}`,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Get interview details error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          id: '',
          jobName: '',
          difficulty: '',
          duration: 0,
          score: 0,
          questions: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch interview details. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          id: '',
          jobName: '',
          difficulty: '',
          duration: 0,
          score: 0,
          questions: [],
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          id: '',
          jobName: '',
          difficulty: '',
          duration: 0,
          score: 0,
          questions: [],
          success: false,
          message: 'An error occurred while fetching interview details. Please try again.'
        };
      }
    }
  }
}
