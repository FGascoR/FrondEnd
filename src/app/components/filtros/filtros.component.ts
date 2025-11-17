import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PalabraClaveService } from '../../services/palabra-clave.service'; 
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.css']
})
export class FiltrosComponent implements OnInit {

  @Output() onSearch = new EventEmitter<any>();

  filterForm: FormGroup;
  palabrasClave: any[] = [];

  constructor(
    private fb: FormBuilder,
    private palabraClaveService: PalabraClaveService
  ) {
    this.filterForm = this.fb.group({
      titulo: [''],
      autor: [''],
      palabraClaveId: [null] 
    });
  }

  ngOnInit() {
    this.loadPalabrasClave();

    this.filterForm.valueChanges.pipe(
      debounceTime(350), 
      distinctUntilChanged() 
    ).subscribe(values => {
      const cleanFilters: any = {};
      if (values.titulo) cleanFilters.titulo = values.titulo;
      if (values.autor) cleanFilters.autor = values.autor;
      if (values.palabraClaveId) cleanFilters.palabraClaveId = values.palabraClaveId;
      
      this.onSearch.emit(cleanFilters);
    });
  }

  loadPalabrasClave() {
    this.palabraClaveService.getPalabrasClave().subscribe({
      next: (data) => this.palabrasClave = data,
      error: (err) => console.error('Error al cargar palabras clave', err)
    });
  }
}