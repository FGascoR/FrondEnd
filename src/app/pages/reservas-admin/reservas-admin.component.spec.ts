import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasAdminComponent } from './reservas-admin.component';

describe('ReservasAdminComponent', () => {
  let component: ReservasAdminComponent;
  let fixture: ComponentFixture<ReservasAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReservasAdminComponent]
    });
    fixture = TestBed.createComponent(ReservasAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
