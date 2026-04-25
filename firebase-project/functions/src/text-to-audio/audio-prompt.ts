import logger from 'firebase-functions/logger';
import { SCENE_DICTIONARY } from './constants/scens.const';
import { AudioProfile } from './types/audio-profile.type';

export function buildAudioPrompt(transcript: string, audioProfile: AudioProfile): string {
    // Randomly select a scene from the dictionary
    const randomIndex = Math.floor(Math.random() * SCENE_DICTIONARY.length);
    logger.debug("Selected scene index:", randomIndex);
    const selectedScene = SCENE_DICTIONARY[randomIndex];

    const profile = `# AUDIO PROFILE: ${audioProfile.name}\n## "${audioProfile.role}"`;

    // append transcript
    const prompt = `${profile}\n\n## Scene:\n${selectedScene}\n\n## TRANSCRIPT:\n${transcript}`;

    return prompt;
}
