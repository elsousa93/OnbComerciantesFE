import { TestBed } from '@angular/core/testing';

import { ProcessNumberService } from './process-number.service';

describe('ProcessNumberService', () => {
  let service: ProcessNumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessNumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
