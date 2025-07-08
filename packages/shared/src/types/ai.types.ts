export interface AIRequest {
  prompt: string;
  context?: Record<string, any>;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SchedulingRequest {
  requirements: string;
  constraints: string[];
  preferences: string[];
  staffAvailability: Record<string, any>;
}

export interface SchedulingSuggestion {
  confidence: number;
  reasoning: string;
  suggestedShifts: any[];
  alternatives: any[];
}
