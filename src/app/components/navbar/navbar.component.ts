import { Component, Output, EventEmitter, OnInit } from '@angular/core'; 
import { Router } from '@angular/router';        
import { AuthService } from '../../auth.service'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit { 

  @Output() onCargarHistorial = new EventEmitter<void>();
  
  isAdmin: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }
  
  ngOnInit() {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
  }

  logout() {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }

  cargarHistorial() {
    this.onCargarHistorial.emit();
  }

  irAlPanel() {
    this.router.navigate(['/admin/inicio']);
  }
}