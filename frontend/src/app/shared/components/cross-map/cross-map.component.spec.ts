import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossMapComponent } from './cross-map.component';

describe('CrossMapComponent', () => {
  let component: CrossMapComponent;
  let fixture: ComponentFixture<CrossMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrossMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
