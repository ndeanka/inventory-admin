import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    service.clear();
  });

  it('adds a success notification', () => {
    service.success('Saved');
    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0]).toEqual(
      jasmine.objectContaining({ type: 'success', message: 'Saved' })
    );
  });

  it('removes a notification by id', () => {
    service.show('Keep me', 'info', 0);
    const id = service.notifications()[0].id;
    service.remove(id);
    expect(service.notifications()).toEqual([]);
  });

  it('dismisses a notification after the duration', fakeAsync(() => {
    service.show('Soon gone', 'error', 1000);
    expect(service.notifications().length).toBe(1);
    tick(1000);
    expect(service.notifications()).toEqual([]);
  }));
});
