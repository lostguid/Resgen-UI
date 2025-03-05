import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnLoginComponent } from './on-login.component';

describe('OnLoginComponent', () => {
  let component: OnLoginComponent;
  let fixture: ComponentFixture<OnLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
