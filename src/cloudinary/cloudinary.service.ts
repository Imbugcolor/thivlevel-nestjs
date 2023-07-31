import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary/cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import { ImageType } from 'src/products/type/image.type';
// eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
var streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    if (file.size > 1024 * 1024) {
      throw new BadRequestException('Please upload a file size less than 1mb');
    }
    // Check if the file is an image
    if (!file.mimetype.startsWith('image')) {
      throw new BadRequestException(
        'Sorry, this file is not an image, please try again',
      );
    }
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'nestjs-app-images' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
  async uploadFiles(files: Express.Multer.File[]) {
    const images: ImageType[] = [];
    await Promise.all(
      files.map(async (file) => {
        const response = await this.uploadFile(file);
        const { public_id, secure_url } = response;
        images.push({ public_id, url: secure_url });
      }),
    );
    return {
      msg: 'Upload Success!',
      images,
    };
  }
}
