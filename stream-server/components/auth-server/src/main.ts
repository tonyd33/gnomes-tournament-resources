import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';

const globalPrefix = '';
const apiVersion = '1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
  });
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Auth server')
    .setDescription(
      'Simple server for managing authentication for media server callbacks',
    )
    .addSecurity('basic', { type: 'http', scheme: 'basic' })
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, () => document, {
    useGlobalPrefix: true,
    swaggerUiEnabled: false,
    jsonDocumentUrl: 'openapi.json',
    yamlDocumentUrl: 'openapi.yaml',
  });

  app.use(
    path.join('/', globalPrefix, 'reference'),
    apiReference({
      spec: {
        url: path.join('/', globalPrefix, 'openapi.json'),
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
