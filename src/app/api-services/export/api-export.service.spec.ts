import { TestBed } from '@angular/core/testing';

import { ApiExportService } from './api-export.service';

describe('ApiExportService', () => {
  let service: ApiExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
