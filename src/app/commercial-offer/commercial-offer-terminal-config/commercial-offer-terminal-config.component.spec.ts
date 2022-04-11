import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialOfferTerminalConfigComponent } from './commercial-offer-terminal-config.component';

describe('CommercialOfferTerminalConfigComponent', () => {
  let component: CommercialOfferTerminalConfigComponent;
  let fixture: ComponentFixture<CommercialOfferTerminalConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialOfferTerminalConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialOfferTerminalConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
