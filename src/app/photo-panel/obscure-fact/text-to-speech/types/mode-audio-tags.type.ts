import { GenerateSpeechMode } from '../../generate-audio.util';
import { AudioPromptData } from './audio-prompt-data.type';

export type ModeWithAudioTags = {
  mode: GenerateSpeechMode;
  audioTags: AudioPromptData;
};
