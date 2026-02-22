import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
}

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="testimonial-card">
      <div class="testimonial-rating">
        @for (star of [1,2,3,4,5]; track star) {
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            [attr.fill]="star <= testimonial.rating ? '#fbbf24' : 'none'"
            stroke="#fbbf24" 
            stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        }
      </div>
      <p class="testimonial-content">"{{ testimonial.content }}"</p>
      <div class="testimonial-author">
        <div class="author-avatar">
          @if (testimonial.avatar) {
            <img [src]="testimonial.avatar" [alt]="testimonial.name">
          } @else {
            <div class="avatar-placeholder">
              {{ getInitials(testimonial.name) }}
            </div>
          }
        </div>
        <div class="author-info">
          <h4 class="author-name">{{ testimonial.name }}</h4>
          <p class="author-role">{{ testimonial.role }} en {{ testimonial.company }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .testimonial-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      
      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }
    }
    
    .testimonial-rating {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
    }
    
    .testimonial-content {
      font-size: 1rem;
      line-height: 1.8;
      color: #333;
      margin-bottom: 2rem;
      flex-grow: 1;
      font-style: italic;
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .author-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 1.125rem;
      }
    }
    
    .author-info {
      .author-name {
        font-size: 1rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 0.25rem;
      }
      
      .author-role {
        font-size: 0.875rem;
        color: #666;
        margin: 0;
      }
    }
  `]
})
export class TestimonialCardComponent {
  @Input() testimonial!: Testimonial;
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
