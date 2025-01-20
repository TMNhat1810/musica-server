import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import { cloudinaryConfig } from 'src/configs';

@Injectable()
export class CloudinaryProvider {
  constructor() {
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });
  }

  getCloudinary() {
    return cloudinary;
  }
}
