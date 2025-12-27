import { signal, WritableSignal } from '@angular/core';

export const ttsError = signal('');

export type GenerateSpeechMode = 'sync' | 'stream' | 'web_audio_api';

export async function generateSpeechHelper(
  text: string,
  loadingSignal: WritableSignal<boolean>,
  urlSignal: WritableSignal<string | undefined>,
  speechFn: (fact: string) => Promise<string>
) {

  try {
    ttsError.set('');
    loadingSignal.set(true);
    const uri = await speechFn(text);
    urlSignal.set(uri);
  } catch (e) {
    console.error(e);
    ttsError.set('Error generating speech from text.');
  } finally {
    loadingSignal.set(false);
  }
}

export async function streamSpeechWithWebAudio(
    text: string,
    loadingSignal: WritableSignal<boolean>,
    webAudioApiFn: (text: string) => Promise<void>
) {
    try {
      loadingSignal.set(true);
      await webAudioApiFn(text);
    } catch (e) {
      console.error(e);
      ttsError.set('Error streaming speech using the Web Audio API.');
    } finally {
      loadingSignal.set(false);
    }
}
