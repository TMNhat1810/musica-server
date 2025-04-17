import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { unlink } from 'fs/promises';
import { appConfig } from 'src/configs';
import { compressVideo } from 'src/utils/video';

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

  async uploadFromTmp(
    path: string,
    id: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const compressPath = await compressVideo(path, id + '.mp4');

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        compressPath,
        {
          resource_type: 'video',
          folder: `${this.rootFolder}/video`,
          chunk_size: 64 * 1024 * 1024,
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          unlink(compressPath);
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async uploadFileFromBuffer(
    buffer: Buffer,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: `${this.rootFolder}/image`,
          },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          },
        )
        .end(buffer);
    });
  }

  async deleteMedia(url: string) {
    const publicId = this.extractPublicId(url);
    if (!publicId) return;
    cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  }

  async deleteImage(url: string) {
    const publicId = this.extractPublicId(url);
    if (!publicId) return;
    cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
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
}
