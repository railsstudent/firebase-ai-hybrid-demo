import { Schema } from 'firebase/ai';

export const ImageTextsSchema = Schema.object({
    properties: {
        tags: Schema.array({
            items: Schema.string(),
        }),
        alternateText: Schema.string(),
     }
});
