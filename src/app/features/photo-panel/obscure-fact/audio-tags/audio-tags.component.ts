import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { VOICE_OPTIONS } from './constants/voice-options.const';
import { AudioPromptData } from './types/audio-prompt-data.type';

@Component({
  selector: 'app-audio-tags',
  imports: [FormField],
  templateUrl: './audio-tags.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTagsComponent {
    #audioPromptModel = signal<AudioPromptData>({
      scene: 'A news anchor reading the news in a busy newsroom',
      emotion: 'professional, slightly serious',
      pace: 'moderate, clear enunciation',
      voiceOption: 'Kore'
    });
    audioPromptForm = form(this.#audioPromptModel);

    sortedVoiceOptions = computed(() => {
      const sortedList = VOICE_OPTIONS.sort((a, b) => a.name.localeCompare(b.name));

      return sortedList.map(option => ({
        name: option.name,
        label: `${option.name} - ${option.description}`
      }));
    });

    audioPromptModel = this.#audioPromptModel.asReadonly();
}
