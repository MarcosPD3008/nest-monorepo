# Backend Config Library

Librería compartida que proporciona configuración completa de backend para aplicaciones NestJS, incluyendo:

- ✅ **TypeORM** con PostgreSQL
- ✅ **Entidades base** con timestamps automáticos
- ✅ **Servicios base** genéricos y específicos
- ✅ **DTOs** con validación
- ✅ **Controladores** de ejemplo
- ✅ **Configuración** de variables de entorno

## 🚀 Instalación

La librería ya está incluida en el monorepo. Para usarla en una nueva aplicación:

```typescript
import { BackendConfigModule } from '@nest-monorepo/backend-config';

@Module({
  imports: [
    BackendConfigModule.forRoot(), // Configuración básica
  ],
})
export class AppModule {}
```

## 📁 Estructura

```
src/libs/backend/config/
├── src/lib/
│   ├── backend-config.module.ts    # Módulo principal
│   ├── database.config.ts          # Configuración TypeORM
│   ├── entities/
│   │   ├── base.entity.ts          # Entidad base con timestamps
│   │   └── user.entity.ts          # Entidad User de ejemplo
│   ├── services/
│   │   ├── base.service.ts         # Servicio base genérico
│   │   └── user.service.ts         # Servicio User específico
│   ├── controllers/
│   │   └── user.controller.ts      # Controlador User de ejemplo
│   └── dto/
│       └── user.dto.ts             # DTOs para validación
└── README.md
```

## 🛠️ Uso Básico

### 1. Configuración en AppModule

```typescript
import { BackendConfigModule } from '@nest-monorepo/backend-config';

@Module({
  imports: [
    BackendConfigModule.forRootAsync({
      includeControllers: true, // Incluir controladores de ejemplo
    }),
  ],
})
export class AppModule {}
```

### 2. Variables de Entorno (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=nest_monorepo
NODE_ENV=development
```

### 3. Usar Servicios

```typescript
import { UserService } from '@nest-monorepo/backend-config';

@Injectable()
export class MyService {
  constructor(private readonly userService: UserService) {}

  async getUser(id: string) {
    return await this.userService.findById(id);
  }
}
```

## 🏗️ Crear Nuevas Entidades

### 1. Crear Entidad

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntityWithTimestamps } from '@nest-monorepo/backend-config';

@Entity('products')
export class Product extends BaseEntityWithTimestamps {
  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
```

### 2. Crear Servicio

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@nest-monorepo/backend-config';
import { Product } from './product.entity';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    repository: Repository<Product>,
  ) {
    super(repository);
  }

  // Métodos específicos
  async findByPriceRange(min: number, max: number) {
    return await this.repository.find({
      where: { price: Between(min, max) },
    });
  }
}
```

### 3. Crear DTOs

```typescript
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

### 4. Actualizar Módulo

```typescript
import { BackendConfigModule } from '@nest-monorepo/backend-config';
import { Product } from './product.entity';
import { ProductService } from './product.service';

@Module({
  imports: [
    BackendConfigModule.forRootAsync({
      entities: [Product],
      services: [ProductService],
    }),
  ],
})
export class AppModule {}
```

## 🐳 Docker

La librería está configurada para trabajar con Docker Compose que incluye PostgreSQL.

### Producción
```bash
docker-compose up --build
```

### Desarrollo
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 📊 API Endpoints (Ejemplo)

Con `includeControllers: true`, se exponen automáticamente:

```
GET    /users           # Listar usuarios
GET    /users/active    # Usuarios activos
GET    /users/:id       # Usuario por ID
POST   /users           # Crear usuario
PUT    /users/:id       # Actualizar usuario
DELETE /users/:id       # Eliminar usuario
```

## 🔧 Configuración Avanzada

### Personalizar Configuración de Base de Datos

```typescript
BackendConfigModule.forRootAsync({
  // Configuración personalizada
  entities: [CustomEntity],
  services: [CustomService],
  controllers: [CustomController],
  includeControllers: false, // No incluir controladores por defecto
})
```

### Usar Solo Servicios (Sin Controladores)

```typescript
BackendConfigModule.forRootAsync({
  includeControllers: false, // Solo servicios y configuración
})
```

## 🧪 Testing

```bash
# Tests unitarios
nx test backend-config

# Tests E2E (si se incluyen controladores)
nx e2e api-e2e
```

## 📦 Dependencias Incluidas

- **@nestjs/typeorm**: Integración TypeORM con NestJS
- **typeorm**: ORM para TypeScript
- **pg**: Driver PostgreSQL
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos
- **reflect-metadata**: Metadata reflection

## 🔄 Migraciones

Para crear migraciones (cuando `synchronize: false`):

```bash
# Generar migración
npx typeorm migration:create -n InitialMigration

# Ejecutar migraciones
npx typeorm migration:run
```

---

¡La librería está lista para ser extendida con nuevas entidades, servicios y funcionalidades según las necesidades del proyecto!
