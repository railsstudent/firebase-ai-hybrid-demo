import { signal, WritableSignal } from '@angular/core';

export const ttsError = signal('');

export async function generateSpeechHelper(
  fact: string,
  loadingSignal: WritableSignal<boolean>,
  urlSignal: WritableSignal<string | undefined>,
  speechFn: (fact: string) => Promise<string>
) {

  try {
    ttsError.set('');
    loadingSignal.set(true);
    const uri = await speechFn(fact);
    urlSignal.set(uri);
  } catch (e) {
    console.error(e);
    ttsError.set('Error generating speech from text.');
  } finally {
    loadingSignal.set(false);
  }
}
