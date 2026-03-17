import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren, QueryList, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TestimonialCardComponent, Testimonial } from '../../shared/components/testimonial-card/testimonial-card.component';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TestimonialCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly ngZone = inject(NgZone);
  private observer!: IntersectionObserver;

  @ViewChildren('animateOnScroll') animatedElements!: QueryList<ElementRef>;

  // Featured products from store
  featuredProducts = computed(() =>
    this.productService.allProducts().slice(0, 6)
  );

  // Animated counters
  counters = signal([
    { target: 10, current: 0, suffix: '+', label: 'Proyectos Entregados', icon: 'package' },
    { target: 5, current: 0, suffix: '', label: 'Profesionales en el Equipo', icon: 'users' },
    { target: 100, current: 0, suffix: '%', label: 'Compromiso Total', icon: 'shield' },
    { target: 5, current: 0, suffix: '/5', label: 'Satisfacción Clientes', icon: 'star', decimals: 1 }
  ]);
  countersAnimated = false;

  // Testimonios de clientes reales
  testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Operadores Asociados Bogotá',
      role: 'Empresa de Maquinaria',
      company: 'Operadores Asociados',
      content: 'SIO nos creó un sitio web profesional que refleja la seriedad de nuestra empresa. Ahora nuestros clientes pueden ver nuestro catálogo de maquinaria y contactarnos fácilmente. Excelente trabajo.',
      rating: 5
    },
    {
      id: '2',
      name: 'Sempiternox',
      role: 'Empresa de Ropa',
      company: 'Sempiternox',
      content: 'Gracias a SIO nuestra tienda en línea luce increíble y las ventas se han disparado. El equipo entendió perfectamente nuestra marca y la plasmo al sitio de manera impecable.',
      rating: 5
    },
    {
      id: '3',
      name: 'Fresquitox',
      role: 'Empresa de Granizados',
      company: 'Fresquitox',
      content: 'Queríamos una página donde nuestros clientes pudieran ver nuestros productos y hacer pedidos. SIO lo hizo realidad con un diseño fresco y moderno que encanta a todos.',
      rating: 5
    }
  ];

  // Process steps
  processSteps = [
    {
      number: '01',
      title: 'Consultoría',
      description: 'Analizamos tu negocio, entendemos tus necesidades y diseñamos la estrategia digital perfecta.',
      icon: 'lightbulb'
    },
    {
      number: '02',
      title: 'Diseño & Desarrollo',
      description: 'Creamos tu plataforma con tecnología de vanguardia, diseño premium y experiencia de usuario impecable.',
      icon: 'code'
    },
    {
      number: '03',
      title: 'Integración',
      description: 'Conectamos WhatsApp, pasarelas de pago, inventario y todos los sistemas que necesitas.',
      icon: 'link'
    },
    {
      number: '04',
      title: 'Lanzamiento & Soporte',
      description: 'Publicamos tu plataforma y te acompañamos con soporte técnico continuo 24/7.',
      icon: 'rocket'
    }
  ];

  // Stats for about section
  stats = [
    { value: '10+', label: 'Proyectos Entregados' },
    { value: '100%', label: 'Compromiso' },
    { value: '5', label: 'Profesionales' },
    { value: 'Bogotá', label: 'Colombia' }
  ];

  // Technologies
  technologies = [
    'Angular', 'Node.js', 'MongoDB', 'TypeScript', 'WhatsApp API',
    'Cloud Services', 'REST APIs', 'Real-time Analytics'
  ];

  // Typed text animation
  typedTexts = ['tu sitio web', 'tu negocio', 'tus ventas', 'tu presencia digital'];
  currentTypedIndex = signal(0);
  displayedText = signal('');
  isDeleting = signal(false);
  private typingInterval: any;

  // Parallax properties
  scrollY = signal(0);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollY.set(window.pageYOffset || document.documentElement.scrollTop || 0);
  }

  ngOnInit(): void {
    this.startTypingAnimation();
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  ngOnDestroy(): void {
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.observer) this.observer.disconnect();
  }

  private startTypingAnimation(): void {
    let charIndex = 0;
    let currentWordIndex = 0;
    let deleting = false;
    let pauseCount = 0;

    // Run outside Angular zone to avoid unnecessary change detection on every tick
    this.ngZone.runOutsideAngular(() => {
      this.typingInterval = setInterval(() => {
        const currentWord = this.typedTexts[currentWordIndex];

        if (pauseCount > 0) {
          pauseCount--;
          return;
        }

        if (!deleting) {
          charIndex++;
          this.displayedText.set(currentWord.substring(0, charIndex));

          if (charIndex === currentWord.length) {
            pauseCount = 20;
            deleting = true;
          }
        } else {
          charIndex--;
          this.displayedText.set(currentWord.substring(0, charIndex));

          if (charIndex === 0) {
            deleting = false;
            currentWordIndex = (currentWordIndex + 1) % this.typedTexts.length;
            this.currentTypedIndex.set(currentWordIndex);
            pauseCount = 5;
          }
        }
      }, 80);
    });
  }

  private setupScrollAnimations(): void {
    // Run IntersectionObserver outside Angular zone for performance
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;

              // Use requestAnimationFrame to batch DOM writes
              requestAnimationFrame(() => {
                el.classList.add('animate-in');

                // Stagger children if marked
                if (el.hasAttribute('data-stagger')) {
                  const selector = el.getAttribute('data-stagger') || '.stagger-item';
                  const children = el.querySelectorAll(selector);
                  children.forEach((child, index) => {
                    const childEl = child as HTMLElement;
                    childEl.style.transitionDelay = `${index * 120}ms`;
                    childEl.classList.add('animate-in');
                  });
                }

                // Animate counters when stats section is visible
                if (el.classList.contains('stats-counter-section') && !this.countersAnimated) {
                  this.countersAnimated = true;
                  this.ngZone.run(() => this.animateCounters());
                }

                // Reveal progress bars or lines
                if (el.querySelector('.reveal-line')) {
                  el.querySelectorAll('.reveal-line').forEach((line, i) => {
                    (line as HTMLElement).style.transitionDelay = `${i * 200}ms`;
                    line.classList.add('revealed');
                  });
                }
              });

              // Stop observing after animation triggers (one-shot)
              this.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
      );

      setTimeout(() => {
        this.animatedElements?.forEach((el) => {
          this.observer.observe(el.nativeElement);
        });
      }, 100);
    });
  }

  private animateCounters(): void {
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      this.counters.update(counters =>
        counters.map(c => ({
          ...c,
          current: c.decimals
            ? Math.round(c.target * eased * 10) / 10
            : Math.round(c.target * eased)
        }))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  formatCounter(counter: { current: number; suffix: string; decimals?: number }): string {
    if (counter.decimals) {
      return counter.current.toFixed(counter.decimals) + counter.suffix;
    }
    return counter.current.toLocaleString() + counter.suffix;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
}
