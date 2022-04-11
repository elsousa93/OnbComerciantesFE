import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialOfferStoreListComponent } from './commercial-offer-store-list.component';

describe('CommercialOfferStoreListComponent', () => {
  let component: CommercialOfferStoreListComponent;
  let fixture: ComponentFixture<CommercialOfferStoreListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialOfferStoreListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialOfferStoreListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
