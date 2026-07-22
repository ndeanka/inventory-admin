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
import { ItemApiService } from './item-api.service';
import { InventoryItem } from './item.model';

@Component({
  selector: 'app-items-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './items-page.component.html',
  styleUrl: './items-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsPageComponent implements OnInit {
  private readonly api = inject(ItemApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<InventoryItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(64)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    quantityOnHand: [0, [Validators.required, Validators.min(0)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          this.items.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not reach inventory-api. Is it running on :8080?');
          this.loading.set(false);
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.api
      .create(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.items.update((rows) => [created, ...rows]);
          this.form.reset({ sku: '', name: '', quantityOnHand: 0, unitPrice: 0 });
          this.saving.set(false);
        },
        error: (err: { error?: { message?: string }; status?: number }) => {
          this.error.set(err.error?.message ?? `Create failed (${err.status ?? 'network'})`);
          this.saving.set(false);
        },
      });
  }
}
