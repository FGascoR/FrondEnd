import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../services/libro.service'; 

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.component.html',
})
export class BibliotecaComponent implements OnInit {

  libros: any[] = []; 
  page = 1;
  pageSize = 12; 

  constructor(private libroService: LibroService) { }

  ngOnInit() {
    this.cargarLibros(); 
  }


  cargarLibros(filtros: any = {}) {
    this.libroService.getLibros(filtros).subscribe({
      next: (data) => {
        this.libros = data; 
        console.log('Libros cargados:', this.libros);
        this.page = 1;
      },
      error: (err) => {
        console.error('Error al cargar libros:', err);
        alert('Error al cargar los libros. Revisa la consola.');
      }
    });
  }

  get librosPaginados() {
    const start = (this.page - 1) * this.pageSize;
    return this.libros.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.libros.length / this.pageSize);
  }

  get paginas(): number[] {
    return Array(this.totalPages()).fill(0).map((x, i) => i + 1);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages()) {
      this.page = nuevaPagina;
    }
  }

  getAutor(libro: any): string {
    if (!libro.autorLibros || libro.autorLibros.length === 0) {
      return 'Autor Desconocido';
    }
    const autor = libro.autorLibros[0].autor;
    return `${autor.nombres} ${autor.apellidos}`;
  }
}