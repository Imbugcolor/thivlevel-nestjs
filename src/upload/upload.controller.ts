import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { RolesGuard } from 'src/user/auth/roles.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }

  @Post('images')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.cloudinaryService.uploadFiles(files);
  }

  @Post('destroy')
  @UseGuards(AccessTokenGuard, RolesGuard)
  destroyImages(@Body('public_ids') public_ids: string[]) {
    return this.cloudinaryService.destroyFiles(public_ids);
  }
}
