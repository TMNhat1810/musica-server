import * as ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { tmpdir } from 'os';

export async function compressVideo(
  inputPath: string,
  filename: string,
): Promise<string> {
  const outputPath = join(tmpdir(), filename);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-crf 28',
        '-preset medium',
        '-vf scale=1280:720',
        '-c:a aac',
        '-b:a 96k',
        '-movflags +faststart',
      ])
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}
