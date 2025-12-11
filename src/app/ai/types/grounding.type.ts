import { WebGroundingChunk } from 'firebase/ai';

export type Metadata = {
  citations: WebGroundingChunk[];
  renderedContent: string;
  searchQueries: string[];
};
