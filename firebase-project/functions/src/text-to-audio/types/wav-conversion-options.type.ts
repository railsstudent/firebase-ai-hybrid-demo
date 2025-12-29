export type WavConversionOptions = {
    numChannels: number;
    sampleRate: number;
    bitsPerSample: number;
};

export type RawAudioData = {
    rawData: string;
    mimeType: string;
};
