import { WebGroundingChunk } from 'firebase/ai';

export type Recommendation = {
  id: number;
  text: string;
  reason: string;
}

export type ImageAnalysis = {
    alternativeText: string;
    tags: string[];
    recommendations: Recommendation[]
    fact: string;
}

export type TokenUsage = {
  input: number;
  output: number;
  thought: number;
  total: number;
}

export type Metadata = {
  citations: WebGroundingChunk[];
  renderedContent: string;
  searchQueries: string[];
};

export type ImageAnalysisResponse = {
  parsed: ImageAnalysis;
  thought: string,
  tokenUsage: TokenUsage;
  metadata: Metadata;
}
