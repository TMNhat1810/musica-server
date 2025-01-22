export const AudioMimetypes = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/midi',
];

export function isAudio(file: Express.Multer.File): boolean {
  return AudioMimetypes.includes(file.mimetype);
}
