import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommercialOfferNewConfigurationComponent } from './commercial-offer-new-configuration.component';

describe('CommercialOfferListComponent', () => {
  let component: CommercialOfferNewConfigurationComponent;
  let fixture: ComponentFixture<CommercialOfferNewConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommercialOfferNewConfigurationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialOfferNewConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
