export const AudioMimetypes = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/midi',
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
];

export function isAudio(file: Express.Multer.File): boolean {
  return AudioMimetypes.includes(file.mimetype);
}
