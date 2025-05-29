import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DriveService } from './drive.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('drive')
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Get('list')
  async listFiles() {
    return this.driveService.listPublicFiles();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // asegúrate que esta carpeta exista
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No se recibió ningún archivo');
    }

    return this.driveService.uploadFile(
      file.originalname || file.filename,
      file.path,
      file.mimetype
    );
  }

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.driveService.downloadFile(id);
    stream.pipe(res);
  }

  @Post('share/:id')
  async shareFile(@Param('id') id: string, @Body('email') email: string) {
    return this.driveService.shareFile(id, email);
  }

  @Get('ping')
  ping() {
    return { message: 'pong' };
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return this.driveService.deleteFile(id);
  }

} 
