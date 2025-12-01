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
  isLoggedIn: boolean = false;
  showWelcome: boolean = false;
  userName: string | null = null;

  constructor(
    private router: Router,
    public authService: AuthService 
  ) { }
  
  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
      this.userName = this.authService.getUserName();
      
      const yaMostroBanner = sessionStorage.getItem('welcomeBannerShown');

      if (!yaMostroBanner) {
        this.showWelcome = true;

        sessionStorage.setItem('welcomeBannerShown', 'true');

        setTimeout(() => {
          this.showWelcome = false;
        }, 500); 
      } else {
        this.showWelcome = false;
      }
    }
  }

  logout() {
    this.authService.logout(); 
    sessionStorage.removeItem('welcomeBannerShown');
    
    this.router.navigate(['/login']); 
  }

  cargarHistorial() {
    this.onCargarHistorial.emit();
  }

  irAlPanel() {
    this.router.navigate(['/paneladmin/inicio']);
  }
}