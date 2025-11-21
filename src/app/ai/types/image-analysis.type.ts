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
