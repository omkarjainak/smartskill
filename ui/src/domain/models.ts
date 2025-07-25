export interface JobProfileSkill {
    id: number;
    created_at: Date;
    JobProfileId: number;
    Skill: string;
    isActive: boolean;
}

export interface SearchLog {
    id: number;
    created_at: Date;
    JobProfileId: number;
    UserId: string; 
    Title: string;
    isProcessed: boolean; 
    isUserProvided: boolean;
}

export interface SummaryLog {
    id: number;
    created_at: Date;
    SearchLogId: number;
    Summary: string;
    Embedding: number[]; 
}

export interface JobProfile {
    id: number;
    created_at: Date;
    JobProfile: string;
    UserId: string; 
}

export interface JobProfileModel {
    name: string;
    skills: string[];
  }