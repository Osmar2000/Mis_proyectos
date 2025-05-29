import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';
import * as fs from 'fs';

@Injectable()
export class DriveService {
    private drive;

    constructor() {
      const auth = new google.auth.GoogleAuth({
        keyFile: 'src/drive/credentials.json', // ruta a tu archivo de cuenta de servicio
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
  
      this.drive = google.drive({ version: 'v3', auth });
    }
  
    async listFiles() {
      const res = await this.drive.files.list({
        pageSize: 10,
        fields: 'files(id, name)',
      });
      return res.data.files;
    }
  
    async uploadFile(filename: string, filepath: string, mimeType: string) {
  const fileMetadata = { name: filename };
  const media = {
    mimeType,
    body: fs.createReadStream(filepath),
  };

  const res = await this.drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id',
  });

  const fileId = res.data.id;

  // Hacer el archivo público
  await this.drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    id: fileId,
     name: filename,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

async listPublicFiles() {
  const res = await this.drive.files.list({
    pageSize: 10,
    fields: 'files(id, name)',
  });

  return res.data.files.map(file => ({
    id: file.id,
    name: file.name, 
    viewUrl: `https://drive.google.com/file/d/${file.id}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
  }));
}

  
    async downloadFile(fileId: string): Promise<Readable> {
      const res = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return res.data as Readable;
    }
  
    async shareFile(fileId: string, email: string) {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: email,
        },
      });
      return { message: 'Archivo compartido con éxito' };
    }

    async deleteFile(fileId: string) {
      await this.drive.files.delete({ fileId });
      return { message: 'Archivo eliminado con éxito' };
  }

}
