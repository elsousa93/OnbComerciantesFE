import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenuPresencialComponent } from './nav-menu-presencial.component';

describe('NavMenuPresencialComponent', () => {
  let component: NavMenuPresencialComponent;
  let fixture: ComponentFixture<NavMenuPresencialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavMenuPresencialComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavMenuPresencialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
