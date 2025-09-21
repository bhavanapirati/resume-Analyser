

export enum Verdict {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export interface AnalysisResult {
  relevanceScore: number;
  verdict: Verdict;
  mustHaveSkillsMet: string[];
  mustHaveSkillsMissing: string[];
  goodToHaveSkillsMet: string[];
  goodToHaveSkillsMissing: string[];
  otherMatchingSkills: string[];
  feedback: string;
}

export interface HistoryItem {
  id: string;
  jobDescriptionTitle: string;
  resumeIdentifier: string;
  result: AnalysisResult;
  timestamp: string;
  isShortlisted?: boolean;
}

export type AnalysisMode = 'Precise' | 'Balanced' | 'Creative';
