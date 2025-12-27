import { SpeechService } from '@/ai/services/speech.service';
import { ErrorDisplayComponent } from '@/error-display/error-display.component';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, signal } from '@angular/core';
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
  error = signal('');

  resetAudio() {
    this.audioBlobUrl.set(undefined);
    this.audioSyncUrl.set(undefined);
  }

  private revokeBlobURL() {
    const blobUrl = this.audioBlobUrl();
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }

  async generateSpeech({ isStream }: { isStream: boolean }) {
    const fact = this.interestingFact();
    if (fact) {
      this.revokeBlobURL()
      this.resetAudio();
      if (isStream) {
        this.generateSpeechStream(fact);
      } else {
        this.generateSpeechSync(fact);
      }
    }
  }

  async generateSpeechSync(fact: string) {
    try {
      this.isLoadingSync.set(true);
      const uri = await this.speechService.generateAudio(fact);
      this.audioSyncUrl.set(uri);
    } catch (e) {
      console.error(e);
      this.error.set('Error generating audio.');
    } finally {
      this.isLoadingSync.set(false);
    }
  }

  async generateSpeechStream(fact: string) {
    try {
      this.isLoadingStream.set(true);
      const uri = await this.speechService.generateAudioStream(fact);
      this.audioBlobUrl.set(uri);
    } catch (e) {
      console.error(e);
      this.error.set('Error streaming audio.');
    } finally {
      this.isLoadingStream.set(false);
    }
  }

  ngOnDestroy(): void {
    this.revokeBlobURL();
  }
}
