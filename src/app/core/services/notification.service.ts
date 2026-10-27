import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<AppNotification[]>([]);
  private idCounter = 0;

  show(message: string, type: AppNotification['type'] = 'info', duration = 5000): void {
    const notification: AppNotification = {
      id: this.idCounter++,
      type,
      message,
    };

    this.notifications.update((items) => [...items, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  remove(id: number): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
