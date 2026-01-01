// Copied from AI Studio
import { HttpsError } from "firebase-functions/v2/https";
import { RawAudioData, WavConversionOptions } from "./types/wav-conversion-options.type";

/**
 *
 * @param {RawAudioData} param0 destructured raw audio data
 * @return {String} encoded base64 data url
 */
export function encodeBase64String({ rawData, mimeType }: RawAudioData) {
    const wavBuffer = convertToWav(rawData, mimeType);
    const base64Data = wavBuffer.toString("base64");
    return `data:audio/wav;base64,${base64Data}`;
}

/**
 *
 * @param {String} rawData  raw audio data
 * @param {String} mimeType mime type of the audio data
 * @return {Buffer} buffer
 */
export function convertToWav(rawData: string, mimeType: string): Buffer<ArrayBuffer> {
    const options = parseMimeType(mimeType);
    const wavHeader = createWavHeader(rawData.length, options);
    const buffer = Buffer.from(rawData, "base64");

    return Buffer.concat([wavHeader, buffer]);
}

/**
 *
 * @param {String} mimeType  Mime type
 * @return {WavConversionOptions} The parsed WAV conversion options.
 */
export function parseMimeType(mimeType: string): WavConversionOptions {
    const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
    const format = fileType.split("/")[1];

    const options: Partial<WavConversionOptions> = {
        numChannels: 1,
    };

    if (format && format.startsWith("L")) {
        const bits = parseInt(format.slice(1), 10);
        if (!isNaN(bits)) {
            options.bitsPerSample = bits;
        }
    }

    for (const param of params) {
        const [key, value] = param.split("=").map((s) => s.trim());
        if (key === "rate") {
            options.sampleRate = parseInt(value, 10);
        }
    }

    if (!isWavConversionOptions(options)) {
        throw new HttpsError(
            "invalid-argument",
            `Invalid or incomplete mimeType: "${mimeType}". ` +
                "Could not determine all required WAV options (sampleRate, bitsPerSample).",
        );
    }

    return options;
}

/**
 *
 * @param {WavConversionOptions} options The object to check.
 * @return {any} True if the object is a valid WavConversionOptions.
 */
function isWavConversionOptions(options: Partial<WavConversionOptions>): options is WavConversionOptions {
    // A valid WavConversionOptions object must have all properties as valid numbers.
    return (
        typeof options.numChannels === "number" &&
        !isNaN(options.numChannels) &&
        typeof options.sampleRate === "number" &&
        !isNaN(options.sampleRate) &&
        typeof options.bitsPerSample === "number" &&
        !isNaN(options.bitsPerSample)
    );
}

/**
 *
 * @param {number} dataLength  Data Length
 * @param {WavConversionOptions} options  Wave conversion options
 * @return {Buffer} buffer
 */
export function createWavHeader(dataLength: number, options: WavConversionOptions) {
    const { numChannels, sampleRate, bitsPerSample } = options;

    // http://soundfile.sapp.org/doc/WaveFormat

    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const buffer = Buffer.alloc(44);

    buffer.write("RIFF", 0); // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
    buffer.write("WAVE", 8); // Format
    buffer.write("fmt ", 12); // Subchunk1ID
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22); // NumChannels
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(byteRate, 28); // ByteRate
    buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
    buffer.write("data", 36); // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

    return buffer;
}
