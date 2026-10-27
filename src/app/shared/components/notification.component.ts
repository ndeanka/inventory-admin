import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    <div class="notification-container" aria-live="polite">
      @for (notification of notifications(); track notification.id) {
        <div class="notification notification--{{ notification.type }}" role="status">
          <span>{{ notification.message }}</span>
          <button
            type="button"
            (click)="service.remove(notification.id)"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 400px;
      }

      .notification {
        padding: 1rem;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .notification button {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
      }

      .notification--success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .notification--error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .notification--info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  readonly service = inject(NotificationService);
  readonly notifications = this.service.notifications;
}
