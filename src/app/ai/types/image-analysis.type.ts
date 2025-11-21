export type Recommendation = {
  id: number;
  text: string;
  reason: string;
}

export type ImageAnalysis = {
    alternativeText: string;
    tags: string[];
    recommendations: Recommendation[]
}

export type TokenUsage = {
  input: number;
  output: number;
  thought: number;
  total: number;
}

export type ImageAnalysisResponse = {
  parsed: ImageAnalysis;
  thought: string,
  tokenUsage: TokenUsage
}
