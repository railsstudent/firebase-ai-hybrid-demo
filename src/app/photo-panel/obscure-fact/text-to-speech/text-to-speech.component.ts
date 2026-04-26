import { SpinnerIconComponent } from '@/icons/spinner-icon.component';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AudioTagsComponent } from './audio-tags.component';
import { ModeWithAudioTags } from './types/mode-audio-tags.type';

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  imports: [SpinnerIconComponent, NgTemplateOutlet, AudioTagsComponent],
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

    generateSpeech = output<ModeWithAudioTags>();
}
