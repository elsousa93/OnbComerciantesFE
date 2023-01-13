import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavMenuInternaComponent } from './nav-menu-interna.component';

describe('NavMenuInternaComponent', () => {
  let component: NavMenuInternaComponent;
  let fixture: ComponentFixture<NavMenuInternaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavMenuInternaComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavMenuInternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});