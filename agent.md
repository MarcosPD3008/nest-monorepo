# Agent Guide: Implementing Features in NestJS Monorepo

This guide explains how to implement new features in this NestJS monorepo template, following the feature-based architecture.

## Architecture Overview

- **Feature-based organization**: Code is organized by features rather than by type (entities, services, etc.)
- **Library (`libs/backend/config/`)**: Contains data models, services, and configuration
- **Shared Library (`libs/shared/models/`)**: Contains utilities, validations, and components shared between frontend and backend
- **API App (`apps/api/`)**: Contains controllers and application logic
- **Web App (`apps/web/`)**: Contains Angular components and frontend logic

## Folder Structure

```
src/
├── libs/
│   ├── backend/
│   │   └── config/
│   │       └── src/
│   │           └── lib/
│   │               ├── backend-config.module.ts
│   │               ├── config/
│   │               │   └── database.config.ts
│   │               └── [feature-name]/
│   │                   ├── entities/
│   │                   ├── services/
│   │                   └── dto/
│   └── shared/
│       └── src/
│           └── lib/
│               ├── models/
│               │   └── shared-models.ts
│               ├── utils/
│               │   └── index.ts
│               ├── validations/
│               │   └── index.ts
│               └── components/
│                   └── index.ts
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── app/
│   │       │   └── app.module.ts
│   │       └── controllers/
│   │           └── [feature].controller.ts
│   └── web/
│       └── src/
│           └── app/
│               └── [component].component.ts
```

## Using Shared Library

The shared library contains utilities, validations, and components that can be used in both frontend and backend.

### Available Shared Resources

#### Models (`@libs/shared`)
- `ApiResponse<T>` - Standard API response format
- `User` - User interface
- `PaginatedResponse<T>` - Paginated data response

#### Utils (`@libs/shared`)
- `capitalize(str)` - Capitalize first letter
- `generateRandomString(length)` - Generate random string
- `deepClone(obj)` - Deep clone objects
- `isEmpty(value)` - Check if value is empty
- `formatDate(date)` - Format date to readable string
- `debounce(func, wait)` - Debounce function calls
- `isValidEmail(email)` - Basic email validation
- `slugify(text)` - Convert text to URL slug

#### Validations (`@libs/shared`)
- `validateEmail(email)` - Email validation with message
- `validatePassword(password)` - Password strength validation
- `validateRequired(value, fieldName)` - Required field validation
- `validateLength(value, min, max, fieldName)` - String length validation
- `validateUrl(url)` - URL format validation
- `validatePhone(phone)` - Phone number validation
- `validateUserRegistration(data)` - Complete user registration validation

#### Components (`@libs/shared`)
- `BaseComponent` - Base component interface
- `FormComponent` - Form component interface
- `ListComponent<T>` - List component interface
- `ModalComponent` - Modal component interface
- Component configuration types: `TableColumn`, `ButtonConfig`, `InputConfig`

### Using in Backend (NestJS)

```typescript
import { validateEmail, formatDate, isEmpty } from '@libs/shared';

// In a service
if (!validateEmail(userData.email).isValid) {
  throw new BadRequestException('Invalid email');
}

const formattedDate = formatDate(new Date());
```

### Using in Frontend (Angular)

```typescript
import { Component } from '@angular/core';
import { validateUserRegistration, capitalize } from '@libs/shared';

@Component({...})
export class UserFormComponent {
  onSubmit() {
    const validation = validateUserRegistration(this.userData);
    if (!validation.isValid) {
      // Handle errors
      console.log(validation.errors);
    }
  }

  get displayName() {
    return capitalize(this.userData.firstName);
  }
}
```

### Adding New Shared Resources

1. **Utils**: Add functions to `src/libs/shared/models/src/lib/utils/index.ts`
2. **Validations**: Add validation functions to `src/libs/shared/models/src/lib/validations/index.ts`
3. **Models**: Add interfaces/types to `src/libs/shared/src/lib/models/shared-models.ts`
4. **Components**: Add component interfaces to `src/libs/shared/models/src/lib/components/index.ts`
5. **Export**: Make sure to export from `src/libs/shared/models/src/index.ts`

## Implementing a New Feature

### Step 1: Create Feature Folder in Library

