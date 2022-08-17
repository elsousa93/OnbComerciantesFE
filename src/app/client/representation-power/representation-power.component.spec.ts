import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepresentationPowerComponent } from './representation-power.component';

describe('RepresentationPowerComponent', () => {
  let component: RepresentationPowerComponent;
  let fixture: ComponentFixture<RepresentationPowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepresentationPowerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepresentationPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
