import { TestBed } from '@angular/core/testing';

import { CachedDataService } from './cached-data.service';

describe('CachedDataService', () => {
  let service: CachedDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CachedDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
