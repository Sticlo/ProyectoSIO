import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  formData = signal<RegisterData>({
    name: '',
    email: '',
    password: ''
  });
  
  confirmPassword = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  
  constructor(private authService: AuthService) {}
  
  onSubmit(): void {
    this.errorMessage.set('');
    
    // Validaciones
    if (this.formData().password !== this.confirmPassword()) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }
    
    if (this.formData().password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    this.isLoading.set(true);
    
    const result = this.authService.register(this.formData());
    
    this.isLoading.set(false);
    
    if (!result.success) {
      this.errorMessage.set(result.message);
    }
  }
  
  updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
  }
  
  updateEmail(value: string): void {
    this.formData.update(d => ({ ...d, email: value }));
  }
  
  updatePassword(value: string): void {
    this.formData.update(d => ({ ...d, password: value }));
  }
  
  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
  
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }
}
