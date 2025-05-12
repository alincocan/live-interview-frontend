import axios from 'axios';

export interface InterviewQuestion {
  id: string;
  question: string;
  softSkill: boolean;
  tags: string[];
  answer?: string;
  score?: number;
  correctAnswer?: string;
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

export interface ValidateAnswerResponse {
  success: boolean;
  message?: string;
}

export interface FinalizeInterviewRequest {
  interviewId: string;
}

export interface FinalizeInterviewResponse {
  success: boolean;
  message?: string;
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
        `${this.baseUrl}/interview/generate`, 
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

  public async validateAnswer(request: ValidateAnswerRequest): Promise<ValidateAnswerResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<ValidateAnswerResponse>(
        `${this.baseUrl}/interview/questions/validate`,
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

  public async finalizeInterview(request: FinalizeInterviewRequest): Promise<FinalizeInterviewResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<FinalizeInterviewResponse>(
        `${this.baseUrl}/interview/finalize`,
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

  public async getInterviewDetails(interviewId: string): Promise<InterviewDetailsResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<InterviewDetailsResponse>(
        `${this.baseUrl}/interview/${interviewId}`,
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
