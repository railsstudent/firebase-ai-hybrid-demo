import { SpeechService } from '@/ai/services/speech.service';
import { AudioPrompt } from '@/ai/types/audio-prompt.type';
import { ErrorDisplayComponent } from '@/error-display/error-display.component';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, signal } from '@angular/core';
import { revokeBlobURL } from '../blob.util';
import { generateSpeechHelper, streamSpeechWithWebAudio, ttsError } from './generate-audio.util';
import { AudioPlayerService } from './services/audio-player.service';
import { TextToSpeechComponent } from './text-to-speech/text-to-speech.component';
import { ModeWithAudioTags } from './text-to-speech/types/mode-audio-tags.type';

@Component({
  selector: 'app-obscure-fact',
  templateUrl: './obscure-fact.component.html',
  imports: [
    TextToSpeechComponent,
    ErrorDisplayComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObscureFactComponent implements OnDestroy {
  interestingFact = input<string | undefined>(undefined);

  speechService = inject(SpeechService);
  audioPlayerService = inject(AudioPlayerService);

  isLoadingSync = signal(false);
  isLoadingStream = signal(false);
  isLoadingWebAudio = signal(false);

  audioUrl = signal<string | undefined>(undefined);
  playbackRate = this.audioPlayerService.playbackRate;

  ttsError = ttsError;

  async generateSpeech({ mode, audioTags }: ModeWithAudioTags) {
    const fact = this.interestingFact();

    if (fact) {
      revokeBlobURL(this.audioUrl);
      this.audioUrl.set(undefined);

      const audioPrompt = {
          ...audioTags,
          transcript: fact,
      };
      if (mode === 'sync' || mode === 'stream') {
        const loadingSignal = mode === 'stream' ? this.isLoadingStream : this.isLoadingSync;
        const speechFn = (audioPrompt: AudioPrompt) => mode === 'stream' ?
            this.speechService.generateAudioBlobURL(audioPrompt) :
            this.speechService.generateAudio(audioPrompt);

        await generateSpeechHelper(audioPrompt, loadingSignal, this.audioUrl, speechFn);
      } else if (mode === 'web_audio_api') {
        await streamSpeechWithWebAudio(
          audioPrompt,
          this.isLoadingWebAudio,
          (audioPrompt: AudioPrompt) => this.audioPlayerService.playStream(audioPrompt));
      }
    }
  }

  ngOnDestroy(): void {
    revokeBlobURL(this.audioUrl);
  }
}
