import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytaskComponent } from './mytask.component';

describe('MytaskComponent', () => {
  let component: MytaskComponent;
  let fixture: ComponentFixture<MytaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MytaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MytaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
