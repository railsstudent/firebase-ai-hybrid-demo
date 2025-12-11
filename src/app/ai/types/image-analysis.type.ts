import { Metadata } from './grounding.type';
import { Recommendation } from './recommendation.type';
import { TokenUsage } from './token-usage.type';

export type ImageAnalysis = {
    alternativeText: string;
    tags: string[];
    recommendations: Recommendation[]
    fact: string;
}

export type ImageAnalysisResponse = {
  parsed: ImageAnalysis;
  thought: string;
  tokenUsage: TokenUsage;
  metadata: Metadata;
}
