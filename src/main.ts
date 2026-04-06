import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('LUDIX API')
    .setDescription(`API para la aplicación de bienestar creativo LUDIX

## Roles y permisos

- **admin**: Acceso completo a todos los endpoints
- **user**: Acceso limitado (solo lectura y acciones propias)

## Autenticación

Para usar los endpoints protegidos, primero debes:
1. Hacer login en \`POST /auth/login\`
2. Copiar el \`access_token\` de la respuesta
3. Hacer clic en el botón "Authorize" y pegar el token

## Endpoints principales

- \`/auth\` - Autenticación y registro
- \`/users\` - Gestión de usuarios (solo admin)
- \`/exercises\` - Catálogo de ejercicios
- \`/comments\` - Comentarios en ejercicios
- \`/achievements\` - Logros de usuarios
`)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // ✅ Usar puerto dinámico para Railway
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Aplicación corriendo en: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Documentación Swagger en: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
