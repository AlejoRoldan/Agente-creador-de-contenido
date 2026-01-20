
export interface CourseInput {
  topic: string;
  objective: string;
  audience: string;
  restrictions?: string;
}

export interface SubSection {
  title: string;
  description: string;
}

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  subsections: SubSection[];
}

export interface CoursePlan {
  title: string;
  audience: string;
  duration: string;
  sections: CourseSection[];
}

export enum GenerationStep {
  CREATE = "CREATE",
  GENERATING_PLAN = "GENERATING_PLAN",
  REVIEW_PLAN = "REVIEW_PLAN",
  GENERATING_CONTENT = "GENERATING_CONTENT",
  REVIEW_CONTENT = "REVIEW_CONTENT",
  COMPLETED = "COMPLETED",
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
