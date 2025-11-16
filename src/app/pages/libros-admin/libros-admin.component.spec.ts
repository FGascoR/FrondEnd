import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrosAdminComponent } from './libros-admin.component';

describe('LibrosAdminComponent', () => {
  let component: LibrosAdminComponent;
  let fixture: ComponentFixture<LibrosAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LibrosAdminComponent]
    });
    fixture = TestBed.createComponent(LibrosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
