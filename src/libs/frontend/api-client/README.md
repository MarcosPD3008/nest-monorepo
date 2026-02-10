# api-client

Servicios base para HTTP usando Angular HttpClient. Caché con ngx-cache (sessionStorage por defecto). No incluye interceptors (cada proyecto implementa su lógica de auth).

## Contenido

- **BaseHttpService**: Servicio base con CRUD genérico usando HttpClient
- **LoadingService**: Estados de carga centralizados
- **retryRequest**: Operador para reintentos en requests fallidos
- **provideHttpCache**: Caché con ngx-cache (sessionStorage/localStorage/memory configurable por ambiente)
- **HttpCacheAdapter**: Interfaz para reemplazar la implementación de caché

## Configuración

```typescript
// app.config.ts
import { provideHttpCache } from '@libs/frontend/api-client';
import { environment } from '../environments/environment';

providers: [
  provideHttpCache({ storage: environment.cacheStorage }), // 'session' | 'local' | 'memory'
  ...
]
```

## Uso

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService extends BaseHttpService<Product> {
  constructor(http: HttpClient) {
    super(http, '/api/products', {
      cacheScope: 'products',
      cacheTtl: 300000,
      retry: { count: 2, delay: 1500, retryStatusCodes: [502, 503, 504] },
    });
  }

  getAllCached() {
    return this.getCached('all', () => this.getAll());
  }
}
```

## Reemplazar caché

Proveer `HTTP_CACHE_ADAPTER` con una implementación custom de `HttpCacheAdapter` para reemplazar ngx-cache.

## Building

Run `nx build api-client` to build the library.

## Running unit tests

Run `nx test api-client` to execute the unit tests via Jest.
