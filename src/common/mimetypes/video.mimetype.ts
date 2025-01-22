export const VideoMimetypes = [
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/webm',
  'video/avi',
  'video/mov',
];

export function isVideo(file: Express.Multer.File): boolean {
  return VideoMimetypes.includes(file.mimetype);
}
