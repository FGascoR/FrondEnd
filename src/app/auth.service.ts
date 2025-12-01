import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth/login';
  public readonly TOKEN_KEY = 'jwt_token'; 

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(this.apiUrl, credentials).pipe(
      tap((response: any) => { 
        if (response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  getRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const roles = decodedToken.roles.map((role: any) => role.authority);
      return roles;
    } catch (error) {
      console.error("Error al decodificar el token", error);
      return [];
    }
  }

  
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.nombreCompleto || null;
    } catch (error) {
      console.error("Error al obtener nombre", error);
      return null;
    }
  }
}