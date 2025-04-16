import { Injectable } from '@nestjs/common';
import { RecommenderSerivce } from './axios';
import * as FormData from 'form-data';
import { Readable } from 'stream';

@Injectable()
export class RecommendService {
  constructor() {}

  async uploadVector(media_id: string, title: string, media: Express.Multer.File) {
    try {
      const form = new FormData();
      const stream = Readable.from(media.buffer);

      form.append('id', media_id);
      form.append('title', title);
      form.append('media', stream, {
        filename: media.originalname,
        contentType: media.mimetype,
      });

      const response = await RecommenderSerivce.post('/vector/upload', form);

      return response.data;
    } catch {
      return { success: false };
    }
  }

  async deleteVector(id: string) {
    const response = await RecommenderSerivce.delete('/vector', { params: { id } });
    return response.data;
  }
}
