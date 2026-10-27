import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  template: `
    @for (row of rowsArray; track $index) {
      <tr>
        @for (col of columnsArray; track $index) {
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

  get rowsArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get columnsArray(): number[] {
    return Array(this.columns).fill(0);
  }
}
