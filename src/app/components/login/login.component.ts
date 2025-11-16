import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false; // 👈 propiedad agregada

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() { // 👈 método agregado
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('✅ Login exitoso:', this.loginForm.value);
    } else {
      console.log('❌ Formulario inválido');
      this.loginForm.markAllAsTouched();
    }
  }
}


