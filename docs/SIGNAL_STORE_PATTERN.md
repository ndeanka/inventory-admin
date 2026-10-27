# Signal Store Pattern - Implementation Guide

## Overview

This document explains the signal-based store pattern implemented for state management in the Inventory Admin application.

## What is a Signal Store?

A Signal Store is a lightweight state management pattern using Angular Signals. It provides:
- Centralized state management
- Reactive updates using computed signals
- Clean separation between UI and business logic
- No external dependencies (pure Angular)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Component                          │
│  - Injects Store                                        │
│  - Handles UI interactions                              │
│  - Delegates state changes to Store                     │
│  - Reads state via computed signals                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ inject(ItemsStore)
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    ItemsStore                           │
│  - Manages state (private signal)                       │
│  - Exposes computed signals (public)                    │
│  - Handles API calls                                    │
│  - Updates state immutably                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ inject(ItemApiService)
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  ItemApiService                         │
│  - HTTP calls to backend                                │
│  - Returns Observables                                  │
└─────────────────────────────────────────────────────────┘
```

## Implementation

### 1. State Interface

Define the shape of your state:

```typescript
interface ItemsState {
  items: InventoryItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  searchQuery: string;
  sortColumn: keyof InventoryItem | null;
  sortDirection: 'asc' | 'desc';
}
```

### 2. Store Service

Create a singleton service with `providedIn: 'root'`:

```typescript
@Injectable({ providedIn: 'root' })
export class ItemsStore {
  // Private state signal - only store can modify
  private readonly state = signal<ItemsState>({...});
  
  // Public computed signals - components read these
  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);
  
  // Derived/computed state
  readonly filteredItems = computed(() => {
    // Complex filtering/sorting logic
  });
  
  // Private helper to update state immutably
  private updateState(partial: Partial<ItemsState>): void {
    this.state.update(state => ({ ...state, ...partial }));
  }
  
  // Public methods to trigger state changes
  loadItems(): void {
    this.updateState({ loading: true });
    this.api.list().subscribe({
      next: items => this.updateState({ items, loading: false }),
      error: () => this.updateState({ error: '...', loading: false })
    });
  }
}
```

### 3. Component Usage

Component becomes thin, focused on UI:

```typescript
export class ItemsPageComponent {
  readonly store = inject(ItemsStore);
  
  ngOnInit(): void {
    this.store.loadItems();
  }
  
  onAction(): void {
    this.store.performAction();
  }
}
```

Template accesses store directly:

```html
@if (store.loading()) {
  <p>Loading...</p>
}

@for (item of store.filteredItems(); track item.id) {
  <div>{{ item.name }}</div>
}
```

## Key Principles

### 1. Single Source of Truth
- All state lives in the store
- Components never duplicate state
- One place to look for state logic

### 2. Immutable Updates
```typescript
// ✅ Good - immutable
this.state.update(state => ({ ...state, items: [...items] }));

// ❌ Bad - mutating
this.state().items.push(newItem);
```

### 3. Computed Signals for Derived State
```typescript
// Automatically recalculates when dependencies change
readonly filteredItems = computed(() => {
  return this.items().filter(item => 
    item.name.includes(this.searchQuery())
  );
});
```

### 4. Private State, Public Computed
```typescript
// Private - only store can modify
private readonly state = signal<ItemsState>({...});

// Public - components can read
readonly items = computed(() => this.state().items);
```

## Benefits

### 1. Testability
```typescript
// Easy to mock in tests
const mockStore = {
  items: signal([mockItem1, mockItem2]),
  loading: signal(false),
  loadItems: jasmine.createSpy()
};
```

### 2. Reusability
```typescript
// Multiple components can use the same store
export class ItemsListComponent {
  store = inject(ItemsStore);
}

export class ItemsChartComponent {
  store = inject(ItemsStore); // Same instance!
}
```

### 3. Performance
- Signals only trigger when values actually change
- Computed signals cache results
- No unnecessary re-renders

### 4. Type Safety
- Full TypeScript support
- State shape enforced at compile time
- No runtime errors from wrong state shape

## Patterns and Best Practices

### Loading States
```typescript
// Store handles loading state
loadItems(): void {
  this.updateState({ loading: true, error: null });
  this.api.list().subscribe({
    next: items => this.updateState({ items, loading: false }),
    error: err => this.updateState({ error: err.message, loading: false })
  });
}
```

### Optimistic Updates
```typescript
createItem(item: CreateItem): void {
  const optimisticItem = { ...item, id: 'temp' };
  
  // Update UI immediately
  this.state.update(s => ({ 
    ...s, 
    items: [optimisticItem, ...s.items] 
  }));
  
  // Then save to server
  this.api.create(item).subscribe({
    next: created => {
      // Replace temp with real item
      this.state.update(s => ({
        ...s,
        items: s.items.map(i => i.id === 'temp' ? created : i)
      }));
    },
    error: () => {
      // Rollback on error
      this.state.update(s => ({
        ...s,
        items: s.items.filter(i => i.id !== 'temp')
      }));
    }
  });
}
```

### Debouncing
```typescript
private searchSubject = new Subject<string>();

