import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 este import
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // 👈 aquí

  app.useStaticAssets(join(__dirname, '..', 'public')); // 👈 esta línea ahora funciona

  await app.listen(3000);
}
bootstrap();

