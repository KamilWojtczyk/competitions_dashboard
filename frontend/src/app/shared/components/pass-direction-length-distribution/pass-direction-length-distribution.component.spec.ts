import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassDirectionLengthDistributionComponent } from './pass-direction-length-distribution.component';

describe('PassDirectionLengthDistributionComponent', () => {
  let component: PassDirectionLengthDistributionComponent;
  let fixture: ComponentFixture<PassDirectionLengthDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassDirectionLengthDistributionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassDirectionLengthDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
