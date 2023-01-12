import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDeclarativaComponent } from './info-declarativa.component';

describe('InfoDeclarativaComponent', () => {
  let component: InfoDeclarativaComponent;
  let fixture: ComponentFixture<InfoDeclarativaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoDeclarativaComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDeclarativaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
