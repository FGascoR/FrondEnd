import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EjemplarService } from '../../services/ejemplar.service';
import { LibroService } from '../../services/libro.service';
import { DeweyService } from '../../services/dewey.service';
import { AutorService } from '../../services/autor.service';         
import { AutorLibroService } from '../../services/autor-libro.service';
import { switchMap } from 'rxjs'; 

declare var bootstrap: any;

@Component({
  selector: 'app-libros-admin',
  templateUrl: './libros-admin.component.html',
  styleUrls: ['./libros-admin.component.css']
})
export class LibrosAdminComponent implements OnInit {

  ejemplares: any[] = [];
  libros: any[] = [];
  deweyCategorias: any[] = [];
  autores: any[] = []; 

  ejemplarForm: FormGroup;
  libroForm: FormGroup;
  autorForm: FormGroup; 
  deweyForm: FormGroup; 

  isEditMode = false;
  currentEjemplarId: number | null = null;

  ejemplarModal: any;
  libroModal: any;
  autorModal: any;
  deweyModal: any; 

  constructor(
    private fb: FormBuilder,
    private ejemplarService: EjemplarService,
    private libroService: LibroService,
    private deweyService: DeweyService,
    private autorService: AutorService,         
    private autorLibroService: AutorLibroService  
  ) {
    this.ejemplarForm = this.fb.group({
      libro: [null, Validators.required],
      codigoInterno: ['', Validators.required],
      estadoEjemplar: ['Bueno', Validators.required],
      estado: ['Disponible', Validators.required]
    });

    this.libroForm = this.fb.group({
      titulo: ['', Validators.required],
      editorial: [''],
      anioPublicacion: [''],
      isbn: ['', Validators.required],
      dewey: [null, Validators.required],
      autor: [null, Validators.required] 
    });

    this.autorForm = this.fb.group({ 
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      nacionalidad: ['']
    });

    this.deweyForm = this.fb.group({ 
      idDewey: ['', [Validators.required, Validators.pattern("^[0-9]*$")]], 
      categoria: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.loadAllData(); 

    const ejemplarModalEl = document.getElementById('ejemplarModal');
    if (ejemplarModalEl) this.ejemplarModal = new bootstrap.Modal(ejemplarModalEl);
    
    const libroModalEl = document.getElementById('libroModal');
    if (libroModalEl) this.libroModal = new bootstrap.Modal(libroModalEl);

    const autorModalEl = document.getElementById('autorModal');
    if (autorModalEl) this.autorModal = new bootstrap.Modal(autorModalEl);

    const deweyModalEl = document.getElementById('deweyModal');
    if (deweyModalEl) this.deweyModal = new bootstrap.Modal(deweyModalEl);
  }

  loadAllData() {
    this.loadEjemplares();
    this.loadLibros();
    this.loadDeweys();
    this.loadAutores(); 
  }

  loadEjemplares() {
    this.ejemplarService.getEjemplares().subscribe({
      next: (data) => this.ejemplares = data,
      error: (err) => console.error('Error al cargar ejemplares', err)
    });
  }

  loadLibros() {
    this.libroService.getLibros().subscribe({
      next: (data) => this.libros = data,
      error: (err) => console.error('Error al cargar libros', err)
    });
  }

  loadDeweys() {
    this.deweyService.getDeweys().subscribe({
      next: (data) => this.deweyCategorias = data,
      error: (err) => console.error('Error al cargar categorías Dewey', err)
    });
  }

  loadAutores() {
    this.autorService.getAutores().subscribe({
      next: (data) => this.autores = data,
      error: (err) => console.error('Error al cargar autores', err)
    });
  }

  openEjemplarModal(ejemplar?: any) {
    if (ejemplar) {
      this.isEditMode = true;
      this.currentEjemplarId = ejemplar.idEjemplar;
      this.ejemplarForm.patchValue({
        libro: this.libros.find(l => l.idLibro === ejemplar.libro.idLibro),
        codigoInterno: ejemplar.codigoInterno,
        estadoEjemplar: ejemplar.estadoEjemplar,
        estado: ejemplar.estado
      });
    } else {
      this.isEditMode = false;
      this.currentEjemplarId = null;
      this.ejemplarForm.reset({ estadoEjemplar: 'Bueno', estado: 'Disponible' });
    }
    this.ejemplarModal.show();
  }

  onEjemplarSubmit() {
    if (this.ejemplarForm.invalid) return;
    const formData = this.ejemplarForm.value;
    if (this.isEditMode && this.currentEjemplarId) {
      this.ejemplarService.updateEjemplar(this.currentEjemplarId, formData).subscribe({
        next: () => { this.loadEjemplares(); this.ejemplarModal.hide(); },
        error: (err) => console.error('Error al actualizar ejemplar', err)
      });
    } else {
      this.ejemplarService.createEjemplar(formData).subscribe({
        next: () => { this.loadEjemplares(); this.ejemplarModal.hide(); },
        error: (err) => console.error('Error al crear ejemplar', err)
      });
    }
  }

  onDarDeBaja(ejemplar: any) {
    if (confirm(`¿Dar de baja: "${ejemplar.libro.titulo}"?`)) {
      this.ejemplarService.updateEjemplar(ejemplar.idEjemplar, { estado: 'Dado de baja' }).subscribe({
        next: () => this.loadEjemplares(),
        error: (err) => console.error('Error al dar de baja', err)
      });
    }
  }

  openLibroModal() {
    this.libroForm.reset();
    this.libroModal.show();
  }

  onLibroSubmit() { 
    if (this.libroForm.invalid) {
      this.libroForm.markAllAsTouched();
      return;
    }

    const formData = this.libroForm.value;
    const autorSeleccionado = formData.autor; 

    const libroPayload = {
      titulo: formData.titulo,
      editorial: formData.editorial,
      anioPublicacion: formData.anioPublicacion,
      isbn: formData.isbn,
      dewey: formData.dewey
    };

    
    this.libroService.createLibro(libroPayload).pipe(
      switchMap((nuevoLibro) => {
        console.log('Libro creado:', nuevoLibro);
        const relacionPayload = {
          autor: autorSeleccionado, 
          libro: nuevoLibro         
        };
        return this.autorLibroService.createAutorLibro(relacionPayload);
      })
    ).subscribe({
      next: (relacion) => {
        console.log('Relación Autor-Libro creada:', relacion);
        this.loadLibros(); 
        this.libroModal.hide(); 
      },
      error: (err) => console.error('Error al crear libro o relación', err)
    });
  }

  openAutorModal() { 
    this.autorForm.reset();
    this.autorModal.show();
  }

  onAutorSubmit() { 
    if (this.autorForm.invalid) {
      this.autorForm.markAllAsTouched();
      return;
    }

    this.autorService.createAutor(this.autorForm.value).subscribe({
      next: (nuevoAutor) => {
        console.log('Autor creado:', nuevoAutor);
        this.loadAutores(); 
        this.autorModal.hide(); 
        this.libroForm.patchValue({ autor: nuevoAutor });
      },
      error: (err) => console.error('Error al crear el autor', err)
    });
  }

  openDeweyModal() { 
    this.deweyForm.reset();
    this.deweyModal.show();
  }

  onDeweySubmit() { 
    if (this.deweyForm.invalid) {
      this.deweyForm.markAllAsTouched();
      return;
    }

    this.deweyService.createDewey(this.deweyForm.value).subscribe({
      next: (nuevoDewey) => {
        console.log('Categoría Dewey creada:', nuevoDewey);
        this.loadDeweys(); 
        this.deweyModal.hide(); 
        this.libroForm.patchValue({ dewey: nuevoDewey });
      },
      error: (err) => console.error('Error al crear Dewey', err)
    });
  }


  compareById(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (o1.idLibro !== undefined && o2.idLibro !== undefined) {
      return o1.idLibro === o2.idLibro;
    }
    if (o1.idAutor !== undefined && o2.idAutor !== undefined) {
      return o1.idAutor === o2.idAutor;
    }
    if (o1.idDewey !== undefined && o2.idDewey !== undefined) {
      return o1.idDewey === o2.idDewey;
    }
    
    return o1 === o2;
  }
}