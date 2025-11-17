import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { jwtDecode } from 'jwt-decode'; 

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const roles = decodedToken.roles.map((role: any) => role.authority);

      if (roles.includes('ROLE_ADMIN')) {
        return true; 
      } else {
        this.router.navigate(['/biblioteca']);
        return false;
      }
    } catch (error) {
      console.error("Error al decodificar el token", error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
