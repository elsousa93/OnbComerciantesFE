import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialOfferTariffComponent } from './commercial-offer-tariff.component';

describe('CommercialOfferTariffComponent', () => {
  let component: CommercialOfferTariffComponent;
  let fixture: ComponentFixture<CommercialOfferTariffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialOfferTariffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialOfferTariffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
