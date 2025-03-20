import { TestBed } from '@angular/core/testing';

import { FileSavingService } from './file-saving.service';

describe('FileSavingService', () => {
  let service: FileSavingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSavingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
