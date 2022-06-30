import { TestBed } from '@angular/core/testing';

import { TableinfoService } from './tableinfo.service';

describe('TableinfoService', () => {
  let service: TableinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
