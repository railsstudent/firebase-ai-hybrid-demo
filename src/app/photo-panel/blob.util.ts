import { Signal } from '@angular/core';

export function revokeBlobURL(dataUrl: Signal<string | undefined>) {
  const blobUrl = dataUrl();
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
}

export function createTtsURL(parts: BlobPart[]) {
  return URL.createObjectURL(new Blob(parts, { type: 'audio/wav' }));
}
