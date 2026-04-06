# 🎮 LUDIX - Backend

Aplicación backend para **LUDIX**, una plataforma de bienestar creativo.

---

## 📋 Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- PostgreSQL (o usar Docker — recomendado)

---

## 🚀 Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/lperezco/ludix-backend.git
cd ludix-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ludix
DB_SYNCHRONIZE=true
JWT_SECRET=MiClaveSuperSecretaParaLudix2025
JWT_EXPIRES_IN=1h
SALT_ROUNDS=10
```

### 4. Levantar la base de datos con Docker

```bash
docker-compose up -d
```

### 5. Ejecutar la aplicación

```bash
npm run start:dev
```

La aplicación estará disponible en: `http://localhost:3000`

---

## 🧪 Pruebas

### Ejecutar pruebas unitarias

```bash
npm run test
```

### Ver cobertura de pruebas

```bash
npm run test:cov
```

---

## 🔍 Probar los endpoints

### Opción 1: Swagger *(recomendado)*

Abrir en el navegador: [`https://ludix-backend.onrender.com/api`](https://ludix-backend.onrender.com/api)

### Opción 2: Postman

1. Importar la colección `LUDIX.postman_collection.json`
2. Ejecutar primero el endpoint `Login` para obtener el token de autenticación
3. Usar el token para probar cualquier endpoint protegido

### 👤 Usuario de prueba

| Campo      | Valor             |
|------------|-------------------|
| Email      | `admin@ludix.com` |
| Contraseña | `admin123`        |

---

## ☁️ Despliegue en producción

La aplicación está desplegada en **Render**:

| Recurso | URL |
|---------|-----|
| API     | [https://ludix-backend.onrender.com](https://ludix-backend.onrender.com) |
| Swagger | [https://ludix-backend.onrender.com/api](https://ludix-backend.onrender.com/api) |

---

## 🎥 Video demostrativo

[![Ver video de despliegue](https://img.shields.io/badge/YouTube-Ver%20demo-red?logo=youtube)](https://youtu.be/u4IYgKoqPRo)

---

## 🛠️ Tecnologías utilizadas

| Tecnología   | Uso                          |
|--------------|------------------------------|
| NestJS       | Framework principal          |
| TypeORM      | ORM para base de datos       |
| PostgreSQL   | Base de datos relacional     |
| JWT          | Autenticación y autorización |
| Jest         | Pruebas unitarias            |
| Swagger      | Documentación de la API      |

---

## 👩‍💻 Equipo

- Susana
- Laura
- María José
- Valentina