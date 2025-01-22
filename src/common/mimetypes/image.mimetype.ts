export const ImageMimetypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

export function isImage(file: Express.Multer.File): boolean {
  return ImageMimetypes.includes(file.mimetype);
}
