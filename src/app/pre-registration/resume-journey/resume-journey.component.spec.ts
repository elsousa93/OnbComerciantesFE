import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeJourneyComponent } from './resume-journey.component';

describe('ResumeJourneyComponent', () => {
  let component: ResumeJourneyComponent;
  let fixture: ComponentFixture<ResumeJourneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumeJourneyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumeJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
