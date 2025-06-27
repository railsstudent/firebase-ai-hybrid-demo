export async function blobToGenerativePart(blob: Blob) {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result === null) {
          return reject(new Error('FileReader returned null result'));
        }

        const fileReaderResult = reader.result;
        if (typeof fileReaderResult === 'string') {
          return resolve(fileReaderResult)
        } else {
          const decoder = new TextDecoder('utf-8'); // Specify encoding if needed
          const text = decoder.decode(fileReaderResult);
          return resolve(text)
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: blob.type },
    };
}
