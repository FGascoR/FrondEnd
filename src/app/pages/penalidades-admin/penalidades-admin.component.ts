import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PenalidadService } from '../../services/penalidad.service';

@Component({
  selector: 'app-penalidades-admin',
  templateUrl: './penalidades-admin.component.html',
  styleUrls: ['./penalidades-admin.component.css']
})
export class PenalidadesAdminComponent implements OnInit, OnDestroy {

  penalidades: any[] = [];
  isLoading = true;
  filterForm: FormGroup;
  private filterSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private penalidadService: PenalidadService
  ) {
    this.filterForm = this.fb.group({
      clienteNombre: [''],
      estado: [null],
      fecha: ['']
    });
  }

  ngOnInit(): void {
    this.loadPenalidades();

    this.filterSub = this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(values => this.loadPenalidades(values));
  }

  ngOnDestroy(): void {
    if (this.filterSub) this.filterSub.unsubscribe();
  }

  loadPenalidades(filtros: any = null) {
    this.isLoading = true;
    
    let cleanFilters: any = {};
    if (filtros) {
      if (filtros.clienteNombre) cleanFilters.clienteNombre = filtros.clienteNombre;
      if (filtros.estado) cleanFilters.estado = filtros.estado;
      if (filtros.fecha) cleanFilters.fecha = filtros.fecha;
    } else {
      cleanFilters = this.filterForm.value;
    }

    this.penalidadService.getAllPenalidades(cleanFilters).subscribe({
      next: (data) => {
        this.penalidades = data;
        this.isLoading = false;
        console.log('Penalidades cargadas:', data);
      },
      error: (err) => {
        console.error('Error al cargar penalidades', err);
        this.isLoading = false;
        alert('No se pudieron cargar las penalidades.');
      }
    });
  }

  getEstadoClass(estado: string): string {
    if (estado === 'Pendiente') return 'badge bg-danger';
    if (estado === 'Pagada') return 'badge bg-success';
    return 'badge bg-secondary';
  }
}