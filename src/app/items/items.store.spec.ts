import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from '../core/services/notification.service';
import { InventoryItem } from './item.model';
import { ItemsStore } from './items.store';

const base = 'http://localhost:8080/api/v1/items';

function item(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: '1',
    sku: 'SKU-1',
    name: 'Widget',
    quantityOnHand: 4,
    unitPrice: 12.5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('ItemsStore', () => {
  let store: ItemsStore;
  let http: HttpTestingController;
  let notifications: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ItemsStore);
    http = TestBed.inject(HttpTestingController);
    notifications = TestBed.inject(NotificationService);
    notifications.clear();
  });

  afterEach(() => {
    http.verify();
  });

  it('loads items and clears the loading flag', () => {
    store.loadItems();
    expect(store.loading()).toBe(true);

    const request = http.expectOne(base);
    expect(request.request.method).toBe('GET');
    request.flush([item()]);

    expect(store.loading()).toBe(false);
    expect(store.items()).toEqual([item()]);
    expect(store.error()).toBeNull();
  });

  it('records a load failure and notifies the user', () => {
    store.loadItems();
    http.expectOne(base).flush('down', { status: 0, statusText: 'Unknown Error' });

    expect(store.loading()).toBe(false);
    expect(store.error()).toContain('inventory-api');
    expect(notifications.notifications()[0]?.type).toBe('error');
  });

  it('prepends a created item and notifies on success', () => {
    const payload = { sku: 'NEW', name: 'New item', quantityOnHand: 1, unitPrice: 3 };
    let emitted = false;

    store.createItem(payload).subscribe(() => {
      emitted = true;
    });

    const request = http.expectOne(base);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(item({ id: '2', ...payload }));

    expect(emitted).toBe(true);
    expect(store.items()[0]?.sku).toBe('NEW');
    expect(store.saving()).toBe(false);
    expect(notifications.notifications()[0]?.message).toBe('Created NEW');
  });

  it('keeps the form path quiet when create fails', () => {
    let emitted = false;
    store.createItem({ sku: 'X', name: 'X', quantityOnHand: 0, unitPrice: 0 }).subscribe(() => {
      emitted = true;
    });

    http
      .expectOne(base)
      .flush({ message: 'SKU already exists' }, { status: 409, statusText: 'Conflict' });

    expect(emitted).toBe(false);
    expect(store.items()).toEqual([]);
    expect(store.error()).toBe('SKU already exists');
    expect(store.saving()).toBe(false);
  });

  it('replaces an item on update', () => {
    store.loadItems();
    http.expectOne(base).flush([item()]);

    const payload = { sku: 'SKU-1', name: 'Renamed', quantityOnHand: 8, unitPrice: 12.5 };
    store.updateItem('1', payload).subscribe();
    http.expectOne(`${base}/1`).flush(item({ name: 'Renamed', quantityOnHand: 8 }));

    expect(store.items()[0]?.name).toBe('Renamed');
    expect(store.items()[0]?.quantityOnHand).toBe(8);
  });

  it('removes an item on delete', () => {
    store.loadItems();
    http.expectOne(base).flush([item(), item({ id: '2', sku: 'SKU-2' })]);

    store.deleteItem('1').subscribe();
    const request = http.expectOne(`${base}/1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(store.items().map((row) => row.id)).toEqual(['2']);
    expect(notifications.notifications().at(-1)?.message).toBe('Item deleted');
  });

  it('filters by sku or name and sorts the visible rows', fakeAsync(() => {
    store.loadItems();
    http
      .expectOne(base)
      .flush([
        item({ id: '1', sku: 'B', name: 'Bolt', unitPrice: 2 }),
        item({ id: '2', sku: 'A', name: 'Anchor', unitPrice: 9 }),
      ]);

    store.setSearchQuery('anc');
    tick(299);
    expect(store.filteredAndSortedItems().length).toBe(2);
    tick(1);
    expect(store.filteredAndSortedItems().map((row) => row.sku)).toEqual(['A']);

    store.setSearchQuery('');
    tick(300);
    store.toggleSort('unitPrice');
    expect(store.filteredAndSortedItems().map((row) => row.sku)).toEqual(['B', 'A']);
    store.toggleSort('unitPrice');
    expect(store.sortDirection()).toBe('desc');
    expect(store.filteredAndSortedItems().map((row) => row.sku)).toEqual(['A', 'B']);
  }));
});
