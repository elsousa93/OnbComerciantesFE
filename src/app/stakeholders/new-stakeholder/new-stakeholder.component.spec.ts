import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStakeholderComponent } from './new-stakeholder.component';

describe('NewStakeholderComponent', () => {
  let component: NewStakeholderComponent;
  let fixture: ComponentFixture<NewStakeholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewStakeholderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStakeholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
