# Quick Wins - Immediate Improvements

This document outlines tasks that can be completed quickly (< 2 hours each) for immediate value.

---

## Session 1: Code Quality Foundation (90 minutes)

### 1. Add ESLint + Prettier (20 minutes)

```bash
npm install -D eslint @angular-eslint/builder @angular-eslint/eslint-plugin \
  @angular-eslint/eslint-plugin-template @angular-eslint/schematics \
  @angular-eslint/template-parser @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser prettier eslint-config-prettier eslint-plugin-prettier
```

Create `.eslintrc.json`:
```json
{
  "root": true,
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:prettier/recommended"
      ],
      "rules": {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "warn"
      }
    },
    {
      "files": ["*.html"],
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:@angular-eslint/template/accessibility"
      ]
    }
  ]
}
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

Update `package.json`:
```json
{
  "scripts": {
    "lint": "ng lint",
    "format": "prettier --write \"src/**/*.{ts,html,scss,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss,json}\""
  }
}
```

Run: `npm run format && npm run lint`

---

### 2. Reorganize Folder Structure (15 minutes)

```bash
# Create core folders
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/services
mkdir -p src/app/shared/components
mkdir -p src/app/shared/utils

# Move interceptor
mv src/app/items/basic-auth.interceptor.ts src/app/core/interceptors/
```

Update `src/app/app.config.ts`:
```typescript
import { basicAuthInterceptor } from './core/interceptors/basic-auth.interceptor';
```

Test: `npm run build`

---

### 3. Add TypeScript Strict Mode (10 minutes)

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Fix any errors that appear.

---

### 4. Update CI to Include Linting (5 minutes)

Update `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: npm run lint        # ADD THIS
      - run: npm run build
```

---

### 5. Add Loading Skeleton (40 minutes)

Create `src/app/shared/components/skeleton-loader.component.ts`:
```typescript
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [NgStyle],
  template: `
    <div class="skeleton" [ngStyle]="{ width: width, height: height }"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  @Input() width = '100%';
  @Input() height = '20px';
}
```

Create `src/app/shared/components/table-skeleton.component.ts`:
```typescript
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  template: `
    @for (row of rows; track $index) {
      <tr>
        @for (col of columns; track $index) {
          <td><app-skeleton-loader [height]="'16px'" /></td>
        }
      </tr>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeletonComponent {
  @Input() rows = 5;
  @Input() columns = 4;
}
```

Update `src/app/items/items-page.component.html`:
```html
@if (loading()) {
  <app-table-skeleton />
} @else if (items().length === 0) {
  <p class="muted">No items yet.</p>
} @else {
  <table>
    <!-- existing table -->
  </table>
}
```

Update imports in `items-page.component.ts`:
```typescript
import { TableSkeletonComponent } from '../shared/components/table-skeleton.component';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, TableSkeletonComponent],
  // ...
})
```

---

## Session 2: Complete CRUD (2 hours)

### 1. Add Update & Delete API Methods (10 minutes)

Update `src/app/items/item-api.service.ts`:
```typescript
update(id: string, payload: CreateInventoryItem): Observable<InventoryItem> {
  return this.http.put<InventoryItem>(`${this.base}/${id}`, payload);
}

delete(id: string): Observable<void> {
  return this.http.delete<void>(`${this.base}/${id}`);
}
```

---

### 2. Add Edit Functionality (60 minutes)

Update `src/app/items/items-page.component.ts`:
```typescript
readonly editingId = signal<string | null>(null);
readonly editForm = this.fb.nonNullable.group({
  sku: ['', [Validators.required, Validators.maxLength(64)]],
  name: ['', [Validators.required, Validators.maxLength(200)]],
  quantityOnHand: [0, [Validators.required, Validators.min(0)]],
  unitPrice: [0, [Validators.required, Validators.min(0)]],
});

startEdit(item: InventoryItem): void {
  this.editingId.set(item.id);
  this.editForm.patchValue({
    sku: item.sku,
    name: item.name,
    quantityOnHand: item.quantityOnHand,
    unitPrice: item.unitPrice,
  });
}

cancelEdit(): void {
  this.editingId.set(null);
  this.editForm.reset();
}

