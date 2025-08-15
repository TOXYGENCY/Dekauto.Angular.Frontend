import { TestBed } from '@angular/core/testing';

import { LokiTransportService } from './loki-transport.service';

describe('LokiTransportService', () => {
  let service: LokiTransportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LokiTransportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
