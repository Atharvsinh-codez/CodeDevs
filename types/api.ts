import { NormalizedProfile, ProjectsData, AboutData } from './github';

export interface APIResponse<T> {
  data?: T;
  error?: string;
  cached?: boolean;
}

export type ProfileResponse = NormalizedProfile;

export type ProjectsResponse = ProjectsData;

export interface AboutResponse {
  about: AboutData | null;
  cached?: boolean;
}

export interface LinkedInProfile {
  username: string;
  name: string | null;
  headline: string | null;
  location: string | null;
  profile_url: string;
  avatar_url: string | null;
  summary: string | null;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    duration: string;
  }>;
  skills: string[];
}

export type LinkedInResponse = LinkedInProfile;

export interface ErrorResponse {
  detail: string;
  status?: number;
}

