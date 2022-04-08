import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialOfferDetailComponent } from './commercial-offer-detail.component';

describe('CommercialOfferDetailComponent', () => {
  let component: CommercialOfferDetailComponent;
  let fixture: ComponentFixture<CommercialOfferDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialOfferDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialOfferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
