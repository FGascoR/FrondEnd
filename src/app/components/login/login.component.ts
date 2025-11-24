import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit { 
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], 
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      console.log('Usuario ya logueado, redirigiendo...');
      if (this.authService.hasRole('ROLE_ADMIN')) {
        this.router.navigate(['/paneladmin/inicio']);
      } else {
        this.router.navigate(['/biblioteca']);
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = {
      username: this.loginForm.value.email, 
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.role === 'admin') {
          this.router.navigate(['/paneladmin/inicio']);
        } else {
          this.router.navigate(['/biblioteca']);
        }
      },
      error: (err) => {
        console.error('Error en el login', err);
        alert('Email o contraseña incorrectos.');
      }
    });
  }
}