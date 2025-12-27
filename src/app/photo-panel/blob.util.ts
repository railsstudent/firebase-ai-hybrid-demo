import { Signal } from '@angular/core';

function isValidBlobUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'blob:';
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function revokeBlobURL(dataUrl: Signal<string | undefined>) {
  const blobUrl = dataUrl();
  if (blobUrl && isValidBlobUrl(blobUrl)) {
    console.log('Revoking blob URL');
    URL.revokeObjectURL(blobUrl);
  }
}

export function createTtsURL(parts: BlobPart[]) {
  return URL.createObjectURL(new Blob(parts, { type: 'audio/wav' }));
}
