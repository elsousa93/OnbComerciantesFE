import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepresentationPowerListComponent } from './representation-power-list.component';

describe('RepresentationPowerListComponent', () => {
  let component: RepresentationPowerListComponent;
  let fixture: ComponentFixture<RepresentationPowerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepresentationPowerListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepresentationPowerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
