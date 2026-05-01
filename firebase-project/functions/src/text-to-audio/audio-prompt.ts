import logger from 'firebase-functions/logger';
import { SCENE_DICTIONARY } from './constants/scens.const';
import { AudioProfile } from './types/audio-profile.type';
import { AudioPrompt } from './types/audio-prompt.type';

export function buildAudioPrompt(data: AudioPrompt, audioProfile: AudioProfile): string {
    // Randomly select a scene from the dictionary
    const randomIndex = Math.floor(Math.random() * SCENE_DICTIONARY.length);
    logger.debug("Selected scene index:", randomIndex);
    const selectedScene = SCENE_DICTIONARY[randomIndex];

    const audioTags = `${makeTag(data.emotion)}${makeTag(data.pace)}`;

    // add attributes to the beginning of each sentence in the transcript
    const sentences = data.transcript.split('.').filter((s): s is string => !!s)
      .map(sentence => `${audioTags}${sentence.trim()}.`)
      .join('');

    const transcriptWithAttributes = `## TRANSCRIPT:\n"""${sentences}"""`;
    const profile = `# AUDIO PROFILE: ${audioProfile.name}\n## "${audioProfile.role}"`;

    // append transcript
    const trimmedScene = (data.scene || '').trim() || selectedScene;
    const prompt = `${profile}\n\n## Scene:\n${trimmedScene}\n\n${transcriptWithAttributes}`;
    logger.debug("Constructed audio prompt:", prompt);

    return prompt;
}

function makeTag(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? `[${trimmedValue}]` : '';
}

