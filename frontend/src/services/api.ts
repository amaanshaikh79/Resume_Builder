import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Resume,
  ResumeListItem,
  ResumeData,
  ATSAnalysis,
  CategoryPrediction,
  Template,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          const publicPaths = ['/', '/login', '/register', '/features', '/templates'];
          if (!publicPaths.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('API Service: Registering user', data.email);
      const response = await this.api.post<AuthResponse>('/api/auth/register', data);
      console.log('API Service: Registration response', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Service: Registration error', error.response?.data || error.message);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('API Service: Logging in user', credentials.email);
      const response = await this.api.post<AuthResponse>('/api/auth/login', credentials);
      console.log('API Service: Login response', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Service: Login error', error.response?.data || error.message);
      throw error;
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/api/users/me');
    return response.data;
  }

  async updateUser(data: Partial<User>): Promise<User> {
    const response = await this.api.put<User>('/api/users/me', data);
    return response.data;
  }

  // Resume endpoints
  async getResumes(): Promise<ResumeListItem[]> {
    const response = await this.api.get<ResumeListItem[]>('/api/resumes');
    return response.data;
  }

  async getResume(id: number): Promise<Resume> {
    const response = await this.api.get<Resume>(`/api/resumes/${id}`);
    return response.data;
  }

  async createResume(data: { title: string; template: string; resume_data: ResumeData }): Promise<Resume> {
    const response = await this.api.post<Resume>('/api/resumes', data);
    return response.data;
  }

  async updateResume(id: number, data: Partial<Resume>): Promise<Resume> {
    const response = await this.api.put<Resume>(`/api/resumes/${id}`, data);
    return response.data;
  }

  async deleteResume(id: number): Promise<void> {
    await this.api.delete(`/api/resumes/${id}`);
  }

  // AI endpoints
  async generateSummary(data: {
    jobTitle: string;
    experienceLevel: string;
    skills: string[];
    tone: string;
  }): Promise<{ summary: string }> {
    const response = await this.api.post('/api/ai/summary', data);
    return response.data;
  }

  async generateBulletPoints(data: {
    jobTitle: string;
    company: string;
    description: string;
    count: number;
  }): Promise<{ bulletPoints: string[] }> {
    const response = await this.api.post('/api/ai/bullet-points', data);
    return response.data;
  }

  async improveExperience(data: {
    jobTitle: string;
    company: string;
    description: string;
    action: string;
  }): Promise<{ improvedDescription: string }> {
    const response = await this.api.post('/api/ai/improve-experience', data);
    return response.data;
  }

  async generateCoverLetter(data: {
    candidateName: string;
    candidateEmail: string;
    resumeData: ResumeData;
    jobTitle: string;
    company: string;
    jobDescription: string;
    tone: string;
  }): Promise<{ coverLetter: string }> {
    const response = await this.api.post('/api/ai/cover-letter', data);
    return response.data;
  }

  // ML endpoints
  async predictCategory(resumeText: string): Promise<CategoryPrediction> {
    const response = await this.api.post<CategoryPrediction>('/api/ml/predict-category', {
      resume_text: resumeText,
    });
    return response.data;
  }

  async getMLMetrics(): Promise<any> {
    const response = await this.api.get('/api/ml/metrics');
    return response.data;
  }

  // ATS endpoints
  async analyzeATS(resumeData: ResumeData, jobDescription?: string): Promise<ATSAnalysis> {
    const response = await this.api.post<ATSAnalysis>('/api/ats/analyze', {
      resumeData,
      jobDescription,
    });
    return response.data;
  }

  async analyzeJobDescription(jobDescription: string, resumeText?: string): Promise<any> {
    const response = await this.api.post('/api/ats/analyze-job', {
      jobDescription,
      resumeText,
    });
    return response.data;
  }

  // System endpoints
  async getHealth(): Promise<any> {
    const response = await this.api.get('/api/health');
    return response.data;
  }

  async getTemplates(): Promise<Template[]> {
    const response = await this.api.get<Template[]>('/api/templates');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
