import { SpinnerIconComponent } from '@/icons/spinner-icon.component';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
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
