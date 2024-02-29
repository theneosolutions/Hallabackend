import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploaderService } from "./uploader.service";
import { Express } from 'express';
import { Public } from "src/auth/decorators/public.decorator";
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";
import { RatioEnum } from './enums/ratio.enum';

@Controller('api/uploader')
export class UploaderController {}
