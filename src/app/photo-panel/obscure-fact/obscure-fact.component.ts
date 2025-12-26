import { SpeechService } from '@/ai/services/speech.service';
import { SpinnerIconComponent } from '@/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-obscure-fact',
  templateUrl: './obscure-fact.component.html',
  imports: [SpinnerIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObscureFactComponent implements OnDestroy {
  interestingFact = input<string | undefined>(undefined);

  speechService = inject(SpeechService);

  isLoading = signal(false);
  audioUrl = signal<string | undefined>(undefined)
  audioBlobUrl = signal<string | undefined>(undefined)

  resetAudio() {
    this.audioBlobUrl.set(undefined);
    this.audioUrl.set(undefined);
  }

  async generateSpeech() {
    try {
      this.isLoading.set(true);
      this.resetAudio();
      const fact = this.interestingFact();
      if (fact) {
        const uri = await this.speechService.generateAudio(fact);
        this.audioUrl.set(uri);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async generateSpeechStream() {
    try {
      this.isLoading.set(true);

      const blobUrl = this.audioBlobUrl();
      this.resetAudio();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      const fact = this.interestingFact();
      if (fact) {
        const uri = await this.speechService.generateAudioStream(fact);
        this.audioBlobUrl.set(uri);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    const blobUrl = this.audioBlobUrl();
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }
}