saveEdit(): void {
  if (this.editForm.invalid || !this.editingId()) return;
  
  this.saving.set(true);
  this.error.set(null);
  
  this.api
    .update(this.editingId()!, this.editForm.getRawValue())
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updated) => {
        this.items.update(rows => 
          rows.map(item => item.id === updated.id ? updated : item)
        );
        this.editingId.set(null);
        this.editForm.reset();
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Update failed');
        this.saving.set(false);
      },
    });
}
```

Update template - replace table body:
```html
<tbody>
  @for (item of items(); track item.id) {
    <tr>
      @if (editingId() === item.id) {
        <td><input [formControl]="editForm.controls.sku" /></td>
        <td><input [formControl]="editForm.controls.name" /></td>
        <td><input type="number" [formControl]="editForm.controls.quantityOnHand" /></td>
        <td><input type="number" [formControl]="editForm.controls.unitPrice" step="0.01" /></td>
        <td>
          <button type="button" (click)="saveEdit()" [disabled]="saving()">Save</button>
          <button type="button" class="ghost" (click)="cancelEdit()">Cancel</button>
        </td>
      } @else {
        <td>{{ item.sku }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.quantityOnHand }}</td>
        <td>{{ item.unitPrice | currency: 'USD' }}</td>
        <td>
          <button type="button" class="ghost" (click)="startEdit(item)">Edit</button>
        </td>
      }
    </tr>
  }
</tbody>
```

Add table header:
```html
<thead>
  <tr>
    <th>SKU</th>
    <th>Name</th>
    <th>Qty</th>
    <th>Price</th>
    <th>Actions</th>
  </tr>
</thead>
```

---

### 3. Add Delete Functionality (30 minutes)

Update component:
```typescript
readonly deletingId = signal<string | null>(null);

confirmDelete(id: string): void {
  this.deletingId.set(id);
}

cancelDelete(): void {
  this.deletingId.set(null);
}

deleteItem(): void {
  const id = this.deletingId();
  if (!id) return;
  
  this.api
    .delete(id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.items.update(rows => rows.filter(item => item.id !== id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.error.set('Delete failed');
        this.deletingId.set(null);
      },
    });
}
```

Add to template (after table):
```html
@if (deletingId()) {
  <div class="modal-overlay" (click)="cancelDelete()">
    <div class="modal" (click)="$event.stopPropagation()">
      <h3>Confirm Delete</h3>
      <p>Are you sure you want to delete this item?</p>
      <div class="modal-actions">
        <button type="button" (click)="deleteItem()">Delete</button>
        <button type="button" class="ghost" (click)="cancelDelete()">Cancel</button>
      </div>
    </div>
  </div>
}
```

Add styles to `items-page.component.scss`:
```scss
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

td button {
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  margin-right: 0.25rem;
}
```

---

### 4. Add Delete Button to Table (10 minutes)

Update table row in template:
```html
<td>
  <button type="button" class="ghost" (click)="startEdit(item)">Edit</button>
  <button type="button" class="ghost" (click)="confirmDelete(item.id)">Delete</button>
</td>
```

---

## Session 3: Search & Sort (90 minutes)

### 1. Add Search Input (20 minutes)

Update component:
```typescript
readonly searchQuery = signal('');

readonly filteredItems = computed(() => {
  const query = this.searchQuery().toLowerCase();
  if (!query) return this.items();
  
  return this.items().filter(item =>
    item.sku.toLowerCase().includes(query) ||
    item.name.toLowerCase().includes(query)
  );
});
```

Add to template (before table):
```html
<div class="search-bar">
  <input 
    type="search" 
    placeholder="Search by SKU or name..." 
    [value]="searchQuery()"
    (input)="searchQuery.set($any($event.target).value)"
  />
