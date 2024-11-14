import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotQualityTimelineComponent } from './shot-quality-timeline.component';

describe('ShotQualityTimelineComponent', () => {
  let component: ShotQualityTimelineComponent;
  let fixture: ComponentFixture<ShotQualityTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShotQualityTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShotQualityTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
