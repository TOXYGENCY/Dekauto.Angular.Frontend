import { TestBed } from '@angular/core/testing';

import { ApiGroupsService } from './api-groups.service';

describe('ApiGroupsService', () => {
  let service: ApiGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
