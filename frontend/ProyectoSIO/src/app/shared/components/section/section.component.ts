import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [class]="sectionClasses" [style.background-color]="backgroundColor">
      <div [class.container]="!fullWidth">
        @if (title || subtitle) {
          <div class="section-header">
            @if (title) {
              <h2 class="section-title">{{ title }}</h2>
            }
            @if (subtitle) {
              <p class="section-subtitle">{{ subtitle }}</p>
            }
          </div>
        }
        <div [class]="contentClass">
          <ng-content></ng-content>
        </div>
      </div>
    </section>
  `,
  styles: [`
    section {
      padding: 6rem 0;
      
      &.compact {
        padding: 4rem 0;
      }
      
      &.spacious {
        padding: 8rem 0;
      }
    }
    
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    
    .section-title {
      font-size: 2.5rem;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 1rem;
      font-family: 'Georgia', serif;
      
      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }
    
    .section-subtitle {
      font-size: 1.125rem;
      color: #666;
      margin: 0;
    }
  `]
})
export class SectionComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() backgroundColor?: string;
  @Input() spacing: 'compact' | 'normal' | 'spacious' = 'normal';
  @Input() fullWidth = false;
  @Input() contentClass = '';
  
  get sectionClasses(): string {
    return this.spacing !== 'normal' ? this.spacing : '';
  }
}
