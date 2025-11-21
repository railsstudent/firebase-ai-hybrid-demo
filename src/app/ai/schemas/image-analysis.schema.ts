import { Schema } from 'firebase/ai';

export const ImageAnalysisSchema = Schema.object({
    properties: {
        tags: Schema.array({
            items: Schema.string(),
        }),
        alternativeText: Schema.string(),
        recommendation: Schema.array({
          items: Schema.object({
            properties: {
              text: Schema.string(),
              reason: Schema.string()
            }
          })
        })
     }
});
