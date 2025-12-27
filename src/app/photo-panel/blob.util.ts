import { Signal } from '@angular/core';

export function revokeBlobURL(dataUrl: Signal<string | undefined>) {
  const blobUrl = dataUrl();
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
}
