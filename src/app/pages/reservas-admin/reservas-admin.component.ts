import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { ReservaService } from '../../services/reserva.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; 
import { Subscription } from 'rxjs'; 
import { PrestamoService } from '../../services/prestamo.service';

declare var bootstrap: any; 

@Component({
  selector: 'app-reservas-admin',
  templateUrl: './reservas-admin.component.html',
  styleUrls: ['./reservas-admin.component.css']
})
export class ReservasAdminComponent implements OnInit, OnDestroy { 

  reservas: any[] = [];
  isLoading = true;
  filterForm: FormGroup; 
  private filterSub: Subscription | undefined; 

  registrarPrestamoModal: any;
  registrarPrestamoForm: FormGroup;
  selectedReserva: any = null;
  
  confirmationToast: any;
  toastMessage: string = '';
  
  constructor(
    private reservaService: ReservaService,
    private fb: FormBuilder,
    private prestamoService: PrestamoService 
  ) {
    this.filterForm = this.fb.group({
      clienteNombre: [''],
      ejemplarInfo: [''],
      fechaReserva: [''],
      fechaExpiracion: ['']
    });

    const today = new Date().toISOString().split('T')[0];
    this.registrarPrestamoForm = this.fb.group({
      fechaPrestamo: [today, Validators.required],
      fechaDevolucion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadReservas(); 

    const modalEl = document.getElementById('registrarPrestamoModal');
    if (modalEl) this.registrarPrestamoModal = new bootstrap.Modal(modalEl);

    const toastEl = document.getElementById('confirmationToast');
    if (toastEl) this.confirmationToast = new bootstrap.Toast(toastEl);

    this.filterSub = this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(values => {
      this.loadReservas(values);
    });
  }

  ngOnDestroy(): void {
    if (this.filterSub) this.filterSub.unsubscribe();
  }

  loadReservas(filtros: any = null) {
    this.isLoading = true;
    
    let cleanFilters: any = {};
    if (filtros) {
        if (filtros.clienteNombre) cleanFilters.clienteNombre = filtros.clienteNombre;
        if (filtros.ejemplarInfo) cleanFilters.ejemplarInfo = filtros.ejemplarInfo;
        if (filtros.fechaReserva) cleanFilters.fechaReserva = filtros.fechaReserva;
        if (filtros.fechaExpiracion) cleanFilters.fechaExpiracion = filtros.fechaExpiracion;
    } else {
        cleanFilters = this.filterForm.value; 
    }

    this.reservaService.getAllReservas(cleanFilters).subscribe({
      next: (data) => {
        this.reservas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas en admin', err);
        this.isLoading = false;
        alert('No se pudieron cargar las reservas.');
      }
    });
  }

  openRegistrarPrestamoModal(reserva: any) {
    this.selectedReserva = reserva;
    const today = new Date().toISOString().split('T')[0];
    
    this.registrarPrestamoForm.reset({
      fechaPrestamo: today,
      fechaDevolucion: ''
    });
    
    this.registrarPrestamoModal.show();
  }

  onRegistrarPrestamoSubmit() {
    if (this.registrarPrestamoForm.invalid || !this.selectedReserva) {
      return;
    }
    
    const formData = this.registrarPrestamoForm.value;

    const payload = {
      fechaPrestamo: formData.fechaPrestamo,
      fechaDevolucion: formData.fechaDevolucion
    };
    
    const reservaId = this.selectedReserva.idReserva;

    this.prestamoService.convertFromReserva(payload, reservaId).subscribe({
      next: (nuevoPrestamo) => {
        this.registrarPrestamoModal.hide();
        this.loadReservas(); 
        this.showToast('¡Reserva convertida a préstamo con éxito!'); 
      },
      error: (err) => {
        console.error('Error al convertir reserva', err);
        alert(err.error.message || 'No se pudo completar la operación');
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