constructor() {
  this.searchSubject.pipe(
    debounceTime(300),
    takeUntilDestroyed()
  ).subscribe(query => {
    this.updateState({ searchQuery: query });
  });
}

setSearchQuery(query: string): void {
  this.searchSubject.next(query);
}
```

### Pagination
```typescript
private readonly state = signal<State>({
  items: [],
  currentPage: 1,
  pageSize: 20
});

readonly paginatedItems = computed(() => {
  const { items, currentPage, pageSize } = this.state();
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
});

setPage(page: number): void {
  this.updateState({ currentPage: page });
}
```

## When to Use

### Use Signal Store When:
- ✅ State is shared across multiple components
- ✅ You have complex derived state (filtering, sorting)
- ✅ You want better testability
- ✅ State logic is getting complex in components

### Don't Use When:
- ❌ Component-local state (use signals directly)
- ❌ Very simple CRUD with no derived state
- ❌ Form state (use Reactive Forms)

## Comparison with Other Solutions

### vs Component State
```typescript
// Component State - OK for simple cases
readonly items = signal<Item[]>([]);

// Store - Better for complex state
readonly store = inject(ItemsStore);
```

### vs NgRx
```typescript
// NgRx - More boilerplate, actions/reducers/effects
// Signal Store - Lighter, simpler, less boilerplate
```

### vs RxJS BehaviorSubject
```typescript
// BehaviorSubject - Need more code for computed values
private items$ = new BehaviorSubject<Item[]>([]);

// Signals - Built-in computed, better DX
readonly items = signal<Item[]>([]);
```

## Migration Path

### Step 1: Create Store
```typescript
@Injectable({ providedIn: 'root' })
export class ItemsStore {
  private readonly state = signal<ItemsState>({...});
  // ... add methods
}
```

### Step 2: Move State from Component
```typescript
// Before
export class Component {
  items = signal<Item[]>([]);
}

// After
export class Component {
  store = inject(ItemsStore);
}
```

### Step 3: Update Template
```html
<!-- Before -->
@for (item of items(); track item.id)

<!-- After -->
@for (item of store.items(); track item.id)
```

## Testing

### Store Tests
```typescript
describe('ItemsStore', () => {
  let store: ItemsStore;
  let httpMock: jasmine.SpyObj<HttpClient>;
  
  beforeEach(() => {
    httpMock = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        ItemsStore,
        { provide: HttpClient, useValue: httpMock }
      ]
    });
    store = TestBed.inject(ItemsStore);
  });
  
  it('should load items', () => {
    httpMock.get.and.returnValue(of([mockItem]));
    
    store.loadItems();
    
    expect(store.items()).toEqual([mockItem]);
    expect(store.loading()).toBe(false);
  });
});
```

### Component Tests
```typescript
describe('ItemsPageComponent', () => {
  let component: ItemsPageComponent;
  let mockStore: jasmine.SpyObj<ItemsStore>;
  
  beforeEach(() => {
    mockStore = jasmine.createSpyObj('ItemsStore', ['loadItems']);
    mockStore.items = signal([]);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: ItemsStore, useValue: mockStore }
      ]
    });
    
    component = TestBed.createComponent(ItemsPageComponent).componentInstance;
  });
  
  it('should load items on init', () => {
    component.ngOnInit();
    expect(mockStore.loadItems).toHaveBeenCalled();
  });
});
```

## Real-World Example

See `src/app/items/items.store.ts` for a complete implementation with:
- Loading/saving states
- Error handling
- Search with debouncing
- Sorting
- Filtering
- CRUD operations
- Optimistic updates

## Resources

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Signal-based Components Guide](https://angular.dev/guide/signals)
- [Computed Signals](https://angular.dev/guide/signals#computed-signals)

## Summary

Signal Stores provide a lightweight, type-safe, and performant way to manage state in Angular applications. They leverage the power of signals while keeping your code clean and testable.

**Key Takeaways:**
1. Keep state private, expose computed signals
2. Update state immutably
3. Use computed signals for derived state
4. Keep components thin and focused on UI
5. Store handles all business logic and API calls
