import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesAdminComponent } from './reportes-admin.component';

describe('ReportesAdminComponent', () => {
  let component: ReportesAdminComponent;
  let fixture: ComponentFixture<ReportesAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportesAdminComponent]
    });
    fixture = TestBed.createComponent(ReportesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
