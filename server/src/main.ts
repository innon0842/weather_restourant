import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Programmatically create uploads directories if they do not exist
  const uploadDir = join(process.cwd(), 'uploads');
  const avatarDir = join(uploadDir, 'avatars');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
  }

  // Serve static assets from the local uploads folder with prefix /uploads
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads',
  });

  // Register global validation pipe to enforce class-validator rules on DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips non-DTO decorated fields from payload
      forbidNonWhitelisted: true, // Rejects requests with non-white-listed properties
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );

  // Enable CORS so the React/Next.js client can make API requests
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
