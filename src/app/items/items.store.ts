import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, debounceTime, tap } from 'rxjs/operators';
import { NotificationService } from '../core/services/notification.service';
import { apiErrorMessage } from './api-error';
import { ItemApiService } from './item-api.service';
import { CreateInventoryItem, InventoryItem, UpdateInventoryItem } from './item.model';

interface ItemsState {
  items: InventoryItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  searchQuery: string;
  sortColumn: keyof InventoryItem | null;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ItemsStore {
  private readonly api = inject(ItemApiService);
  private readonly notifications = inject(NotificationService);

  private readonly state = signal<ItemsState>({
    items: [],
    loading: false,
    saving: false,
    error: null,
    searchQuery: '',
    sortColumn: null,
    sortDirection: 'asc',
    page: 1,
    pageSize: 10,
  });

  private readonly searchSubject = new Subject<string>();

  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly error = computed(() => this.state().error);
  readonly searchQuery = computed(() => this.state().searchQuery);
  readonly sortColumn = computed(() => this.state().sortColumn);
  readonly sortDirection = computed(() => this.state().sortDirection);
  readonly pageSize = computed(() => this.state().pageSize);

  readonly filteredAndSortedItems = computed(() => {
    let result = this.items();
    const query = this.searchQuery().toLowerCase();

    if (query) {
      result = result.filter(
        (item) => item.sku.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)
      );
    }

    const column = this.sortColumn();
    if (column) {
      const direction = this.sortDirection();
      result = [...result].sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  });

  readonly totalCount = computed(() => this.filteredAndSortedItems().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));
  readonly currentPage = computed(() => Math.min(this.state().page, this.totalPages()));
  readonly pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredAndSortedItems().slice(start, start + this.pageSize());
  });

  constructor() {
    this.searchSubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((query) => {
      this.updateState({ searchQuery: query, page: 1 });
    });
  }

  private updateState(partial: Partial<ItemsState>): void {
    this.state.update((state) => ({ ...state, ...partial }));
  }

  setSearchQuery(query: string): void {
    this.searchSubject.next(query);
  }

  setPage(page: number): void {
    const next = Math.min(Math.max(1, Math.trunc(page)), this.totalPages());
    this.updateState({ page: next });
  }

  setPageSize(pageSize: number): void {
    if (!Number.isFinite(pageSize) || pageSize < 1) {
      return;
    }
    this.updateState({ pageSize: Math.trunc(pageSize), page: 1 });
  }

  toggleSort(column: keyof InventoryItem): void {
    const currentColumn = this.sortColumn();
    if (currentColumn === column) {
      this.updateState({
        sortDirection: this.sortDirection() === 'asc' ? 'desc' : 'asc',
      });
    } else {
      this.updateState({ sortColumn: column, sortDirection: 'asc' });
    }
  }

  loadItems(): void {
    this.updateState({ loading: true, error: null });
    this.api.list().subscribe({
      next: (items) => {
        this.updateState({ items, loading: false });
      },
      error: () => {
        const message = 'Could not reach inventory-api. Is it running on :8080?';
        this.updateState({ error: message, loading: false });
        this.notifications.error(message);
      },
    });
  }

  createItem(payload: CreateInventoryItem): Observable<InventoryItem> {
    this.updateState({ saving: true, error: null });
    return this.api.create(payload).pipe(
      tap((created) => {
        this.state.update((state) => ({
          ...state,
          items: [created, ...state.items],
          saving: false,
          page: 1,
        }));
        this.notifications.success(`Created ${created.sku}`);
      }),
      catchError((err: { error?: { message?: string; details?: string[] }; status?: number }) => {
        const message = apiErrorMessage(err, `Create failed (${err.status ?? 'network'})`);
        this.updateState({ error: message, saving: false });
        this.notifications.error(message);
        return EMPTY;
      })
    );
  }

  updateItem(id: string, payload: UpdateInventoryItem): Observable<InventoryItem> {
    this.updateState({ saving: true, error: null });
    return this.api.update(id, payload).pipe(
      tap((updated) => {
        this.state.update((state) => ({
          ...state,
          items: state.items.map((item) => (item.id === updated.id ? updated : item)),
          saving: false,
        }));
        this.notifications.success(`Updated ${updated.sku}`);
      }),
      catchError((err: { error?: { message?: string; details?: string[] }; status?: number }) => {
        const message = apiErrorMessage(err, 'Update failed');
        this.updateState({ error: message, saving: false });
        this.notifications.error(message);
        return EMPTY;
      })
    );
  }

  deleteItem(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        this.state.update((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }));
        this.notifications.success('Item deleted');
      }),
      catchError(() => {
        const message = 'Delete failed';
        this.updateState({ error: message });
        this.notifications.error(message);
        return EMPTY;
      })
    );
  }

  clearError(): void {
    this.updateState({ error: null });
  }
}
