import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PenalidadService } from '../../services/penalidad.service';

// Declaramos Bootstrap para controlar modales y toasts vía JS
declare var bootstrap: any;

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

  resolucionModal: any;
  confirmationToast: any;
  toastMessage: string = '';
  selectedPenalidad: any = null; 

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

    const modalEl = document.getElementById('resolucionModal');
    if (modalEl) this.resolucionModal = new bootstrap.Modal(modalEl);

    const toastEl = document.getElementById('confirmationToast');
    if (toastEl) this.confirmationToast = new bootstrap.Toast(toastEl);

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
      },
      error: (err) => {
        console.error('Error al cargar penalidades', err);
        this.isLoading = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    if (estado === 'Pendiente') return 'badge bg-danger';
    if (estado === 'Pagada') return 'badge bg-success';
    if (estado === 'Concluida') return 'badge bg-secondary';
    return 'badge bg-light text-dark';
  }
  
  openResolucionModal(penalidad: any) {
    this.selectedPenalidad = penalidad;
    this.resolucionModal.show();
  }

  confirmarResolucion() {
    if (!this.selectedPenalidad) return;

    this.penalidadService.pagarPenalidad(this.selectedPenalidad.idPenalidad).subscribe({
      next: (res) => {
        this.resolucionModal.hide(); 
        
        const esMonetaria = this.selectedPenalidad.tipo === 'Monetaria';
        
        this.showToast(esMonetaria 
          ? '¡Pago registrado correctamente!' 
          : '¡Penalidad concluida exitosamente!');
        
        this.loadPenalidades(); 
      },
      error: (err) => {
        console.error(err);
        alert('Hubo un error al intentar procesar la acción.'); 
      }
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    if (this.confirmationToast) {
      this.confirmationToast.show();
    }
  }
}