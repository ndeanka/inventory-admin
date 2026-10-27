import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ItemApiService } from './item-api.service';
import { CreateInventoryItem, InventoryItem } from './item.model';

interface ItemsState {
  items: InventoryItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  searchQuery: string;
  sortColumn: keyof InventoryItem | null;
  sortDirection: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class ItemsStore {
  private readonly api = inject(ItemApiService);

  private readonly state = signal<ItemsState>({
    items: [],
    loading: false,
    saving: false,
    error: null,
    searchQuery: '',
    sortColumn: null,
    sortDirection: 'asc',
  });

  private readonly searchSubject = new Subject<string>();

  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly error = computed(() => this.state().error);
  readonly searchQuery = computed(() => this.state().searchQuery);
  readonly sortColumn = computed(() => this.state().sortColumn);
  readonly sortDirection = computed(() => this.state().sortDirection);

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

  constructor() {
    this.searchSubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((query) => {
      this.updateState({ searchQuery: query });
    });
  }

  private updateState(partial: Partial<ItemsState>): void {
    this.state.update((state) => ({ ...state, ...partial }));
  }

  setSearchQuery(query: string): void {
    this.searchSubject.next(query);
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
        this.updateState({
          error: 'Could not reach inventory-api. Is it running on :8080?',
          loading: false,
        });
      },
    });
  }

  createItem(payload: CreateInventoryItem): void {
    this.updateState({ saving: true, error: null });
    this.api.create(payload).subscribe({
      next: (created) => {
        this.state.update((state) => ({
          ...state,
          items: [created, ...state.items],
          saving: false,
        }));
      },
      error: (err: { error?: { message?: string }; status?: number }) => {
        this.updateState({
          error: err.error?.message ?? `Create failed (${err.status ?? 'network'})`,
          saving: false,
        });
      },
    });
  }

  updateItem(id: string, payload: CreateInventoryItem): void {
    this.updateState({ saving: true, error: null });
    this.api.update(id, payload).subscribe({
      next: (updated) => {
        this.state.update((state) => ({
          ...state,
          items: state.items.map((item) => (item.id === updated.id ? updated : item)),
          saving: false,
        }));
      },
      error: (err: { error?: { message?: string }; status?: number }) => {
        this.updateState({
          error: err.error?.message ?? 'Update failed',
          saving: false,
        });
      },
    });
  }

  deleteItem(id: string): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      error: () => {
        this.updateState({ error: 'Delete failed' });
      },
    });
  }

  clearError(): void {
    this.updateState({ error: null });
  }
}
