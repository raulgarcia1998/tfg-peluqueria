// CC-BY-SA 4.0 — TFG Peluquería

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — en producción, especifica el origen exacto
  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
    credentials: true
  });

  // Validación automática de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // Swagger UI en /api/docs
  const config = new DocumentBuilder()
    .setTitle('TFG Peluquería — API REST v1')
    .setDescription(
      'API de gestión para peluquería. Documentación completa de todos los endpoints.\n\n' +
      'Licencia: CC-BY-SA 4.0'
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization' },
      'JWT-auth'
    )
    .addTag('Auth', 'Autenticación y registro')
    .addTag('Citas', 'Gestión de citas')
    .addTag('Servicios', 'Catálogo de servicios')
    .addTag('Empleados', 'Gestión de personal')
    .addTag('Productos', 'Inventario de productos')
    .addTag('Usuarios', 'Administración de usuarios')
    .build();

  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true }
  });

  const port = process.env['PORT'] ?? 3000;
  // Escuchar en 0.0.0.0 (todas las interfaces) es imprescindible para que
  // el proxy de plataformas como Railway pueda alcanzar la app desde fuera.
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API corriendo en: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
