import { TestBed } from '@angular/core/testing';

import { ApiImportService } from './api-import.service';

describe('ApiImportService', () => {
  let service: ApiImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
