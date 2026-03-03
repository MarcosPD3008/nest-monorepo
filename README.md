# Nest Monorepo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Monorepo con **NestJS** (backend) y **React** (TypeScript + react-router-dom + Vite) en el frontend usando **Nx**.

## 📁 Estructura del Proyecto

```
src/
├── apps/
│   ├── api/          # 🟢 Aplicación NestJS (Backend)
│   ├── api-e2e/      # Tests E2E del API
│   └── web/          # 🔵 Aplicación React (Vite, react-router-dom)
├── e2e/
│   └── api/          # Tests E2E del API (Jest)
└── libs/
    ├── backend/
    │   ├── config/   # ⚙️ Configuración backend (TypeORM, PostgreSQL)
    │   └── common/   # Utilidades backend
    └── shared/
        └── models/  # 📦 Interfaces compartidas
```

## 🚀 Comandos principales

### Desarrollo

```sh
# Iniciar API (NestJS) - http://localhost:3000
npx nx serve api

# Iniciar Web (React) - http://localhost:4200
npx nx serve web

# Iniciar ambos en paralelo
npx nx run-many -t serve -p api web
```

### Build

```sh
# Build del API
npx nx build api

# Build de la Web
npx nx build web

# Build de todo
npx nx run-many -t build
```

### Tests

```sh
# Tests unitarios
npx nx test api

# Tests E2E del API
npx nx e2e api-e2e
```

### Lint

```sh
npx nx lint api
npx nx lint web
npx nx run-many -t lint
```

## 📦 Generar nuevas librerías

```sh
# Librería TypeScript compartida
npx nx g @nx/js:library --name=my-lib --directory=src/libs/shared/my-lib

# Librería NestJS
npx nx g @nx/nest:library --name=data-access --directory=src/libs/api/data-access
```

## ⚙️ Librería Backend Config

La librería `@nest-monorepo/backend-config` proporciona configuración completa de backend:

- **TypeORM** con PostgreSQL
- **Entidades base** con timestamps automáticos
- **Servicios CRUD** genéricos y específicos
- **DTOs** con validación
- **Controladores** de ejemplo

### Uso básico

```typescript
import { BackendConfigModule } from '@nest-monorepo/backend-config';

@Module({
  imports: [
    BackendConfigModule.forRootAsync({
      includeControllers: true, // APIs REST automáticas
    }),
  ],
})
export class AppModule {}
```

### Variables de entorno (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=nest_monorepo

# CORS (lista separada por comas para múltiples orígenes)
CORS_ORIGIN=http://localhost:4200
```

### Crear nuevas entidades

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

## 🔧 Usar librerías compartidas

Importa los modelos compartidos en tus aplicaciones:

```typescript
import { User, ApiResponse } from '@libs/shared';
```

## 📊 Visualizar el grafo de dependencias

```sh
npx nx graph
```

---

[Learn more about Nx](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)

To install a new plugin you can use the `nx add` command. For example, to add the React plugin (already included):

```sh
npx nx add @nx/react
```

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🐳 Docker

El proyecto incluye configuración completa de Docker con PostgreSQL.

### Producción (todos los servicios)

```bash
docker-compose up --build
```

- **PostgreSQL**: puerto 5432
- **API (NestJS)**: puerto 3000
- **Web (React)**: puerto 80

### Desarrollo (con hot reload)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Variables de entorno

Copia `.env.example` a `.env` y configura las variables de base de datos.

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Youtube channel](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
