import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDeclarativaLojasComponent } from './info-declarativa-lojas.component';

describe('InfoDeclarativaLojasComponent', () => {
  let component: InfoDeclarativaLojasComponent;
  let fixture: ComponentFixture<InfoDeclarativaLojasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoDeclarativaLojasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDeclarativaLojasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
