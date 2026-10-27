import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableSkeletonComponent } from '../shared/components/table-skeleton.component';
import { InventoryItem } from './item.model';
import { ItemsStore } from './items.store';

@Component({
  selector: 'app-items-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, TableSkeletonComponent],
  templateUrl: './items-page.component.html',
  styleUrl: './items-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(ItemsStore);

  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(64)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    quantityOnHand: [0, [Validators.required, Validators.min(0)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(64)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    quantityOnHand: [0, [Validators.required, Validators.min(0)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.store.loadItems();
  }

  onSearchInput(value: string): void {
    this.store.setSearchQuery(value);
  }

  toggleSort(column: keyof InventoryItem): void {
    this.store.toggleSort(column);
  }

  reload(): void {
    this.store.loadItems();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store
      .createItem(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.reset({ sku: '', name: '', quantityOnHand: 0, unitPrice: 0 });
      });
  }

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
    const id = this.editingId();
    if (this.editForm.invalid || !id) {
      return;
    }

    this.store
      .updateItem(id, this.editForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.editingId.set(null);
        this.editForm.reset();
      });
  }

  confirmDelete(id: string): void {
    this.deletingId.set(id);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  deleteItem(): void {
    const id = this.deletingId();
    if (!id) {
      return;
    }

    this.store
      .deleteItem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.deletingId.set(null);
      });
  }
}
