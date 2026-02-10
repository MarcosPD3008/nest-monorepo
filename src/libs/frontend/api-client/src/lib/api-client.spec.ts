import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('api-client', () => {
  it('UserService should extend BaseHttpService', () => {
    const mockHttp = {
      get: () => of({ data: [], success: true }),
      post: () => of({}),
      put: () => of({}),
      patch: () => of({}),
      delete: () => of({}),
    } as unknown as HttpClient;

    const service = new UserService(mockHttp);
    expect(service).toBeDefined();
    expect(service.getAllCached).toBeDefined();
    expect(service.getByIdCached).toBeDefined();
  });
});
