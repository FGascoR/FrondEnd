import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.authService.TOKEN_KEY) {
        
        if (event.newValue === null) {
          console.log('Sesión cerrada desde otra pestaña. Redirigiendo al login...');
          this.router.navigate(['/login']);
        } else {
          console.log('Token cambiado en otra pestaña. Recargando para validar permisos...');
            window.location.reload();
        }
      }
    });
  }
}