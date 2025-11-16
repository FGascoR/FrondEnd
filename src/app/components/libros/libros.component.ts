import { Component } from '@angular/core';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html',
})
export class LibrosComponent {
  libros = [
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
    { titulo: 'Título', autor: 'Autor' },
  ];
  page = 1;
  pageSize = 12; // libros por página

  get librosPaginados() {
    const start = (this.page - 1) * this.pageSize;
    return this.libros.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.libros.length / this.pageSize);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages()) {
      this.page = nuevaPagina;
    }
  }

  ngOnInit() {}
}

