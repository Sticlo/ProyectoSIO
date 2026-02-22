import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  credentials = signal<LoginCredentials>({
    email: '',
    password: ''
  });
  
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  
  constructor(private authService: AuthService) {}
  
  onSubmit(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);
    
    const result = this.authService.login(this.credentials());
    
    this.isLoading.set(false);
    
    if (!result.success) {
      this.errorMessage.set(result.message);
    }
  }
  
  updateEmail(value: string): void {
    this.credentials.update(c => ({ ...c, email: value }));
  }
  
  updatePassword(value: string): void {
    this.credentials.update(c => ({ ...c, password: value }));
  }
  
  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}
