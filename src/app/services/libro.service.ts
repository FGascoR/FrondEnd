import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibroService {

  private apiUrl = 'http://localhost:8080/api/libros'; 

  constructor(private http: HttpClient) { }

  getLibros(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  createLibro(libro: any): Observable<any> {
    return this.http.post(this.apiUrl, libro);
  }
}