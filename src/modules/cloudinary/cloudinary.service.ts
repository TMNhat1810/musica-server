import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { appConfig } from 'src/configs';

@Injectable()
export class CloudinaryService {
  private rootFolder: string;

  constructor() {
    this.rootFolder = appConfig.production ? 'capstone/prod' : 'capstone/dev';
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: `${this.rootFolder}/image` },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadAudio(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'video', folder: `${this.rootFolder}/audio` },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'video', folder: `${this.rootFolder}/video` },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  private extractPublicId(url: string | null): string | null {
    if (!url) return null;
    const index = url.indexOf('/upload/');
    const parts = url.substring(index + 8).split('/');
    parts.shift();
    const extract = parts.join('/').split('.');
    if (extract.length > 3) {
      extract.pop();
      return extract.join('.');
    }
    return extract[0];
  }

  async deleteMedia(url: string) {
    const publicId = this.extractPublicId(url);
    if (!publicId) return;
    cloudinary.uploader.destroy(publicId);
  }
}
