import axios from 'axios';
import {Response} from "../bo/Response.ts";

export interface InterviewQuestion {
  id: string;
  question: string;
  softSkill: boolean;
  tag: string;
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
  sessionId?: string;
}

export interface GenerateQuestionsRequest {
  duration: number;
  jobName: string;
  softSkillsPercentage: number;
  tags?: string[];
  language?: string;
  interviewerId?: string;
  voiceId?: string;
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

export interface FinalizeInterviewRequest {
  sessionId: string;
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
  sessions: InterviewListItem[];
  success: boolean;
  message?: string;
}

export interface BookmarkedQuestionsResponse {
  questions: InterviewQuestion[];
  success: boolean;
  message?: string;
}

export interface Interviewer {
  id: string;
  name: string;
  voiceId: string;
  glbPath: string;
  avatarPath: string;
}

export interface InterviewersResponse {
  interviewers: Interviewer[];
  success: boolean;
  message?: string;
}

export interface Country {
  id: string;
  name: string;
  languageCode: string;
}

export interface CountriesResponse {
  countries: Country[];
  success: boolean;
  message?: string;
}

export interface TransitionPhrase {
  audio: string;
  text: string;
}

export interface AudioApiResponse {
  transitionPhrases?: TransitionPhrase[];
}

export interface GetAudioResponse {
  audio?: string; // Base64 encoded audio
  transitionPhrases?: TransitionPhrase[]; // List of transition phrases with audio
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

  public async getSessions(): Promise<InterviewListResponse> {
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
      console.error('Get sessions list error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          sessions: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch sessions. Please try again.'
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
          message: 'An error occurred while fetching sessions. Please try again.'
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

  public async getInterviewDetails(sessionId: string): Promise<InterviewDetailsResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<InterviewDetailsResponse>(
        `${this.baseUrl}/interviews/${sessionId}`,
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

  public async getInterviewers(): Promise<InterviewersResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<InterviewersResponse>(
        `${this.baseUrl}/interviewers`,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Get interviewers error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          interviewers: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch interviewers. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          interviewers: [],
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          interviewers: [],
          success: false,
          message: 'An error occurred while fetching interviewers. Please try again.'
        };
      }
    }
  }

  public async getCountries(): Promise<CountriesResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<CountriesResponse>(
        `${this.baseUrl}/countries`,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Get countries error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          countries: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch countries. Please try again.'
        };
      } else if (axios.isAxiosError(error) && error.request) {
        // The request was made but no response was received
        return {
          countries: [],
          success: false,
          message: 'No response from server. Please try again later.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          countries: [],
          success: false,
          message: 'An error occurred while fetching countries. Please try again.'
        };
      }
    }
  }

  public async getAudio(language: string, voiceId: string): Promise<GetAudioResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<AudioApiResponse>(
        `${this.baseUrl}/interview-intro-phrases?language=${language}&voiceId=${voiceId}`,
        { headers }
      );

      // Check if response contains transitionPhrases and extract the first element
      if (response.data && Array.isArray(response.data.transitionPhrases) && response.data.transitionPhrases.length > 0) {
        return {
          audio: response.data.transitionPhrases[0].audio,
          success: true
        };
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0 &&
               response.data[0].transitionPhrases && Array.isArray(response.data[0].transitionPhrases) &&
               response.data[0].transitionPhrases.length > 0) {
        // Handle case where response is an array of objects with transitionPhrases
        return {
          audio: response.data[0].transitionPhrases[0].audio,
          success: true
        };
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Fallback to previous implementation
        return {
          ...response.data[0],
          success: true
        };
      }

      // Default case: no valid audio data found
      return {
        success: false,
        message: 'No valid audio data found in the response.'
      };
    } catch (error: unknown) {
      console.error('Get audio error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to fetch audio. Please try again.'
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
          message: 'An error occurred while fetching audio. Please try again.'
        };
      }
    }
  }

  public async getSectionChangerPhrases(language: string, voiceId: string): Promise<GetAudioResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<AudioApiResponse>(
        `${this.baseUrl}/section-changer-phrases?language=${language}&voiceId=${voiceId}`,
        { headers }
      );

      // Check if response contains transitionPhrases and extract all elements
      if (response.data && Array.isArray(response.data.transitionPhrases) && response.data.transitionPhrases.length > 0) {
        return {
          transitionPhrases: response.data.transitionPhrases,
          success: true
        };
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0 &&
               response.data[0].transitionPhrases && Array.isArray(response.data[0].transitionPhrases) &&
               response.data[0].transitionPhrases.length > 0) {
        // Handle case where response is an array of objects with transitionPhrases
        return {
          transitionPhrases: response.data[0].transitionPhrases,
          success: true
        };
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Fallback to previous implementation
        return {
          ...response.data[0],
          success: true
        };
      }

      // Default case: no valid audio data found
      return {
        success: false,
        message: 'No valid section changer phrases found in the response.'
      };
    } catch (error: unknown) {
      console.error('Get section changer phrases error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to fetch section changer phrases. Please try again.'
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
          message: 'An error occurred while fetching section changer phrases. Please try again.'
        };
      }
    }
  }

  public async getTransitionPhrases(language: string, voiceId: string): Promise<GetAudioResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<AudioApiResponse>(
        `${this.baseUrl}/transition-phrases?language=${language}&voiceId=${voiceId}`,
        { headers }
      );

      // Check if response contains transitionPhrases and extract all elements
      if (response.data && Array.isArray(response.data.transitionPhrases) && response.data.transitionPhrases.length > 0) {
        return {
          transitionPhrases: response.data.transitionPhrases,
          success: true
        };
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0 &&
               response.data[0].transitionPhrases && Array.isArray(response.data[0].transitionPhrases) &&
               response.data[0].transitionPhrases.length > 0) {
        // Handle case where response is an array of objects with transitionPhrases
        return {
          transitionPhrases: response.data[0].transitionPhrases,
          success: true
        };
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Fallback to previous implementation
        return {
          ...response.data[0],
          success: true
        };
      }

      // Default case: no valid audio data found
      return {
        success: false,
        message: 'No valid transition phrases found in the response.'
      };
    } catch (error: unknown) {
      console.error('Get transition phrases error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          success: false,
          message: error.response.data?.message || 'Failed to fetch transition phrases. Please try again.'
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
          message: 'An error occurred while fetching transition phrases. Please try again.'
        };
      }
    }
  }

  public async getBookmarkedQuestions(): Promise<BookmarkedQuestionsResponse> {
    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<BookmarkedQuestionsResponse>(
        `${this.baseUrl}/questions/bookmarked`,
        { headers }
      );

      return {
        ...response.data,
        success: true
      };
    } catch (error: unknown) {
      console.error('Get bookmarked questions error:', error);

      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          questions: [],
          success: false,
          message: error.response.data?.message || 'Failed to fetch bookmarked questions. Please try again.'
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
          message: 'An error occurred while fetching bookmarked questions. Please try again.'
        };
      }
    }
  }
}
