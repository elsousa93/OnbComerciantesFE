import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommercialOfferListComponent } from './commercial-offer-list.component';

describe('CommercialOfferListComponent', () => {
  let component: CommercialOfferListComponent;
  let fixture: ComponentFixture<CommercialOfferListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommercialOfferListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialOfferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});