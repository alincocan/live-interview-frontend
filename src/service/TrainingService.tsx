import axios from 'axios';
import { Response } from "../bo/Response.ts";
import { UserService } from "./userService";
import { InterviewQuestion, AudioPhrasesResponse } from "./InterviewService";

export interface TrainingListItem {
  id: string;
  jobName: string;
  difficulty: string;
  duration: number;
  createTime: string,
  score: number;
  date: string; // ISO date string
}

export interface TrainingListResponse {
  sessions: TrainingListItem[];
  success: boolean;
  message?: string;
}

export interface TrainingDetailsResponse {
  id: string;
  jobName: string;
  difficulty: string;
  duration: number;
  score: number;
  questions: InterviewQuestion[];
  success?: boolean;
  message?: string;
}

export interface ValidateAnswerRequest {
  question: string;
  answer: string;
  sessionId?: string | null;
  jobName?: string;
  language?: string;
  tag?: string;
  softSkill?: boolean;
}

export interface ValidateAnswerResponse extends Response {
  answerType?: string;
}

export interface FinalizeTrainingRequest {
  sessionId: string;
}

export interface GenerateTrainingRequest {
  duration: number;
  jobName: string;
  softSkillsPercentage: number;
  difficulty?: string;
  tags?: string[];
  language?: string;
  interviewerId?: string;
  voiceId?: string;
  jobDescription?: string;
}

export interface GenerateTrainingResponse {
  questions: InterviewQuestion[];
  success: boolean;
  message?: string;
  sessionId?: string;
}

export class TrainingService {
  private static instance: TrainingService;
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  private constructor() {}

  public static getInstance(): TrainingService {
    if (!TrainingService.instance) {
      TrainingService.instance = new TrainingService();
    }
    return TrainingService.instance;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  public async generateTraining(request: GenerateTrainingRequest): Promise<GenerateTrainingResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<GenerateTrainingResponse>(
        `${this.baseUrl}/trainings/generate`,
        request,
        { headers }
      );

      // Deduct tokens using the UserService
      const userService = UserService.getInstance();
      userService.deductTokens(10);

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Generate training error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          questions: [],
          success: false,
          message: error.response.data?.message || 'Failed to generate training questions. Please try again.'
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
          message: 'An error occurred while generating training questions. Please try again.'
        };
      }
    }
  }

  public async getAudioPhrases(language: string, voiceId: string): Promise<AudioPhrasesResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<AudioPhrasesResponse>(
        `${this.baseUrl}/trainings/audio-phrases?language=${language}&voiceId=${voiceId}`,
        { headers }
      );

      if (response.data) {
        return {
          ...response.data,
          success: true
        };
      }

      // Default case: no valid audio data found
      return {
        transitionPhrases: [],
        sectionChangerPhrases: [],
        introPhrase: { audio: '', text: '' },
        outroPhrase: { audio: '', text: '' },
        repeatQuestionPhrases: [],
        success: false,
        message: 'No valid audio phrases found in the response.'
      };
    } catch (error: unknown) {
      console.error('Get audio phrases error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          transitionPhrases: [],
          sectionChangerPhrases: [],
          introPhrase: { audio: '', text: '' },
          outroPhrase: { audio: '', text: '' },
          repeatQuestionPhrases: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch audio phrases. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          transitionPhrases: [],
          sectionChangerPhrases: [],
          introPhrase: { audio: '', text: '' },
          outroPhrase: { audio: '', text: '' },
          repeatQuestionPhrases: [],
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          transitionPhrases: [],
          sectionChangerPhrases: [],
          introPhrase: { audio: '', text: '' },
          outroPhrase: { audio: '', text: '' },
          repeatQuestionPhrases: [],
          success: false,
          message: 'An error occurred while fetching audio phrases. Please try again.'
        };
      }
    }
  }

  public async validateAnswer(request: ValidateAnswerRequest): Promise<ValidateAnswerResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<ValidateAnswerResponse>(
        `${this.baseUrl}/trainings/questions/validate`,
        request,
        { headers }
      );

      // Deduct tokens using the UserService
      const userService = UserService.getInstance();
      userService.deductTokens(5);

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

  public async finalizeTraining(request: FinalizeTrainingRequest): Promise<Response> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post<Response>(
        `${this.baseUrl}/trainings/finalize`,
        request,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Finalize training error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to finalize training. Please try again.'
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
          message: 'An error occurred while finalizing the training. Please try again.'
        };
      }
    }
  }

  public async getSessions(): Promise<TrainingListResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<TrainingListResponse>(
        `${this.baseUrl}/trainings`,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Get training sessions list error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          sessions: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch training sessions. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          sessions: [],
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          sessions: [],
          success: false,
          message: 'An error occurred while fetching training sessions. Please try again.'
        };
      }
    }
  }

  public async getTrainingDetails(sessionId: string): Promise<TrainingDetailsResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<TrainingDetailsResponse>(
        `${this.baseUrl}/trainings/${sessionId}`,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Get training details error:', error);

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
          message: error.response.data?.message || 'Failed to fetch training details. Please try again.'
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
          message: 'An error occurred while fetching training details. Please try again.'
        };
      }
    }
  }
}
