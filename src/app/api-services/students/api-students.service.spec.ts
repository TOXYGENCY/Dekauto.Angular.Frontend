import { TestBed } from '@angular/core/testing';

import { ApiStudentsService } from './api-students.service';

describe('ApiStudentsService', () => {
  let service: ApiStudentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiStudentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
