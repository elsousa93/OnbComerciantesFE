import { TestBed } from '@angular/core/testing';
import { CRCService } from './crcservice.service';

describe('CRCService', () => {
  let service: CRCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CRCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});