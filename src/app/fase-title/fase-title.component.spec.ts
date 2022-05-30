import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseTitleComponent } from './fase-title.component';

describe('FaseTitleComponent', () => {
  let component: FaseTitleComponent;
  let fixture: ComponentFixture<FaseTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaseTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaseTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
