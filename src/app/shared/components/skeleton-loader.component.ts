import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [NgStyle],
  template: `<div class="skeleton" [ngStyle]="{ width: width, height: height }"></div>`,
  styles: [
    `
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
      }

      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  @Input() width = '100%';
  @Input() height = '20px';
}
