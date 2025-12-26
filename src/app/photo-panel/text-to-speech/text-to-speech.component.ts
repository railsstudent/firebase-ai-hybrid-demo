import { SpinnerIconComponent } from '@/icons/spinner-icon.component';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-text-to-speech',
  template: `
    <button
        (click)="generateSpeech.emit({ isStream: false })"
        aria-label="Generate speech"
        [disabled]="isLoading()"
        class="mt-6 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
    >
      <ng-container [ngTemplateOutlet]="buttonTemplate"
        [ngTemplateOutletContext]="{ isLoading: isLoadingSync(), buttonText: 'Play Speech (Sync)' }"
      />
    </button>
    <button
      (click)="generateSpeech.emit({ isStream: true })"
      aria-label="Stream speech"
      [disabled]="isLoading()"
      class="mt-6 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
    >
      <ng-container [ngTemplateOutlet]="buttonTemplate"
        [ngTemplateOutletContext]="{ isLoading: isLoadingStream(), buttonText: 'Play Speech (Stream)' }"
      />
    </button>

    @if (audioUrl(); as url) {
        <figure>
          <figcaption>Listen to the Gemini-TTS:</figcaption>
          <audio controls [src]="url"></audio>
        </figure>
    }

    <ng-template #buttonTemplate let-isLoading="isLoading" let-buttonText="buttonText">
      @if (isLoading) {
        <app-spinner-icon class="animate-spin h-5 w-5" />
      }
      {{ isLoading ? 'Generating Speech...' : buttonText }}
    </ng-template>
  `,
  imports: [SpinnerIconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextToSpeechComponent {
    isLoadingSync = input(false);
    isLoadingStream = input(false);
    audioUrl = input<string | undefined>(undefined)

    isLoading = computed(() => this.isLoadingSync() || this.isLoadingStream());

    generateSpeech = output<{ isStream: boolean }>();
}
