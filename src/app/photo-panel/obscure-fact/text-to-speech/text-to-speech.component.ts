import { SpinnerIconComponent } from '@/icons/spinner-icon.component';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { GenerateSpeechMode } from '../generate-audio.util';

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  imports: [SpinnerIconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextToSpeechComponent {
    isLoadingSync = input(false);
    isLoadingStream = input(false);
    isLoadingWebAudio = input(false);
    audioUrl = input<string | undefined>(undefined)
    playbackRate = input.required<number>();

    isLoading = computed(() =>
      this.isLoadingSync() || this.isLoadingStream() || this.isLoadingWebAudio()
    );

    generateSpeech = output<{ mode: GenerateSpeechMode }>();
}
