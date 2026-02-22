import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="buttonClasses"
      [type]="type"
      [disabled]="disabled">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      padding: 1rem 2.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;
      border-radius: 4px;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &:not(:disabled):active {
        transform: translateY(0);
      }
    }
    
    .btn-primary {
      background-color: #1a1a1a;
      color: white;
      
      &:hover {
        background-color: #333;
      }
    }
    
    .btn-secondary {
      background-color: white;
      color: #1a1a1a;
      border: 2px solid #1a1a1a;
      
      &:hover {
        background-color: #1a1a1a;
        color: white;
      }
    }
    
    .btn-outline {
      background-color: transparent;
      color: #1a1a1a;
      border: 2px solid #1a1a1a;
      
      &:hover {
        background-color: #1a1a1a;
        color: white;
      }
    }
    
    .btn-light {
      background-color: white;
      color: #1a1a1a;
      
      &:hover {
        background-color: #f0f0f0;
      }
    }
    
    .btn-large {
      padding: 1.25rem 3rem;
      font-size: 1.1rem;
    }
    
    .btn-small {
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'light' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  
  get buttonClasses(): string {
    const classes = [`btn-${this.variant}`];
    if (this.size !== 'medium') {
      classes.push(`btn-${this.size}`);
    }
    return classes.join(' ');
  }
}
