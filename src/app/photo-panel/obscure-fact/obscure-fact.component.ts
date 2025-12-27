import { SpeechService } from '@/ai/services/speech.service';
import { ErrorDisplayComponent } from '@/error-display/error-display.component';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, signal } from '@angular/core';
import { revokeBlobURL } from '../blob.util';
import { generateSpeechHelper, ttsError } from './generate-audio.util';
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

  isLoadingSync = signal(false);
  isLoadingStream = signal(false);
  audioSyncUrl = signal<string | undefined>(undefined)
  audioBlobUrl = signal<string | undefined>(undefined)
  ttsError = ttsError;

  resetAudio() {
    this.audioBlobUrl.set(undefined);
    this.audioSyncUrl.set(undefined);
  }

  async generateSpeech({ isStream }: { isStream: boolean }) {
    const fact = this.interestingFact();
    if (fact) {
      revokeBlobURL(this.audioBlobUrl);
      this.resetAudio();

      const loadingSignal = isStream ? this.isLoadingStream : this.isLoadingSync;
      const urlSignal = isStream ? this.audioBlobUrl : this.audioSyncUrl;
      const speechFn = isStream ?
        (text: string) => this.speechService.generateAudioStream(text) :
        (text: string) => this.speechService.generateAudio(text);
      await generateSpeechHelper(fact, loadingSignal, urlSignal, speechFn);
    }
  }

  ngOnDestroy(): void {
    revokeBlobURL(this.audioBlobUrl);
  }
}
