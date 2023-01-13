import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeholdersListComponent } from './stakeholders-list.component';

describe('StakeholdersListComponent', () => {
  let component: StakeholdersListComponent;
  let fixture: ComponentFixture<StakeholdersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StakeholdersListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeholdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});