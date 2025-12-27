import { SpeechService } from '@/ai/services/speech.service';
import { ErrorDisplayComponent } from '@/error-display/error-display.component';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, signal } from '@angular/core';
import { revokeBlobURL } from '../blob.util';
import { generateSpeechHelper, GenerateSpeechMode, streamSpeechWithWebAudio, ttsError } from './generate-audio.util';
import { AudioPlayerService } from './services/audio-player.service';
import { TextToSpeechComponent } from './text-to-speech/text-to-speech.component';

@Component({
  selector: 'app-obscure-fact',
  templateUrl: './obscure-fact.component.html',
  imports: [
    TextToSpeechComponent,
    ErrorDisplayComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObscureFactComponent implements OnDestroy {
  interestingFact = input<string | undefined>(undefined);

  speechService = inject(SpeechService);
  audioPlayerService = inject(AudioPlayerService);

  isLoadingSync = signal(false);
  isLoadingStream = signal(false);
  isLoadingWebAudio = signal(false);

  audioSyncUrl = signal<string | undefined>(undefined);
  audioBlobUrl = signal<string | undefined>(undefined);

  ttsError = ttsError;

  resetAudio() {
    this.audioBlobUrl.set(undefined);
    this.audioSyncUrl.set(undefined);
  }

  async generateSpeech({ mode }: { mode: GenerateSpeechMode }) {
    const fact = this.interestingFact();
    if (fact) {
      revokeBlobURL(this.audioBlobUrl);
      this.resetAudio();

      if (mode === 'sync' || mode === 'stream') {
        const { loadingSignal, urlSignal, speechFn } = this.constructTtsArgs(mode);
        await generateSpeechHelper(fact, loadingSignal, urlSignal, speechFn);
      } else if (mode === 'web_audio_api') {
        await streamSpeechWithWebAudio(
          fact,
          this.isLoadingWebAudio,
          (text: string) => this.audioPlayerService.playStream(text));
      }
    }
  }

  private constructTtsArgs(mode: GenerateSpeechMode) {
    switch (mode) {
      case 'stream':
        return {
          loadingSignal: this.isLoadingStream,
          urlSignal: this.audioBlobUrl,
          speechFn: (text: string) => this.speechService.generateAudioBlobURL(text)
        }
      case 'sync':
        return {
          loadingSignal: this.isLoadingSync,
          urlSignal: this.audioSyncUrl,
          speechFn: (text: string) => this.speechService.generateAudio(text)
        }
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }

  ngOnDestroy(): void {
    revokeBlobURL(this.audioBlobUrl);
  }
}
