import { SpeechService } from '@/ai/services/speech.service';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { TextToSpeechComponent } from '../text-to-speech/text-to-speech.component';

@Component({
  selector: 'app-obscure-fact',
  templateUrl: './obscure-fact.component.html',
  imports: [TextToSpeechComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObscureFactComponent implements OnDestroy {
  interestingFact = input<string | undefined>(undefined);

  speechService = inject(SpeechService);

  isLoadingSync = signal(false);
  isLoadingStream = signal(false);
  audioSyncUrl = signal<string | undefined>(undefined)
  audioBlobUrl = signal<string | undefined>(undefined)

  audioUrl = computed(() => {
    if (this.audioSyncUrl()) {
      return this.audioSyncUrl();
    } else if (this.audioBlobUrl()) {
      return this.audioBlobUrl();
    }

    return undefined;
  })

  resetAudio() {
    this.audioBlobUrl.set(undefined);
    this.audioSyncUrl.set(undefined);
  }

  async generateSpeech({ isStream }: { isStream: boolean }) {
    const fact = this.interestingFact();
    if (fact) {
      const blobUrl = this.audioBlobUrl();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

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
    } finally {
      this.isLoadingStream.set(false);
    }
  }

  ngOnDestroy(): void {
    const blobUrl = this.audioBlobUrl();
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }
}
