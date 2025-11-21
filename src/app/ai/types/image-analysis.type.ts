export type Recommendation = {
  text: string;
  reason: string;
}

export type ImageAnalysis = {
    alternativeText: string;
    tags: string[];
    recommendations: Recommendation[]
}
