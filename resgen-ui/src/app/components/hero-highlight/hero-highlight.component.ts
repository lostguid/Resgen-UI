import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-hero-highlight',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full min-h-[30rem] flex items-center justify-center group overflow-hidden bg-white dark:bg-black">
      <div class="absolute inset-0 pointer-events-none opacity-70 dark:opacity-0"
        [style.background-image]="'radial-gradient(circle, rgb(212 212 212) 1px, transparent 1px)'"
        [style.background-size]="'16px 16px'"></div>
      <div class="absolute inset-0 pointer-events-none opacity-0 dark:opacity-70"
        [style.background-image]="'radial-gradient(circle, rgb(38 38 38) 1px, transparent 1px)'"
        [style.background-size]="'16px 16px'"></div>
      <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        [style.background-image]="'radial-gradient(circle, rgb(99 102 241) 1px, transparent 1px)'"
        [style.background-size]="'16px 16px'"
        [style.-webkit-mask-image]="maskImage"
        [style.mask-image]="maskImage"></div>
      <div class="relative z-20 w-full">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class HeroHighlightComponent {
  mx = 0;
  my = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  get maskImage(): string {
    return `radial-gradient(200px circle at ${this.mx}px ${this.my}px, black 0%, transparent 100%)`;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.mx = event.clientX - rect.left;
    this.my = event.clientY - rect.top;
  }
}

@Component({
  selector: 'app-highlight',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="app-highlight" [ngClass]="className"><ng-content></ng-content></span>`,
  styles: [`
    @keyframes app-highlight-expand {
      from { background-size: 0% 100%; }
      to { background-size: 100% 100%; }
    }
    .app-highlight {
      position: relative;
      display: inline-block;
      padding: 0 0.25rem 0.125rem;
      border-radius: 0.5rem;
      background-image: linear-gradient(to right, rgb(165 180 252), rgb(216 180 254));
      background-repeat: no-repeat;
      background-position: left center;
      background-size: 0% 100%;
      animation: app-highlight-expand 2s linear 0.5s forwards;
    }
    :host-context(.dark) .app-highlight {
      background-image: linear-gradient(to right, rgb(99 102 241), rgb(168 85 247));
    }
  `],
})
export class HighlightComponent {
  @Input() className = '';
}
