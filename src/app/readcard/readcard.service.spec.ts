import { TestBed } from '@angular/core/testing';

import { ReadcardService } from './readcard.service';

describe('ReadcardService', () => {
  let service: ReadcardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadcardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});