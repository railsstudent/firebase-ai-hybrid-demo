import { SpeechService } from '@/ai/services/speech.service';
import { SpinnerIconComponent } from '@/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-obscure-fact',
  templateUrl: './obscure-fact.component.html',
  imports: [SpinnerIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObscureFactComponent {
  interestingFact = input<string | undefined>(undefined);

  speechService = inject(SpeechService);

  isLoading = signal(false);
  audioUrl = signal<string | undefined>(undefined)

  async generateSpeech() {
    try {
      this.isLoading.set(true);
      this.audioUrl.set(undefined);
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
}
