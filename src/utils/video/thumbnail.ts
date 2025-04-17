import * as ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFile } from 'fs/promises';

export async function extractThumbnail(inputPath: string): Promise<string> {
  const filename = 'temp.png';
  const outputPath = join(tmpdir(), filename);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .screenshots({
        timestamps: ['5'],
        filename,
        folder: tmpdir(),
        size: '640x?',
      });
  });
}

export async function readThumbnail(filePath: string): Promise<Buffer> {
  try {
    const buffer = await readFile(filePath);
    return buffer;
  } catch (err) {
    throw err;
  }
}
