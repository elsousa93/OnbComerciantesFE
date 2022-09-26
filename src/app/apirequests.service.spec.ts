import { TestBed } from '@angular/core/testing';

import { APIRequestsService } from './apirequests.service';

describe('APIRequestsService', () => {
  let service: APIRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(APIRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