</div>
```

Update table loop:
```html
@for (item of filteredItems(); track item.id) {
```

Add styles:
```scss
.search-bar {
  margin-bottom: 1rem;
  
  input {
    width: 100%;
    max-width: 400px;
  }
}
```

---

### 2. Add Sort Functionality (40 minutes)

Update component:
```typescript
readonly sortColumn = signal<keyof InventoryItem | null>(null);
readonly sortDirection = signal<'asc' | 'desc'>('asc');

readonly sortedAndFilteredItems = computed(() => {
  let items = this.filteredItems();
  const column = this.sortColumn();
  
  if (!column) return items;
  
  const direction = this.sortDirection();
  return [...items].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
});

toggleSort(column: keyof InventoryItem): void {
  if (this.sortColumn() === column) {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  } else {
    this.sortColumn.set(column);
    this.sortDirection.set('asc');
  }
}
```

Update template:
```html
<thead>
  <tr>
    <th (click)="toggleSort('sku')" class="sortable">
      SKU
      @if (sortColumn() === 'sku') {
        <span>{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
      }
    </th>
    <th (click)="toggleSort('name')" class="sortable">
      Name
      @if (sortColumn() === 'name') {
        <span>{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
      }
    </th>
    <th (click)="toggleSort('quantityOnHand')" class="sortable">
      Qty
      @if (sortColumn() === 'quantityOnHand') {
        <span>{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
      }
    </th>
    <th (click)="toggleSort('unitPrice')" class="sortable">
      Price
      @if (sortColumn() === 'unitPrice') {
        <span>{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
      }
    </th>
    <th>Actions</th>
  </tr>
</thead>
```

Update table loop:
```html
@for (item of sortedAndFilteredItems(); track item.id) {
```

Add styles:
```scss
th.sortable {
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  span {
    margin-left: 0.25rem;
  }
}
```

---

### 3. Add Debounce to Search (20 minutes)

Install rxjs utilities:
```typescript
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// In component
private searchSubject = new Subject<string>();

constructor() {
  this.searchSubject
    .pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(query => this.searchQuery.set(query));
}

onSearchInput(value: string): void {
  this.searchSubject.next(value);
}
```

Update template:
```html
<input 
  type="search" 
  placeholder="Search by SKU or name..." 
  (input)="onSearchInput($any($event.target).value)"
/>
```

---

## Session 4: Better Error Handling (60 minutes)

### 1. Create Notification Service (20 minutes)

Create `src/app/core/services/notification.service.ts`:
```typescript
import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);
  private idCounter = 0;

  show(message: string, type: Notification['type'] = 'info', duration = 5000): void {
    const notification: Notification = {
      id: this.idCounter++,
      type,
      message,
    };

    this.notifications.update(items => [...items, notification]);

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
    this.notifications.update(items => items.filter(n => n.id !== id));
  }
}
```

---

### 2. Create Notification Component (20 minutes)

Create `src/app/shared/components/notification.component.ts`:
```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    <div class="notification-container">
      @for (notification of notifications(); track notification.id) {
        <div class="notification notification--{{ notification.type }}">
          {{ notification.message }}
          <button (click)="service.remove(notification.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      
      button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin-left: 1rem;
        opacity: 0.7;
        
        &:hover {
          opacity: 1;
        }
      }
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
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  readonly service = inject(NotificationService);
  readonly notifications = this.service.notifications;
}
```

---

### 3. Integrate Notifications (20 minutes)

Update `src/app/app.component.ts`:
```typescript
import { NotificationComponent } from './shared/components/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  template: `
    <router-outlet />
    <app-notification />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
```

Update `src/app/items/items-page.component.ts`:
```typescript
import { NotificationService } from '../core/services/notification.service';

// In component class
private readonly notification = inject(NotificationService);

// In reload() success:
this.notification.success('Items loaded successfully');

// In reload() error:
this.notification.error('Could not reach inventory-api');

// In submit() success:
this.notification.success('Item created successfully');

// In submit() error:
this.notification.error(err.error?.message ?? 'Create failed');

// Similar for edit and delete
```

---

## Testing Quick Wins

Run these commands to verify everything works:

```bash
# Format and lint
npm run format
npm run lint

# Build
npm run build

# Start and test manually
npm start
```

Manual tests:
1. ✅ Create an item
2. ✅ Search for items
3. ✅ Sort by each column
4. ✅ Edit an item
5. ✅ Delete an item
6. ✅ Test notifications appear
7. ✅ Test loading skeleton shows

---

## Commit Messages

```bash
git add .
git commit -m "feat: add ESLint and Prettier configuration"

git commit -m "refactor: reorganize project structure"

git commit -m "feat: add loading skeleton component"

git commit -m "feat: implement edit functionality"

git commit -m "feat: implement delete functionality with confirmation"

git commit -m "feat: add search and sort to items table"

git commit -m "feat: add notification system for user feedback"

git commit -m "chore: update CI to include linting"
```

---

## Summary

After these quick wins, you'll have:

✅ Code quality tools (ESLint, Prettier)  
✅ Better project structure  
✅ Complete CRUD operations  
✅ Search and sort functionality  
✅ Loading skeletons  
✅ Toast notifications  
✅ Better error handling  
✅ Improved CI pipeline  

**Total time:** ~4-5 hours  
**Value delivered:** Core features complete with good UX
