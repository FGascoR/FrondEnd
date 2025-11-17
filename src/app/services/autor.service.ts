import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutorService {

  private apiUrl = 'http://localhost:8080/api/autores'; 

  constructor(private http: HttpClient) { }

  getAutores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createAutor(autor: any): Observable<any> {
    return this.http.post(this.apiUrl, autor);
  }
}