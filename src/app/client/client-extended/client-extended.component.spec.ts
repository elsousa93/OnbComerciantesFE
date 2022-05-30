import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientExtendedComponent } from './client-extended.component';

describe('ClientExtendedComponent', () => {
  let component: ClientExtendedComponent;
  let fixture: ComponentFixture<ClientExtendedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientExtendedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientExtendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
