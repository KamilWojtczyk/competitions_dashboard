import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassNetworkComponent } from './pass-network.component';

describe('PassNetworkComponent', () => {
  let component: PassNetworkComponent;
  let fixture: ComponentFixture<PassNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassNetworkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
