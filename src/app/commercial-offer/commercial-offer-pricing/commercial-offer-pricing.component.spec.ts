import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialOfferPricingComponent } from './commercial-offer-pricing.component';

describe('CommercialOfferPricingComponent', () => {
  let component: CommercialOfferPricingComponent;
  let fixture: ComponentFixture<CommercialOfferPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialOfferPricingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialOfferPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
