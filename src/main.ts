import 'multer';

import * as express from 'express';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { TypeOrmExceptionFilter } from './common/filters/typeorm-exceptions.filter';

async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );

  app.use(
    express.json({
      limit: '50mb',
    }),
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: '50mb',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,
    }),
  );

  const swaggerDoc =
    new DocumentBuilder()

      .setTitle(
        'Proyect-Backend',
      )

      .setDescription(
        'This is an API for an E-commerce',
      )

      .setVersion('1.0.0')

      .addBearerAuth(
        {
          type: 'http',

          scheme: 'bearer',

          bearerFormat: 'JWT',
        },

        'Bearer',
      )

      .build();

  const documentModule =
    SwaggerModule.createDocument(
      app,
      swaggerDoc,
      {
        extraModels: [],
      },
    );

  documentModule.tags = [
    { name: 'Auth' },

    { name: 'Users' },
  ];

  SwaggerModule.setup(
    'Docs',
    app,
    documentModule,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',

      'https://estudio-via3-frontend.vercel.app',
    ],

    credentials: true,
  });

  app.useGlobalFilters(
    new TypeOrmExceptionFilter(),
  );

  await app.listen(
    process.env.PORT ?? 8000,
  );
}

bootstrap();