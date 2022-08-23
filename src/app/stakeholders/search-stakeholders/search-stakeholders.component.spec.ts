import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchStakeholdersComponent } from './search-stakeholders.component';

describe('SearchStakeholdersComponent', () => {
  let component: SearchStakeholdersComponent;
  let fixture: ComponentFixture<SearchStakeholdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchStakeholdersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchStakeholdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
