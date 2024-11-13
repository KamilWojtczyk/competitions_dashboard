import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtChartComponent } from './xt-chart.component';

describe('XtChartComponent', () => {
  let component: XtChartComponent;
  let fixture: ComponentFixture<XtChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
