import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartingLineupComponent } from './starting-lineup.component';

describe('StartingLineupComponent', () => {
  let component: StartingLineupComponent;
  let fixture: ComponentFixture<StartingLineupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartingLineupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartingLineupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
