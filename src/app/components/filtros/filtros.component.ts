import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DeweyService } from '../../services/dewey.service';
import { LibroService } from '../../services/libro.service'; 
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.css']
})
export class FiltrosComponent implements OnInit {

  @Output() onSearch = new EventEmitter<any>();

  filterForm: FormGroup;
  deweyCategorias: any[] = []; 
  editoriales: string[] = []; 

  constructor(
    private fb: FormBuilder,
    private deweyService: DeweyService,
    private libroService: LibroService
  ) {
    this.filterForm = this.fb.group({
      titulo: [''],
      autor: [''],
      deweyId: [null],
      editorial: [null], 
      estado: [null]     
    });
  }

  ngOnInit() {
    this.loadDeweys();
    this.loadEditoriales();

    this.filterForm.valueChanges.pipe(
      debounceTime(350), 
      distinctUntilChanged() 
    ).subscribe(values => {
      const cleanFilters: any = {};
      if (values.titulo) cleanFilters.titulo = values.titulo;
      if (values.autor) cleanFilters.autor = values.autor;
      if (values.deweyId) cleanFilters.deweyId = values.deweyId; 
      if (values.editorial) cleanFilters.editorial = values.editorial; 
      if (values.estado) cleanFilters.estado = values.estado;       
      
      this.onSearch.emit(cleanFilters);
    });
  }

  loadDeweys() {
    this.deweyService.getDeweys().subscribe({
      next: (data) => this.deweyCategorias = data,
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  loadEditoriales() {
    this.libroService.getEditoriales().subscribe({
      next: (data) => this.editoriales = data,
      error: (err) => console.error('Error al cargar editoriales', err)
    });
  }
}