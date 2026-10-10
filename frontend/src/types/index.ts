// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Resume Types
export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Experience {
  id?: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bulletPoints: string[];
}

export interface Education {
  id?: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  gpa: string;
  description: string;
}

export interface Skill {
  id?: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'language' | 'tool';
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id?: string;
  name: string;
  organization: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
  credentialUrl?: string;
}

export interface Achievement {
  id?: string;
  title: string;
  description: string;
  date: string;
}

export interface Language {
  id?: string;
  name: string;
  proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  interests: string[];
}

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  template: string;
  resume_data: ResumeData;
  status: string;
  ats_score: number | null;
  predicted_category: string | null;
  predicted_confidence: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface ResumeListItem {
  id: number;
  title: string;
  template: string;
  status: string;
  ats_score: number | null;
  predicted_category: string | null;
  created_at: string;
  updated_at: string | null;
}

// AI Types
export interface ATSAnalysis {
  overallScore: number;
  keywordsScore: number;
  skillsScore: number;
  formattingScore: number;
  experienceScore: number;
  readabilityScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  detailedFeedback: Record<string, any>;
}

export interface CategoryPrediction {
  predicted_category: string;
  confidence: number;
  top_predictions: Array<{
    category: string;
    confidence: number;
  }>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
}
