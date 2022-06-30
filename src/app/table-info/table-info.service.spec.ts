import { TestBed } from '@angular/core/testing';

import { TableInfoService } from './table-info.service';

describe('TableInfoService', () => {
  let service: TableInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
