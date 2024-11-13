import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressivePassesComponent } from './progressive-passes.component';

describe('ProgressivePassesComponent', () => {
  let component: ProgressivePassesComponent;
  let fixture: ComponentFixture<ProgressivePassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressivePassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressivePassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
