import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibroService {

  private apiUrl = 'http://localhost:8080/api/libros';

  constructor(private http: HttpClient) { }

  getLibros(params?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.titulo) {
        httpParams = httpParams.set('titulo', params.titulo);
      }
      if (params.autor) {
        httpParams = httpParams.set('autor', params.autor);
      }
      if (params.palabraClaveId) {
        httpParams = httpParams.set('palabraClaveId', params.palabraClaveId);
      }
    }

    return this.http.get<any[]>(`${this.apiUrl}/search`, { params: httpParams });
  }

  createLibro(libro: any): Observable<any> {
    return this.http.post(this.apiUrl, libro);
  }
}