import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDeclarativaStakeholderComponent } from './info-declarativa-stakeholder.component';

describe('InfoDeclarativaStakeholderComponent', () => {
  let component: InfoDeclarativaStakeholderComponent;
  let fixture: ComponentFixture<InfoDeclarativaStakeholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoDeclarativaStakeholderComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDeclarativaStakeholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});