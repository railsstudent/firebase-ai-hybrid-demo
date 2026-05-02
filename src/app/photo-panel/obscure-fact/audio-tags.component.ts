import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { VOICE_OPTIONS } from './text-to-speech/constants/voice-options.const';
import { AudioPromptData } from './text-to-speech/types/audio-prompt-data.type';

@Component({
  selector: 'app-audio-tags',
  imports: [FormField],
  template: `
    <div class="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-xl mb-6">
      <h3 class="text-indigo-300 font-bold mb-4 flex items-center gap-2">
        <span class="text-xl">🎙️</span> Customize Audio Generation
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Scene -->
        <div class="flex flex-col gap-1.5 md:col-span-2">
          <label for="scene" class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Scene Description</label>
          <textarea
            id="scene"
            [formField]="audioPromptForm.scene"
            placeholder="Describe the environment..."
            class="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          ></textarea>
        </div>

        <!-- Emotion -->
        <div class="flex flex-col gap-1.5">
          <label for="emotion" class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Vocal Emotion</label>
          <input
            type="text"
            id="emotion"
            [formField]="audioPromptForm.emotion"
            placeholder="e.g., panicked, whispers"
            class="bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        <!-- Pace -->
        <div class="flex flex-col gap-1.5">
          <label for="pace" class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Speaking Pace</label>
          <input
            type="text"
            id="pace"
            [formField]="audioPromptForm.pace"
            placeholder="e.g., very slow, rapid"
            class="bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        <!-- Voice Option -->
        <div class="flex flex-col gap-1.5 md:col-span-2">
          <label for="voiceOption" class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">AI Voice Model</label>
          <select
            id="voiceOption"
            [formField]="audioPromptForm.voiceOption"
            class="bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled selected>Select a voice...</option>
            @for (option of sortedVoiceOptions(); track option.name) {
              <option [value]="option.name" class="bg-slate-800">{{ option.label }}</option>
            }
          </select>
        </div>
      </div>
    </div>
  `,
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
