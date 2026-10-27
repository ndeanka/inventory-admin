import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="pagination" aria-label="Catalog pages">
      <p class="summary">{{ rangeStart }}–{{ rangeEnd }} of {{ totalItems }}</p>
      <label>
        Rows
        <select aria-label="Rows per page" [value]="pageSize" (change)="onPageSize($event)">
          @for (size of pageSizes; track size) {
            <option [value]="size">{{ size }}</option>
          }
        </select>
      </label>
      <button type="button" (click)="pageChange.emit(page - 1)" [disabled]="page <= 1">
        Previous
      </button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button type="button" (click)="pageChange.emit(page + 1)" [disabled]="page >= totalPages">
        Next
      </button>
    </nav>
  `,
  styles: [
    `
      .pagination {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .summary {
        margin: 0;
        color: #667780;
      }

      label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin: 0;
        font-size: 0.85rem;
      }

      select {
        border: 1px solid #c9c0b0;
        background: #fff;
        padding: 0.35rem 0.45rem;
        font: inherit;
      }

      button {
        border: 1px solid #1f2a2e;
        background: transparent;
        color: #1f2a2e;
        padding: 0.35rem 0.6rem;
        font: inherit;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input({ required: true }) page = 1;
  @Input({ required: true }) pageSize = 10;
  @Input({ required: true }) totalItems = 0;
  @Input() pageSizes = [5, 10, 25];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get rangeStart(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  onPageSize(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }
}
