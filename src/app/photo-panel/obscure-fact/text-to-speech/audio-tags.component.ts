import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { GenerateSpeechMode } from '../generate-audio.util';

@Component({
  selector: 'app-audio-tags',
  template: `<div>Audio Tags Component works!</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTagsComponent {
    isLoadingSync = input(false);
    isLoadingStream = input(false);
    isLoadingWebAudio = input(false);
    audioUrl = input<string | undefined>(undefined)

    isLoading = computed(() =>
      this.isLoadingSync() || this.isLoadingStream() || this.isLoadingWebAudio()
    );

    generateSpeech = output<{ mode: GenerateSpeechMode }>();
}
