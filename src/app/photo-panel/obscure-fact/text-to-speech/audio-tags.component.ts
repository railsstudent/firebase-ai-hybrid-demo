import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { AudioPromptData } from './types/audio-prompt-data.type';

@Component({
  selector: 'app-audio-tags',
  imports: [FormField],
  template: `<div>Audio Tags Component works!</div>
    <div style="color: white; display: flex; flex-direction: column; gap: 12px; max-width: 400px">
      <label for="scene">Scene:</label>
      <input type="text" id="scene" [formField]="audioPromptForm.scene" placeholder="Scene description" />
      <label for="emotion">Emotion:</label>
      <input type="text" id="emotion" [formField]="audioPromptForm.emotion" placeholder="Emotion. E.g., serious, panicked, trembling" />
      <label for="pace">Pace:</label>
      <input type="text" id="pace" [formField]="audioPromptForm.pace" placeholder="Pace. E.g, very fast, fast, slow, very slow" />
    </div>
    <pre>
    Scene: {{ audioPromptModel().scene  }},
    Emotion: {{ audioPromptModel().emotion   }},
    Pace: {{ audioPromptModel().pace  }}
    </pre>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTagsComponent {
    #audioPromptModel = signal<AudioPromptData>({
      scene: 'A news anchor reading the news in a busy newsroom',
      emotion: 'professional, slightly serious',
      pace: 'moderate, clear enunciation',
    });
    audioPromptForm = form(this.#audioPromptModel);

    audioPromptModel = this.#audioPromptModel.asReadonly();
}