Create a new folder for your feature under `src/libs/backend/config/src/lib/`:

```bash
mkdir src/libs/backend/config/src/lib/[feature-name]
```

### Step 2: Create Entity

1. Create `entities/` folder in your feature
2. Create your entity file extending `BaseEntityWithTimestamps`
3. Add TypeORM decorators and validation

Example:
```typescript
import { Entity, Column } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { BaseEntityWithTimestamps } from '../base.entity';

@Entity('[feature]s')
export class [Feature] extends BaseEntityWithTimestamps {
  @Column()
  @IsNotEmpty()
  name!: string;

  // Add other fields...
}
```

### Step 3: Create DTOs

1. Create `dto/` folder in your feature
2. Create DTOs for create and update operations

Example:
```typescript
import { IsNotEmpty } from 'class-validator';

export class Create[Feature]Dto {
  @IsNotEmpty()
  name!: string;
}

export class Update[Feature]Dto {
  @IsOptional()
  name?: string;
}
```

### Step 4: Create Service

1. Create `services/` folder in your feature
2. Create service extending `BaseService`
3. Add feature-specific methods

Example:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { [Feature] } from '../entities/[feature].entity';
import { BaseService } from './base.service';

@Injectable()
export class [Feature]Service extends BaseService<[Feature]> {
  constructor(
    @InjectRepository([Feature])
    private readonly [feature]Repository: Repository<[Feature]>,
  ) {
    super([feature]Repository);
  }

  // Add custom methods...
  async findByName(name: string): Promise<[Feature] | null> {
    return await this.[feature]Repository.findOne({ where: { name } });
  }
}
```

### Step 5: Update Backend Config Module

1. Import the new entity and service
2. Add entity to TypeOrmModule.forFeature()
3. Add service to providers array

Example:
```typescript
import { [Feature] } from './[feature]/entities/[feature].entity';
import { [Feature]Service } from './[feature]/services/[feature].service';

// In @Module decorator:
imports: [
  // ... existing imports
  TypeOrmModule.forFeature([User, [Feature]]), // Add new entity
],
providers: [UserService, [Feature]Service], // Add new service
exports: [ConfigModule, TypeOrmModule, UserService, [Feature]Service], // Export new service
```

### Step 6: Update Index Exports

Add exports for the new feature in `src/index.ts`:

```typescript
export * from './lib/[feature]/entities/[feature].entity';
export * from './lib/[feature]/services/[feature].service';
export * from './lib/[feature]/dto/[feature].dto';
```

### Step 7: Create Controller in API App

1. Create controller in `src/apps/api/src/controllers/`
2. Import service from library
3. Implement CRUD endpoints

Example:
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { [Feature]Service, Create[Feature]Dto, Update[Feature]Dto, [Feature] } from '@libs/backend-config';

@Controller('[feature]s')
export class [Feature]Controller {
  constructor(private readonly [feature]Service: [Feature]Service) {}

  @Get()
  async findAll(): Promise<[Feature][]> {
    return await this.[feature]Service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<[Feature]> {
    return await this.[feature]Service.findById(id);
  }

  @Post()
  async create(@Body() createDto: Create[Feature]Dto): Promise<[Feature]> {
    return await this.[feature]Service.create(createDto);
  }

  // Add other endpoints...
}
```

### Step 8: Update API App Module

1. Import the new controller
2. Add to controllers array

Example:
```typescript
import { [Feature]Controller } from '../controllers/[feature].controller';

// In @Module decorator:
controllers: [AppController, UsersController, [Feature]Controller],
```

## Best Practices

- Always extend `BaseEntityWithTimestamps` for entities
- Use `BaseService` for common CRUD operations
- Add feature-specific methods to services
- Use class-validator decorators in DTOs
- Export everything from the library's index.ts
- Follow RESTful naming conventions for controllers
- Use dependency injection properly

## Testing

- Create unit tests for services
- Create e2e tests for controllers
- Use the provided test configurations

## Building and Running

```bash
# Build library
npx nx build backend-config

# Build API
npx nx build api

# Run API
npx nx serve api
```

This structure ensures clean separation of concerns and easy maintenance of features.</content>
<parameter name="filePath">d:\nest\nest-monorepo\agent.md