import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavPresencialComponent } from './sidenav-presencial.component';

describe('SidenavPresencialComponent', () => {
  let component: SidenavPresencialComponent;
  let fixture: ComponentFixture<SidenavPresencialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidenavPresencialComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavPresencialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});