import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export async function makeTmp(file: Express.Multer.File, id: string) {
  const tmpPath = join(tmpdir(), 'tmp-' + id);
  await writeFile(tmpPath, file.buffer);
  return tmpPath;
}
