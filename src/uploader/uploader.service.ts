import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import sharp from 'sharp';
import { v4 as uuidV4, v5 as uuidV5 } from 'uuid';
import {
  IMAGE_SIZE,
  MAX_WIDTH,
  QUALITY_ARRAY,
} from './constants/uploader.constant';
import { RatioEnum } from './enums/ratio.enum';
import { IBucketData } from './interfaces/bucket-data.interface';
import { Express } from 'express';
import { config } from 'dotenv';
import { extname } from 'path';

config();
@Injectable()
export class UploaderService {
  private readonly client: S3Client;
  private readonly bucketData: IBucketData;
  private readonly loggerService: LoggerService;

  constructor() {
    this.client = new S3Client({
      forcePathStyle: false,
      region: process.env.BUCKET_REGION,
      endpoint: `https://s3.${`${process.env.BUCKET_REGION}.${process.env.BUCKET_HOST}.com`}`,
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_KEY,
      },
    });
    this.bucketData = {
      name: process.env.BUCKET_NAME,
      folder: process.env.PROFILE_FOLDER,
      appUuid: process.env.SERVICE_ID,
      url: `https://${
        process.env.BUCKET_NAME
      }.s3.${`${process.env.BUCKET_REGION}.${process.env.BUCKET_HOST}.com`}/`,
    };
    this.loggerService = new Logger(UploaderService.name);
  }

  private static validateImage(mimetype: string): string | false {
    const val = mimetype.split('/');
    if (val[0] !== 'image') return false;

    return val[1] ?? false;
  }

  private static async compressImage(
    buffer: Buffer,
    ratio?: number,
  ): Promise<Buffer> {
    let compressBuffer: sharp.Sharp | Buffer = sharp(buffer);
    // .jpeg({
    //     mozjpeg: true,
    //     chromaSubsampling: '4:4:4',
    // });

    if (ratio) {
      compressBuffer.resize({
        width: MAX_WIDTH,
        height: Math.round(MAX_WIDTH * ratio),
        fit: 'cover',
      });
    }

    compressBuffer = await compressBuffer.toBuffer();

    if (compressBuffer.length > IMAGE_SIZE) {
      for (let i = 0; i < QUALITY_ARRAY.length; i++) {
        const quality = QUALITY_ARRAY[i];
        const smallerBuffer = await sharp(compressBuffer)
          // .jpeg({
          //     quality,
          //     chromaSubsampling: '4:4:4',
          // })
          .toBuffer();

        if (smallerBuffer.length <= IMAGE_SIZE || quality === 10) {
          compressBuffer = smallerBuffer;
          break;
        }
      }
    }

    return compressBuffer;
  }

  /**
   * Upload Image
   *
   * Converts an image to jpeg and uploads it to the bucket
   */
  public async uploadImage(
    userId: number,
    file: Express.Multer.File,
    ratio?: RatioEnum,
    fileType?: string,
  ): Promise<string> {
    const { mimetype } = file;
    const imageType = UploaderService.validateImage(mimetype);

    if (!imageType) {
      throw new BadRequestException('Please upload a valid image');
    }

    try {
      return await this.uploadFile(
        userId,
        file.buffer?.length < 50000
          ? file.buffer
          : await UploaderService.compressImage(file.buffer, ratio),
        file.buffer?.length < 50000 ? '.' + mimetype.split('/')[1] : '.jpg',
        fileType,
      );
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException('Error uploading image');
    }
  }

  /**
   * Upload Video
   *
   * uploads it to the bucket
   */
  public async uploadVideo(
    userId: number,
    file: Express.Multer.File,
    ratio?: RatioEnum,
    fileType?: string,
  ): Promise<string> {
    const { mimetype } = file;
    console.log(
      '🚀 ~ file: uploader.service.ts:147 ~ UploaderService ~ file:',
      file,
    );
    console.log(
      '🚀 ~ file: uploader.service.ts:147 ~ UploaderService ~ mimetype:',
      mimetype,
    );

    try {
      return await this.uploadFile(
        userId,
        file.buffer,
        extname(file.originalname),
        fileType,
      );
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException('Error uploading image');
    }
  }

  /**
   * Delete File
   *
   * Takes a file url and deletes the file from the bucket
   */
  public deleteFile(url: string): void {
    const keyArr = url.split('.com/');

    if (keyArr.length !== 2 || !this.bucketData.url.includes(keyArr[0])) {
      this.loggerService.error('Invalid url to delete file');
    }

    this.client
      .send(
        new DeleteObjectCommand({
          Bucket: this.bucketData.name,
          Key: keyArr[1],
        }),
      )
      .then(() => this.loggerService.log('File deleted successfully'))
      .catch((error) => this.loggerService.error(error));
  }

  private async uploadFile(
    userId: number,
    fileBuffer: Buffer,
    fileExt: string,
    fileType?: string,
  ): Promise<string> {
    let key: string = '';
    if (fileType) {
      key =
        // process.env.POST_FOLDER +
        // '/' +
        // uuidV5(userId.toString(), this.bucketData.appUuid) +
        // '/' +
        uuidV4() + fileExt;
    } else {
      key =
        // process.env.POST_FOLDER +
        // '/' +
        // uuidV5(userId.toString(), this.bucketData.appUuid) +
        // '/' +
        uuidV4() + fileExt;
    }

    console.log('>>>>>>>>>>>>>>>>>>> KEY:', key);
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketData.name,
          Body: fileBuffer,
          Key: key,
          ACL: 'public-read',
        }),
      );
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException('Error uploading file');
    }

    return this.bucketData.url + key;
  }
}
