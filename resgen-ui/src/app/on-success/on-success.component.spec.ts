import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSuccessComponent } from './on-success.component';

describe('OnSuccessComponent', () => {
  let component: OnSuccessComponent;
  let fixture: ComponentFixture<OnSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
