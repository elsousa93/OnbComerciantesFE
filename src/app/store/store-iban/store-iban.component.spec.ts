import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreIbanComponent } from './store-iban.component';

describe('StoreIbanComponent', () => {
  let component: StoreIbanComponent;
  let fixture: ComponentFixture<StoreIbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StoreIbanComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreIbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});