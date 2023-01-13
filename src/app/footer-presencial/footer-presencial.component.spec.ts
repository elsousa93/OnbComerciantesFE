import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterPresencialComponent } from './footer-presencial.component';

describe('FooterPresencialComponent', () => {
  let component: FooterPresencialComponent;
  let fixture: ComponentFixture<FooterPresencialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterPresencialComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterPresencialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});