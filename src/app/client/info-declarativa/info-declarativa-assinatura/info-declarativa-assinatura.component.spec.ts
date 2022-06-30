import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDeclarativaAssinaturaComponent } from './info-declarativa-assinatura.component';

describe('InfoDeclarativaAssinaturaComponent', () => {
  let component: InfoDeclarativaAssinaturaComponent;
  let fixture: ComponentFixture<InfoDeclarativaAssinaturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoDeclarativaAssinaturaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDeclarativaAssinaturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
