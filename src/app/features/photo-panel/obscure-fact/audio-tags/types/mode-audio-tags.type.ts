import { AudioPromptData } from './audio-prompt-data.type';
import { GenerateSpeechMode } from '../../generate-audio.util';

export type ModeWithAudioTags = {
  mode: GenerateSpeechMode;
  audioTags: AudioPromptData;
};
