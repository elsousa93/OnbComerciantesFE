import { TestBed } from '@angular/core/testing';

import { CommercialOfferService } from './commercial-offer.service';

describe('CommercialOfferService', () => {
  let service: CommercialOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommercialOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
