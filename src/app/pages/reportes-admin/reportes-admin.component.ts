import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reportes-admin',
  templateUrl: './reportes-admin.component.html',
})
export class ReportesAdminComponent implements OnInit, OnDestroy {

  filterForm: FormGroup;
  reportes: any[] = []; 
  isLoading = true;
  private filterSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService 
  ) {
    this.filterForm = this.fb.group({
      clienteNombre: [''],
      ejemplarInfo: [''],
      fechaInicio: [''] 
    });
  }

  ngOnInit(): void {
    this.loadReportes();
    
    this.filterSub = this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(values => {
      this.loadReportes(values);
    });
  }

  ngOnDestroy(): void {
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }

  loadReportes(filtros: any = null) {
    this.isLoading = true;

    let cleanFilters: any = {};
    if (filtros) {
        if (filtros.clienteNombre) cleanFilters.clienteNombre = filtros.clienteNombre;
        if (filtros.ejemplarInfo) cleanFilters.ejemplarInfo = filtros.ejemplarInfo;
        if (filtros.fechaInicio) cleanFilters.fechaInicio = filtros.fechaInicio;
    } else {
        cleanFilters = this.filterForm.value;
    }

    this.reporteService.getReportes(cleanFilters).subscribe({
      next: (data) => {
        this.reportes = data; 
        this.isLoading = false;
        console.log('Reportes unificados cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar reportes', err);
        this.isLoading = false;
        alert('No se pudieron cargar los reportes.');
      }
    });
  }
}