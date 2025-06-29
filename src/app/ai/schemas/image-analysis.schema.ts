import { Schema } from 'firebase/ai';

export const ImageAnalysisSchema = Schema.object({
    properties: {
        tags: Schema.array({
            items: Schema.string(),
        }),
        alternativeText: Schema.string(),
     }
});
