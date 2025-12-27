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

  audioUrl = signal<string | undefined>(undefined);
  playbackRate = this.audioPlayerService.playbackRate;

  ttsError = ttsError;

  async generateSpeech({ mode }: { mode: GenerateSpeechMode }) {
    const fact = this.interestingFact();
    if (fact) {
      revokeBlobURL(this.audioUrl);
      this.audioUrl.set(undefined);

      if (mode === 'sync' || mode === 'stream') {
        const loadingSignal = mode === 'stream' ? this.isLoadingStream : this.isLoadingSync;
        const speechFn = (text: string) => mode === 'stream' ?
            this.speechService.generateAudioBlobURL(text) :
            this.speechService.generateAudio(text);
        await generateSpeechHelper(fact, loadingSignal, this.audioUrl, speechFn);
      } else if (mode === 'web_audio_api') {
        await streamSpeechWithWebAudio(
          fact,
          this.isLoadingWebAudio,
          (text: string) => this.audioPlayerService.playStream(text));
      }
    }
  }

  ngOnDestroy(): void {
    revokeBlobURL(this.audioUrl);
  }
}
