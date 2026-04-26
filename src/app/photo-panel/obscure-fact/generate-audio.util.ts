import { AudioPrompt } from '../../ai/types/audio-prompt.type';
import { signal, WritableSignal } from '@angular/core';

export const ttsError = signal('');

export type GenerateSpeechMode = 'sync' | 'stream' | 'web_audio_api';

export async function generateSpeechHelper(
  audioPrompt: AudioPrompt,
  loadingSignal: WritableSignal<boolean>,
  urlSignal: WritableSignal<string | undefined>,
  speechFn: (audioPrompt: AudioPrompt) => Promise<string>
) {

  try {
    const transcript = audioPrompt.transcript.trim();
    if (!transcript) {
      return;
    }
    ttsError.set('');
    loadingSignal.set(true);
    const uri = await speechFn(audioPrompt);
    urlSignal.set(uri);
  } catch (e) {
    console.error(e);
    ttsError.set('Error generating speech from text.');
  } finally {
    loadingSignal.set(false);
  }
}

export async function streamSpeechWithWebAudio(
    audioPrompt: AudioPrompt,
    loadingSignal: WritableSignal<boolean>,
    webAudioApiFn: (audioPrompt: AudioPrompt) => Promise<void>
) {
    try {
      const trimmedTranscript = audioPrompt.transcript.trim();
      if (!trimmedTranscript) {
        return;
      }

      loadingSignal.set(true);
      await webAudioApiFn(audioPrompt);
    } catch (e) {
      console.error(e);
      ttsError.set('Error streaming speech using the Web Audio API.');
    } finally {
      loadingSignal.set(false);
    }
}
