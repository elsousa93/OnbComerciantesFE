import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoStakeholderComponent } from './info-stakeholder.component';

describe('InfoStakeholderComponent', () => {
  let component: InfoStakeholderComponent;
  let fixture: ComponentFixture<InfoStakeholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoStakeholderComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoStakeholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});