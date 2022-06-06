import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexCpComponent } from './index-cp.component';

describe('IndexCpComponent', () => {
  let component: IndexCpComponent;
  let fixture: ComponentFixture<IndexCpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndexCpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexCpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
